import { Prisma } from '@prisma/client'
import { prisma, dbStatus } from '../config/db.js'
import { successResponse, errorResponse } from '../utils/response.js'

const mockOrders = new Map()

/**
 * Format order record for frontend consumption (handles both Prisma Decimal models and mock items)
 */
function formatOrderResponse(order) {
  if (!order) return null
  return {
    id: order.id,
    orderReference: order.orderReference || order.orderNumber,
    orderNumber: order.orderReference || order.orderNumber, // Backward compatibility
    userId: order.userId || null,
    customerName: order.customerName || (order.shippingAddress?.name ?? ''),
    customerEmail: order.customerEmail || '',
    customerPhone: order.customerPhone || (order.shippingAddress?.phone ?? ''),
    orderStatus: order.orderStatus || order.status || 'PENDING',
    status: order.orderStatus || order.status || 'PENDING', // Backward compatibility
    paymentStatus: order.paymentStatus || 'PENDING',
    paymentMethod: order.paymentMethod || 'atelier_cod',
    shippingAddress: order.shippingAddress,
    subtotal: typeof order.subtotal === 'object' && order.subtotal !== null ? Number(order.subtotal) : order.subtotal,
    discount: typeof order.discount === 'object' && order.discount !== null ? Number(order.discount) : (order.discount || 0),
    shipping: typeof order.shipping === 'object' && order.shipping !== null ? Number(order.shipping) : (order.shipping || 0),
    total: typeof order.total === 'object' && order.total !== null ? Number(order.total) : order.total,
    items: (order.items || []).map((item) => ({
      id: item.id,
      productId: item.productId || item.variant?.productId || null,
      name: item.productName || item.name,
      productName: item.productName || item.name,
      sku: item.sku || 'AUR-STD',
      size: item.size,
      color: item.color,
      price: typeof item.unitPrice === 'object' && item.unitPrice !== null ? Number(item.unitPrice) : (item.price || Number(item.unitPrice) || 0),
      unitPrice: typeof item.unitPrice === 'object' && item.unitPrice !== null ? Number(item.unitPrice) : (item.price || Number(item.unitPrice) || 0),
      quantity: item.quantity,
      totalPrice: typeof item.totalPrice === 'object' && item.totalPrice !== null ? Number(item.totalPrice) : (item.quantity * (item.price || Number(item.unitPrice) || 0)),
      image: item.image,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

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
      items = [],
      shipping = 0,
      discount = 0,
      paymentMethod = 'atelier_cod',
    } = req.body

    if (!items || items.length === 0) {
      return errorResponse(res, {
        message: 'Order must contain at least one silhouette item.',
        code: 'EMPTY_ORDER',
        statusCode: 400,
      })
    }

    // Decimal-safe calculations to avoid floating-point errors
    let subtotalDec = new Prisma.Decimal(0)
    for (const item of items) {
      const itemUnitPrice = new Prisma.Decimal(item.price || 0)
      const itemQty = new Prisma.Decimal(item.quantity || 1)
      subtotalDec = subtotalDec.add(itemUnitPrice.mul(itemQty))
    }

    const shippingDec = new Prisma.Decimal(shipping || 0)
    const discountDec = new Prisma.Decimal(discount || 0)
    let totalDec = subtotalDec.add(shippingDec).minus(discountDec)
    if (totalDec.lessThan(0)) {
      totalDec = new Prisma.Decimal(0)
    }

    const orderReference = `AUR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    const shippingAddress = {
      name: customerName,
      phone: customerPhone,
      addressLine1: address,
      city,
      state,
      postalCode,
    }
    const userId = req.user?.id || null

    let order = null

    if (dbStatus.isConnected && prisma) {
      try {
        // Execute atomic transaction: stock validation + inventory decrement + order & items creation
        order = await prisma.$transaction(async (tx) => {
          const orderItemsData = []

          for (const item of items) {
            let variant = null

            // Find variant by variantId, or by (productId, size, color), or by SKU
            if (item.variantId) {
              variant = await tx.productVariant.findUnique({
                where: { id: item.variantId },
              })
            } else if (item.productId && item.size) {
              variant = await tx.productVariant.findFirst({
                where: {
                  productId: item.productId,
                  size: item.size,
                  ...(item.color ? { color: item.color } : {}),
                },
              })
            }

            // Prevent invalid stock quantities
            if (variant) {
              if (variant.stockQuantity < item.quantity) {
                throw new Error(
                  `Insufficient stock for ${item.name} (${item.size || 'Standard'}). Available: ${variant.stockQuantity}, Requested: ${item.quantity}`
                )
              }

              // Decrement stock in transaction
              await tx.productVariant.update({
                where: { id: variant.id },
                data: {
                  stockQuantity: {
                    decrement: item.quantity,
                  },
                },
              })
            }

            const itemUnitPrice = new Prisma.Decimal(item.price || 0)
            const itemTotalPrice = itemUnitPrice.mul(new Prisma.Decimal(item.quantity || 1))

            orderItemsData.push({
              variantId: variant ? variant.id : null,
              productName: item.name || 'AUREVA Silhouette',
              sku: variant ? variant.sku : `AUR-${(item.productId || 'GEN').slice(0, 6).toUpperCase()}-STD`,
              size: item.size || (variant ? variant.size : null),
              color: item.color || (variant ? variant.color : null),
              unitPrice: itemUnitPrice,
              quantity: item.quantity || 1,
              totalPrice: itemTotalPrice,
              image: item.image || null,
            })
          }

          const createdOrder = await tx.order.create({
            data: {
              orderReference,
              userId,
              orderStatus: 'PENDING',
              paymentStatus: 'PENDING',
              paymentMethod,
              shippingAddress,
              subtotal: subtotalDec,
              discount: discountDec,
              shipping: shippingDec,
              total: totalDec,
              items: {
                create: orderItemsData,
              },
            },
            include: {
              items: true,
            },
          })

          // Clear customer cart items if authenticated user has a cart
          if (userId) {
            const userCart = await tx.cart.findUnique({
              where: { userId },
            })
            if (userCart) {
              await tx.cartItem.deleteMany({
                where: { cartId: userCart.id },
              })
            }
          }

          return createdOrder
        })
      } catch (err) {
        console.warn('[Orders Controller] Database transactional write:', err.message)
        if (err.message.includes('Insufficient stock')) {
          return errorResponse(res, {
            message: err.message,
            code: 'INSUFFICIENT_STOCK',
            statusCode: 400,
          })
        }
      }
    }

    if (!order) {
      // In-memory fallback
      order = {
        id: `mock-order-${Date.now()}`,
        orderReference,
        orderNumber: orderReference,
        userId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items,
        subtotal: Number(subtotalDec),
        shipping: Number(shippingDec),
        discount: Number(discountDec),
        total: Number(totalDec),
        paymentMethod,
        orderStatus: 'PENDING',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      mockOrders.set(orderReference, order)
      mockOrders.set(order.id, order)
    }

    const formattedOrder = formatOrderResponse(order)

    return successResponse(res, {
      message: 'Atelier acquisition finalized successfully',
      data: formattedOrder,
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get order by ID or orderReference
 * Endpoint: GET /api/orders/:id
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params

    if (dbStatus.isConnected && prisma) {
      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ id }, { orderReference: id }],
          },
          include: {
            items: {
              include: { variant: true },
            },
          },
        })
        if (order) {
          return successResponse(res, {
            message: 'Order retrieved from atelier archive',
            data: formatOrderResponse(order),
          })
        }
      } catch (err) {
        console.warn('[Orders Controller] Database query fallback:', err.message)
      }
    }

    const order = mockOrders.get(id) || Array.from(mockOrders.values()).find((o) => o.id === id || o.orderReference === id || o.orderNumber === id)
    if (!order) {
      return errorResponse(res, {
        message: `Order reference '${id}' not found in archive`,
        code: 'ORDER_NOT_FOUND',
        statusCode: 404,
      })
    }

    return successResponse(res, {
      message: 'Order retrieved successfully',
      data: formatOrderResponse(order),
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
              userId: user.id,
            }

        const orders = await prisma.order.findMany({
          where,
          include: {
            items: {
              include: { variant: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        return successResponse(res, {
          message: `Retrieved ${orders.length} order records`,
          data: orders.map(formatOrderResponse),
        })
      } catch (err) {
        console.warn('[Orders Controller] Database query fallback:', err.message)
      }
    }

    // In-memory orders filter
    const allOrders = Array.from(mockOrders.values()).filter(
      (order, index, self) => self.findIndex((o) => (o.orderReference || o.orderNumber) === (order.orderReference || order.orderNumber)) === index
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
      data: filtered.map(formatOrderResponse),
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
        const targetOrder = await prisma.order.findFirst({
          where: {
            OR: [{ id }, { orderReference: id }],
          },
        })

        if (targetOrder) {
          const updated = await prisma.order.update({
            where: { id: targetOrder.id },
            data: { orderStatus: status },
            include: { items: true },
          })

          return successResponse(res, {
            message: `Order status upgraded to ${status}`,
            data: formatOrderResponse(updated),
          })
        }
      } catch (err) {
        console.warn('[Orders Controller] Database update fallback:', err.message)
      }
    }

    let order = mockOrders.get(id)
    if (!order) {
      order = Array.from(mockOrders.values()).find((o) => o.id === id || o.orderReference === id || o.orderNumber === id)
    }

    if (!order) {
      return errorResponse(res, {
        message: `Order reference '${id}' not found`,
        code: 'ORDER_NOT_FOUND',
        statusCode: 404,
      })
    }

    order.orderStatus = status
    order.status = status
    order.updatedAt = new Date().toISOString()
    mockOrders.set(order.id, order)
    if (order.orderReference) mockOrders.set(order.orderReference, order)
    if (order.orderNumber) mockOrders.set(order.orderNumber, order)

    return successResponse(res, {
      message: `Order status modified to ${status}`,
      data: formatOrderResponse(order),
    })
  } catch (error) {
    next(error)
  }
}

