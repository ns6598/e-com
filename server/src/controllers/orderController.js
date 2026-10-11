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
