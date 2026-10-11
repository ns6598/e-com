# AUREVA — REST API Specification & Endpoint Documentation

> Base URL: `http://localhost:5000/api`  
> All responses return standard JSON structures with `success`, `message`, and `data` (or `error`).

---

## 🏛️ Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "message": "Human-readable confirmation",
  "data": { ... }
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    "code": "ERROR_CODE",
    "details": null
  }
}
```

---

## 🛍️ 1. Product & Category API

### `GET /api/categories`
Retrieves all product taxonomy categories with item counts.
- **Auth**: None
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "cat-1",
      "name": "Coats",
      "slug": "coats",
      "department": "Women",
      "description": "Architectural outerwear and wool envelopes.",
      "image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85",
      "productsCount": 4
    }
  ]
}
```

---

### `GET /api/products`
Retrieves catalog products with pagination, search, category, sizes, colors, price range, sale filter, and sorting.
- **Auth**: None (public requests only receive active products: `isActive: true`)
- **Query Parameters**:
  - `page` *(number, default: 1)*: Page number
  - `limit` *(number, default: 12, max: 100)*: Items per page
  - `search` *(string)*: Case-insensitive search on title, description, or subtitle
  - `category` *(string)*: Category slug or name
  - `department` *(string)*: Department filter (`Women`, `Men`, `Accessories`)
  - `size` *(string)*: Filter by size (`XS`, `S`, `M`, `L`, `XL`, `One Size`)
  - `color` *(string)*: Filter by color name
  - `minPrice` *(number)*: Minimum price filter
  - `maxPrice` *(number)*: Maximum price filter
  - `isSale` *(boolean)*: Filter silhouettes on sale
  - `sort` *(enum)*: `price-asc`, `price-desc`, `newest`, `popularity`, `featured`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Retrieved 12 silhouettes (total: 20)",
  "data": {
    "items": [
      {
        "id": "aur-01",
        "name": "Sculptural Wool Cocoon Coat",
        "slug": "sculptural-wool-cocoon-coat",
        "subtitle": "Double-faced virgin wool cocoon coat",
        "description": "An imposing silhouette forged from double-faced Australian virgin wool...",
        "category": "Coats",
        "department": "Women",
        "price": 4899,
        "originalPrice": 5999,
        "inStock": true,
        "stock": 14,
        "isNew": true,
        "isFeatured": true,
        "isSale": true,
        "tag": "Runway Monograph",
        "materials": "100% Double-Faced Virgin Wool",
        "details": ["Drop shoulder cut", "Horn buttons", "Satin pocket bags"],
        "images": ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85"],
        "sizes": ["XS", "S", "M", "L"],
        "colors": [{ "name": "Noir Charcoal" }],
        "variants": [
          {
            "id": "var-uuid",
            "size": "M",
            "color": "Noir Charcoal",
            "sku": "AUR-AUR01-M-NOI",
            "stockQuantity": 8
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 20,
      "totalPages": 2,
      "hasMore": true
    }
  }
}
```

---

### `GET /api/products/:id`
Retrieves a single product by unique ID or slug.
- **Auth**: None
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "aur-01",
    "name": "Sculptural Wool Cocoon Coat",
    "slug": "sculptural-wool-cocoon-coat",
    "price": 4899,
    "variants": [ ... ],
    "images": [ ... ]
  }
}
```

---

### `GET /api/products/slug/:slug`
Retrieves a single product specifically by unique slug identifier.
- **Auth**: None
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "aur-01",
    "slug": "sculptural-wool-cocoon-coat",
    "name": "Sculptural Wool Cocoon Coat"
  }
}
```

---

## 🔐 2. Authentication API

### `POST /api/auth/register`
Creates a new patron account with bcrypt password hashing and issues an `httpOnly` cookie.
- **Request Body**:
```json
{
  "email": "patron@example.com",
  "password": "Password2026!",
  "name": "Genevieve Laurent"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Atelier salon account created successfully",
  "data": {
    "user": {
      "id": "usr-uuid",
      "email": "patron@example.com",
      "name": "Genevieve Laurent",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/auth/login`
Authenticates user, verifies bcrypt hash, and issues session cookie. Protected by rate limiting.
- **Request Body**:
```json
{
  "email": "patron@example.com",
  "password": "Password2026!"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Successfully authenticated to AUREVA Salon",
  "data": {
    "user": {
      "id": "usr-uuid",
      "email": "patron@example.com",
      "name": "Genevieve Laurent",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/auth/logout`
Clears session `aureva_token` cookie.
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Signed out of salon session successfully"
}
```

---

### `GET /api/auth/me`
Retrieves current authenticated patron profile.
- **Auth**: Required (`Cookie` or `Bearer <token>`)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Active session user profile",
  "data": {
    "user": {
      "id": "usr-uuid",
      "email": "patron@example.com",
      "name": "Genevieve Laurent",
      "role": "CUSTOMER"
    }
  }
}
```

---

## 👤 3. Customer Profile & Addresses API

### `GET /api/users/me`
Retrieves authenticated customer profile with all saved delivery addresses.
- **Auth**: Required
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Patron profile retrieved",
  "data": {
    "id": "usr-uuid",
    "email": "patron@example.com",
    "name": "Genevieve Laurent",
    "role": "CUSTOMER",
    "addresses": [
      {
        "id": "addr-uuid",
        "name": "Genevieve Laurent",
        "phone": "+33 6 12 34 56 78",
        "addressLine1": "14 Place Vendôme",
        "city": "Paris",
        "state": "Île-de-France",
        "postalCode": "75001",
        "isDefault": true
      }
    ]
  }
}
```

---

### `PATCH /api/users/me`
Updates user profile information (name, phone).
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Genevieve de Laurent",
  "phone": "+33 6 12 34 56 78"
}
```

---

### `GET /api/users/me/addresses`
Lists all delivery addresses belonging to the authenticated user.
- **Auth**: Required

---

### `POST /api/users/me/addresses`
Creates a new delivery address for the authenticated user.
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Genevieve de Laurent",
  "phone": "+33 6 12 34 56 78",
  "addressLine1": "14 Place Vendôme",
  "city": "Paris",
  "state": "Île-de-France",
  "postalCode": "75001",
  "isDefault": true
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Delivery address created successfully",
  "data": {
    "id": "addr-uuid",
    "addressLine1": "14 Place Vendôme",
    "city": "Paris"
  }
}
```

---

### `PATCH /api/users/me/addresses/:addressId`
Updates address attributes. Enforces ownership check (403 if address belongs to another user).
- **Auth**: Required

---

### `DELETE /api/users/me/addresses/:addressId`
Deletes address record. Enforces ownership check (403 if address belongs to another user).
- **Auth**: Required

---

## 🛒 4. Cart API

### `GET /api/cart`
Retrieves shopping bag items for the authenticated user or active guest session.
- **Auth**: Optional (`x-session-id` header supported for guest sessions)
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "id": "cart-uuid",
    "items": [
      {
        "id": "item-uuid",
        "variantId": "var-uuid",
        "quantity": 2,
        "variant": {
          "size": "M",
          "color": "Noir Charcoal",
          "stockQuantity": 8,
          "product": { "name": "Sculptural Wool Cocoon Coat", "basePrice": 4899 }
        }
      }
    ]
  }
}
```

---

### `POST /api/cart/items`
Adds a product variant to the cart. Validates available stock and prevents duplicate lines by incrementing quantity.
- **Request Body**:
```json
{
  "variantId": "var-uuid",
  "quantity": 1
}
```

---

### `PATCH /api/cart/items/:itemId`
Updates quantity of a cart item. Enforces cart ownership and stock availability.
- **Request Body**:
```json
{
  "quantity": 3
}
```

---

### `DELETE /api/cart/items/:itemId`
Removes an item line from the cart. Enforces cart ownership.

---

## 🖤 5. Wishlist API

### `GET /api/wishlist`
Retrieves saved silhouettes for the authenticated user.
- **Auth**: Required

---

### `POST /api/wishlist/items`
Adds a product silhouette to the user's wishlist (prevents duplicate entries).
- **Auth**: Required
- **Request Body**:
```json
{
  "productId": "aur-01"
}
```

---

### `DELETE /api/wishlist/items/:productId`
Removes a product from the user's wishlist.
- **Auth**: Required

---

### `POST /api/wishlist/toggle`
Convenience toggle endpoint: Adds item if absent, removes if already present.
- **Auth**: Required

---

## 🎟️ 6. Coupon API

### `POST /api/coupons/validate`
Validates coupon code against database/rules, checking active status, date range, usage limit, and minimum order threshold. Calculates exact discount using server-side Decimal precision.
- **Auth**: None
- **Request Body**:
```json
{
  "code": "AUREVA15",
  "subtotal": 3000
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "15% Courtesy Privilege on Inaugural Salon Orders applied (-₹450).",
  "data": {
    "valid": true,
    "code": "AUREVA15",
    "discount": 450,
    "percentage": 15,
    "description": "15% Courtesy Privilege on Inaugural Salon Orders"
  }
}
```

---

## 📦 7. Order API

### `POST /api/orders`
Places a new order with atomic stock decrements and server-side financial calculations.
- **Auth**: Required (Customer)
- **Headers**: Optional `x-idempotency-key` for duplicate submission protection
- **Request Body**:
```json
{
  "items": [
    {
      "productId": "aur-01",
      "quantity": 2,
      "size": "M",
      "color": "Noir Charcoal"
    }
  ],
  "shippingAddress": {
    "name": "Genevieve de Laurent",
    "phone": "+33 6 12 34 56 78",
    "addressLine1": "14 Place Vendôme",
    "city": "Paris",
    "state": "Île-de-France",
    "postalCode": "75001"
  },
  "couponCode": "AUREVA15",
  "paymentMethod": "atelier_cod"
}
```
- **Server Guarantees**:
  1. Authoritative price lookup: Client-submitted prices are ignored; authoritative prices are pulled from PostgreSQL.
  2. Inventory protection: Validates stock inside `prisma.$transaction` and decrements quantity atomically.
  3. Immutable snapshots: Product name, SKU, unit price, quantity, size, and color are snapshotted into `OrderItem`.
  4. Idempotency: Duplicate calls with the same key return the established order without recharging or double-decrementing stock.
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Atelier acquisition finalized successfully",
  "data": {
    "id": "order-uuid",
    "orderReference": "AUR-2026-891042",
    "orderStatus": "PENDING",
    "paymentStatus": "PENDING",
    "subtotal": 9798,
    "discount": 1469.70,
    "shipping": 0,
    "total": 8328.30,
    "items": [
      {
        "productName": "Sculptural Wool Cocoon Coat",
        "sku": "AUR-AUR01-M-NOI",
        "unitPrice": 4899,
        "quantity": 2,
        "totalPrice": 9798
      }
    ]
  }
}
```

---

### `GET /api/orders`
Lists all order acquisitions placed by the authenticated customer.
- **Auth**: Required (Customer can only see their own orders; Admin sees all orders)

---

### `GET /api/orders/:id`
Retrieves a single order by ID or `AUR-` reference number. Enforces customer ownership (403 Forbidden if accessed by another user).
- **Auth**: Required

---

## ⚡ 8. Admin API

All routes under `/api/admin/*` require `requireAuth` + `requireAdmin` (verifying role === 'ADMIN' directly from database). Non-admin users receive `403 Forbidden`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/products` | Lists all products (including inactive items) |
| `POST` | `/api/admin/products` | Creates new silhouette with variants and images |
| `PATCH` | `/api/admin/products/:id` | Updates product attributes and active status |
| `DELETE` | `/api/admin/products/:id` | Deletes product |
| `POST` | `/api/admin/products/:productId/variants` | Creates variant for a product |
| `PATCH` | `/api/admin/variants/:id/stock` | Directly adjusts stock level for variant |
| `GET` | `/api/admin/categories` | Lists all categories |
| `POST` | `/api/admin/categories` | Creates category |
| `PATCH` | `/api/admin/categories/:id` | Updates category |
| `DELETE` | `/api/admin/categories/:id` | Deletes category |
| `GET` | `/api/admin/orders` | Lists all orders across all patrons |
| `PATCH` | `/api/admin/orders/:id/status` | Updates `orderStatus` and `paymentStatus` |
| `GET` | `/api/admin/coupons` | Lists all active and inactive coupons |
| `POST` | `/api/admin/coupons` | Creates promotional coupon |
| `PATCH` | `/api/admin/coupons/:id` | Updates coupon parameters |
| `DELETE` | `/api/admin/coupons/:id` | Deletes coupon |
