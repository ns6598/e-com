import { prisma, dbStatus } from '../config/db.js'
import { successResponse, errorResponse } from '../utils/response.js'

const mockOrders = new Map()

/**
 * Create order
 * Endpoint: POST /api/orders
 */
export async function createOrder(req, res, next) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      state,
      postalCode,
      items,
      subtotal = 0,
      shipping = 0,
      discount = 0,
      paymentMethod = 'atelier_cod',
    } = req.body

    const calculatedSubtotal =
      subtotal || items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
    const grandTotal = Math.max(0, calculatedSubtotal + shipping - discount)
    const orderNumber = `AUR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

    const shippingAddress = { address, city, state, postalCode }
    const userId = req.user?.id || null

    let order = null

    if (dbStatus.isConnected && prisma) {
      try {
        order = await prisma.order.create({
          data: {
            orderNumber,
            userId,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            subtotal: calculatedSubtotal,
            shipping,
            discount,
            total: grandTotal,
            paymentMethod,
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                size: i.size || null,
                color: i.color || null,
                image: i.image || null,
              })),
            },
          },
          include: { items: true },
        })
      } catch (err) {
        console.warn('[Orders Controller] Database write fallback:', err.message)
      }
    }

    if (!order) {
      order = {
        id: `mock-order-${Date.now()}`,
        orderNumber,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items,
        subtotal: calculatedSubtotal,
        shipping,
        discount,
        total: grandTotal,
        paymentMethod,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      mockOrders.set(orderNumber, order)
      mockOrders.set(order.id, order)
    }

    return successResponse(res, {
      message: 'Atelier acquisition finalized successfully',
      data: order,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get order by ID or orderNumber
 * Endpoint: GET /api/orders/:id
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ id }, { orderNumber: id }],
          },
          include: { items: true },
        })
        if (order) {
          return successResponse(res, {
            message: 'Order retrieved from database',
            data: order,
          })
        }
      } catch (err) {
        console.warn('[Orders Controller] Database query fallback:', err.message)
      }
    }

    const order = mockOrders.get(id)
    if (!order) {
      return errorResponse(res, {
        message: `Order reference '${id}' not found in archive`,
        code: 'ORDER_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Order retrieved successfully',
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * List orders
 * Endpoint: GET /api/orders
 * If admin: lists all atelier orders
 * If customer: lists orders for current user
 */
export async function listOrders(req, res, next) {
  try {
    const user = req.user
    const isAdmin = user.role === 'ADMIN'

    if (dbStatus.isConnected && prisma) {
      try {
        const where = isAdmin
          ? {}
          : {
              OR: [
                { userId: user.id },
                { customerEmail: { equals: user.email, mode: 'insensitive' } },
              ],
            }

        const orders = await prisma.order.findMany({
          where,
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        })

        return successResponse(res, {
          message: `Retrieved ${orders.length} order records`,
          data: orders,
        })
      } catch (err) {
        console.warn('[Orders Controller] Database query fallback:', err.message)
      }
    }

    // In-memory orders filter
    const allOrders = Array.from(mockOrders.values()).filter(
      (order, index, self) => self.findIndex((o) => o.orderNumber === order.orderNumber) === index
    )

    const filtered = isAdmin
      ? allOrders
      : allOrders.filter(
          (o) =>
            o.userId === user.id ||
            (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase())
        )

    return successResponse(res, {
      message: `Retrieved ${filtered.length} order acquisitions`,
      data: filtered,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update order status
 * Endpoint: PATCH /api/orders/:id/status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['PENDING', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return errorResponse(res, {
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS',
        statusCode: 400,
      })
    }

    if (dbStatus.isConnected && prisma) {
      try {
        const updated = await prisma.order.update({
          where: { id },
          data: { status },
          include: { items: true },
        })

        return successResponse(res, {
          message: `Order status upgraded to ${status}`,
          data: updated,
        })
      } catch (err) {
        console.warn('[Orders Controller] Database update fallback:', err.message)
      }
    }

    let order = mockOrders.get(id)
    if (!order) {
      // Try finding by orderNumber
      order = Array.from(mockOrders.values()).find((o) => o.id === id || o.orderNumber === id)
    }

    if (!order) {
      return errorResponse(res, {
        message: `Order reference '${id}' not found`,
        code: 'ORDER_NOT_FOUND',
        statusCode: 404,
      })
    }

    order.status = status
    order.updatedAt = new Date().toISOString()
    mockOrders.set(order.id, order)
    mockOrders.set(order.orderNumber, order)

    return successResponse(res, {
      message: `Order status modified to ${status}`,
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

