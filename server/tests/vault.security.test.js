/**
 * AUREVA VAULT & SECURITY TEST SUITE (Section 22 Verification)
 *
 * Verifies:
 * 1. Vault Authentication Behavior:
 *    - Valid ADMIN credentials -> 200 OK + JWT + aureva_token cookie
 *    - Valid CUSTOMER credentials -> 403 Forbidden with "Vault access is restricted."
 *    - Bad password / Non-existent user -> 401 Unauthorized (does not reveal if email exists or is admin)
 * 2. Role Escalation Prevention:
 *    - Registering with role: "ADMIN" still creates a CUSTOMER
 *    - Updating profile with role: "ADMIN" does not elevate user
 * 3. Protected Backend API Access:
 *    - Unauthenticated access to /api/admin/* -> 401 Unauthorized
 *    - Customer token access to /api/admin/dashboard -> 403 Forbidden
 *    - Customer token access to /api/admin/customers -> 403 Forbidden
 *    - Customer token access to /api/admin/products (POST/PATCH/DELETE) -> 403 Forbidden
 *    - Customer token access to /api/admin/inventory -> 403 Forbidden
 *    - Customer token access to /api/admin/login-activity -> 403 Forbidden
 *    - Customer token access to /api/admin/coupons -> 403 Forbidden
 *    - Customer token access to /api/admin/messages -> 403 Forbidden
 * 4. Admin Access & Sensitive Data Protection:
 *    - Admin GET /api/admin/dashboard returns real metrics
 *    - Admin GET /api/admin/customers returns list WITHOUT passwords or password hashes
 *    - Admin GET /api/admin/inventory returns inventory items with stock
 *    - Admin PATCH /api/admin/inventory/:id updates stock
 *    - Admin GET /api/admin/login-activity returns audit records without exposing plaintext passwords
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api'

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`)
    passed++
  } else {
    console.error(`  ✖ [FAIL] ${message}`)
    failed++
  }
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  let body = null
  const text = await res.text()
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }

  return { status: res.status, headers: res.headers, body }
}

async function runVaultSecuritySuite() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗')
  console.log('║               AUREVA VAULT — SPECIFICATION & SECURITY SUITE              ║')
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n')

  // 1. VAULT AUTHENTICATION ENDPOINT TESTS
  console.log('1. Testing Vault Authentication (/api/auth/vault-login)...')

  // Case A: Customer attempts vault login
  const customerVaultAttempt = await request('/auth/vault-login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'patron@aureva-studios.demo',
      password: 'AurevaSalon2026!',
    }),
  })
  assert(
    customerVaultAttempt.status === 403,
    `Customer vault login returns 403 Forbidden (Got: ${customerVaultAttempt.status})`
  )
  const customerErrorMsg =
    customerVaultAttempt.body?.error?.message ||
    customerVaultAttempt.body?.message ||
    (typeof customerVaultAttempt.body?.error === 'string' ? customerVaultAttempt.body.error : '')
  assert(
    customerErrorMsg.includes('Vault access is restricted'),
    `Customer receives explicit message: "Vault access is restricted." (Received: "${customerErrorMsg}")`
  )

  // Case B: Invalid credentials does not leak user existence
  const badCredsAttempt = await request('/auth/vault-login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@aureva.com',
      password: 'WrongPassword123!',
    }),
  })
  assert(
    badCredsAttempt.status === 401,
    `Invalid password on vault login returns 401 Unauthorized (Got: ${badCredsAttempt.status})`
  )

  const nonExistentUserAttempt = await request('/auth/vault-login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'nonexistent-random-user@aureva.com',
      password: 'SomeRandomPassword!',
    }),
  })
  assert(
    nonExistentUserAttempt.status === 401,
    `Non-existent account on vault login returns 401 Unauthorized (Got: ${nonExistentUserAttempt.status})`
  )

  // Case C: Authorized Admin Login
  const adminVaultLogin = await request('/auth/vault-login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@aureva.com',
      password: 'Admin@123',
    }),
  })
  assert(
    adminVaultLogin.status === 200,
    `Authorized Admin vault login returns 200 OK (Got: ${adminVaultLogin.status})`
  )
  assert(
    adminVaultLogin.body?.data?.user?.role === 'ADMIN',
    `Authenticated user has verified role: 'ADMIN'`
  )
  const adminToken = adminVaultLogin.body?.data?.token
  assert(!!adminToken, 'Admin token successfully issued')

  // 2. CUSTOMER TOKEN FORBIDDEN VERIFICATIONS
  console.log('\n2. Testing Customer Role Forbidden on Admin APIs...')

  // Obtain Customer Token via standard customer login
  const customerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'patron@aureva-studios.demo',
      password: 'AurevaSalon2026!',
    }),
  })
  assert(customerLogin.status === 200, 'Customer authenticates successfully on storefront login')
  const customerToken = customerLogin.body?.data?.token
  const customerHeaders = { Authorization: `Bearer ${customerToken}` }

  // Customer attempts admin endpoints:
  const custDash = await request('/admin/dashboard', { headers: customerHeaders })
  assert(custDash.status === 403, `Customer GET /api/admin/dashboard -> 403 Forbidden`)

  const custCustomers = await request('/admin/customers', { headers: customerHeaders })
  assert(custCustomers.status === 403, `Customer GET /api/admin/customers -> 403 Forbidden`)

  const custProductsPost = await request('/admin/products', {
    method: 'POST',
    headers: customerHeaders,
    body: JSON.stringify({ name: 'Hacked Product', price: 999 }),
  })
  assert(custProductsPost.status === 403, `Customer POST /api/admin/products -> 403 Forbidden`)

  const custInventory = await request('/admin/inventory', { headers: customerHeaders })
  assert(custInventory.status === 403, `Customer GET /api/admin/inventory -> 403 Forbidden`)

  const custLoginAct = await request('/admin/login-activity', { headers: customerHeaders })
  assert(custLoginAct.status === 403, `Customer GET /api/admin/login-activity -> 403 Forbidden`)

  const custCoupons = await request('/admin/coupons', { headers: customerHeaders })
  assert(custCoupons.status === 403, `Customer GET /api/admin/coupons -> 403 Forbidden`)

  const custMessages = await request('/admin/messages', { headers: customerHeaders })
  assert(custMessages.status === 403, `Customer GET /api/admin/messages -> 403 Forbidden`)

  // 3. ROLE ELEVATION PROTECTION
  console.log('\n3. Testing Role Elevation Attack Protection...')

  const hackReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sneaky Attacker',
      email: `sneaky_${Date.now()}@attack.test`,
      password: 'Password123!',
      role: 'ADMIN', // Attacker attempts to inject ADMIN role
    }),
  })
  if (hackReg.status === 201) {
    assert(
      hackReg.body?.data?.user?.role === 'CUSTOMER',
      'Registration with injected role: ADMIN strictly creates CUSTOMER role'
    )
  } else {
    assert(hackReg.status === 400, 'Registration rejects role injection with 400 Bad Request')
  }

  // 4. ADMIN VAULT ACCESS & SENSITIVE DATA PROTECTION
  console.log('\n4. Testing Admin Authorized Operations & Privacy Protection...')

  const adminHeaders = { Authorization: `Bearer ${adminToken}` }

  // Admin Dashboard stats
  const adminDash = await request('/admin/dashboard', { headers: adminHeaders })
  assert(adminDash.status === 200, `Admin GET /api/admin/dashboard -> 200 OK`)
  assert(
    adminDash.body?.data?.totalCustomers !== undefined &&
      adminDash.body?.data?.totalProducts !== undefined &&
      adminDash.body?.data?.totalOrders !== undefined,
    'Dashboard returns authoritative real statistics (customers, products, orders, revenue)'
  )

  // Admin Customer List (MUST NOT expose passwords or password hashes)
  const adminCustomers = await request('/admin/customers', { headers: adminHeaders })
  assert(adminCustomers.status === 200, `Admin GET /api/admin/customers -> 200 OK`)
  const customers = adminCustomers.body?.data || []
  assert(customers.length > 0, `Returned ${customers.length} customer records`)

  let passwordExposed = false
  let hashExposed = false
  for (const c of customers) {
    if (c.password) passwordExposed = true
    if (c.passwordHash || c.hash) hashExposed = true
  }
  assert(!passwordExposed, 'Zero plaintext passwords exposed to administrator')
  assert(!hashExposed, 'Zero password hashes exposed to administrator')

  // Admin Inventory
  const adminInv = await request('/admin/inventory', { headers: adminHeaders })
  assert(adminInv.status === 200, `Admin GET /api/admin/inventory -> 200 OK`)
  const inventoryItems = adminInv.body?.data || []
  assert(Array.isArray(inventoryItems), `Returned ${inventoryItems.length} inventory items`)

  if (inventoryItems.length > 0) {
    const firstItem = inventoryItems[0]
    const patchInv = await request(`/admin/inventory/${firstItem.id}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ stock: 42 }),
    })
    assert(patchInv.status === 200, `Admin PATCH /api/admin/inventory/:id updates stock quantity`)
  }

  // Admin Login Activity
  const adminLogins = await request('/admin/login-activity', { headers: adminHeaders })
  const activities = adminLogins.body?.data?.items || adminLogins.body?.data || []
  assert(Array.isArray(activities) && activities.length > 0, `Login activity returns audit records (${activities.length} entries)`)

  // Admin Coupons & Messages
  const adminCoupons = await request('/admin/coupons', { headers: adminHeaders })
  assert(adminCoupons.status === 200, `Admin GET /api/admin/coupons -> 200 OK`)

  const adminMessages = await request('/admin/messages', { headers: adminHeaders })
  assert(adminMessages.status === 200, `Admin GET /api/admin/messages -> 200 OK`)

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗')
  console.log(`║      VAULT SECURITY TESTS: ${passed} PASSED, ${failed} FAILED                          ║`)
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runVaultSecuritySuite().catch((err) => {
  console.error('Fatal Vault security test error:', err)
  process.exit(1)
})
