import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma, dbStatus } from '../config/db.js'
import config from '../config/env.js'
import { successResponse, errorResponse } from '../utils/response.js'

// In-memory fallback user registry for development when Postgres connection is pending
const mockUsers = new Map()

// Pre-seed demo customer and admin credentials
const defaultCustomerPassword = bcrypt.hashSync('AurevaSalon2026!', 10)
const defaultAdminPassword = bcrypt.hashSync('AurevaAdmin2026!', 10)

mockUsers.set('patron@aureva-studios.demo', {
  id: 'usr-patron-demo',
  email: 'patron@aureva-studios.demo',
  password: defaultCustomerPassword,
  name: 'Elena Rostova',
  role: 'CUSTOMER',
  phone: '+91 98765 43210',
  address: '42 Rue du Faubourg Saint-Honoré',
  city: 'Paris',
  state: 'Île-de-France',
  postalCode: '75008',
  createdAt: new Date('2026-01-01').toISOString(),
})

mockUsers.set('curator@aureva-studios.demo', {
  id: 'usr-admin-curator',
  email: 'curator@aureva-studios.demo',
  password: defaultAdminPassword,
  name: 'Henri de Montmirail',
  role: 'ADMIN',
  phone: '+91 98765 00000',
  address: 'AUREVA Flagship Atelier',
  city: 'Paris',
  state: 'Île-de-France',
  postalCode: '75001',
  createdAt: new Date('2026-01-01').toISOString(),
})

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'CUSTOMER',
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

function setAuthCookie(res, token) {
  res.cookie('aureva_token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}


/**
 * Register new user
 * Endpoint: POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    const hashedPassword = await bcrypt.hash(password, 10)

    let user = null

    if (dbStatus.isConnected && prisma) {
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
      if (existing) {
        return errorResponse(res, {
          message: 'An account with this email address already exists',
          code: 'EMAIL_ALREADY_EXISTS',
          statusCode: 409,
        })
      }

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name || null,
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      })
    } else {
      if (mockUsers.has(normalizedEmail)) {
        return errorResponse(res, {
          message: 'An account with this email address already exists',
          code: 'EMAIL_ALREADY_EXISTS',
          statusCode: 409,
        })
      }

      user = {
        id: `mock-user-${Date.now()}`,
        email: normalizedEmail,
        password: hashedPassword,
        name: name || 'Atelier Patron',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      }
      mockUsers.set(normalizedEmail, user)
    }

    const token = generateToken(user)
    setAuthCookie(res, token)

    return successResponse(res, {
      message: 'Atelier salon account created successfully',
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      },
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Login user
 * Endpoint: POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    let user = null

    if (dbStatus.isConnected && prisma) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
    } else {
      user = mockUsers.get(normalizedEmail)
    }

    if (!user) {
      return errorResponse(res, {
        message: 'Invalid credentials provided',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return errorResponse(res, {
        message: 'Invalid credentials provided',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      })
    }

    const token = generateToken(user)
    setAuthCookie(res, token)

    return successResponse(res, {
      message: 'Successfully authenticated to AUREVA Salon',
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Logout user
 * Endpoint: POST /api/auth/logout
 */
export function logout(req, res) {
  res.clearCookie('aureva_token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
  })

  return successResponse(res, {
    message: 'Signed out of salon session successfully',
  })
}

/**
 * Get current authenticated user
 * Endpoint: GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    let userDetails = { ...req.user }

    if (dbStatus.isConnected && prisma) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { id: true, email: true, name: true, role: true, createdAt: true },
        })
        if (dbUser) userDetails = dbUser
      } catch (err) {
        console.warn('[AuthController] DB user lookup fallback:', err.message)
      }
    } else {
      const mock = Array.from(mockUsers.values()).find((u) => u.id === req.user.id || u.email === req.user.email)
      if (mock) {
        userDetails = {
          id: mock.id,
          email: mock.email,
          name: mock.name,
          role: mock.role,
          phone: mock.phone,
          address: mock.address,
          city: mock.city,
          state: mock.state,
          postalCode: mock.postalCode,
          createdAt: mock.createdAt,
        }
      }
    }

    return successResponse(res, {
      message: 'Active session user profile',
      data: {
        user: userDetails,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update authenticated user profile
 * Endpoint: PUT /api/auth/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, phone, address, city, state, postalCode } = req.body
    const userId = req.user.id

    if (dbStatus.isConnected && prisma) {
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { name },
          select: { id: true, email: true, name: true, role: true },
        })
        return successResponse(res, {
          message: 'Atelier profile updated successfully',
          data: { user: updated },
        })
      } catch (err) {
        console.warn('[AuthController] DB profile update fallback:', err.message)
      }
    }

    const mock = Array.from(mockUsers.values()).find((u) => u.id === userId || u.email === req.user.email)
    if (mock) {
      if (name) mock.name = name
      if (phone) mock.phone = phone
      if (address) mock.address = address
      if (city) mock.city = city
      if (state) mock.state = state
      if (postalCode) mock.postalCode = postalCode
      return successResponse(res, {
        message: 'Patron profile preferences updated',
        data: {
          user: {
            id: mock.id,
            email: mock.email,
            name: mock.name,
            role: mock.role,
            phone: mock.phone,
            address: mock.address,
            city: mock.city,
            state: mock.state,
            postalCode: mock.postalCode,
          },
        },
      })
    }

    return errorResponse(res, {
      message: 'User profile not found',
      code: 'USER_NOT_FOUND',
      statusCode: 404,
    })
  } catch (error) {
    next(error)
  }
}

