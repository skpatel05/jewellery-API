import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import type { UserRole } from '../types/index.js';
import type { CreateOrderInput, UpdateOrderStatusInput } from '../validators/order.validation.js';

export const createOrder = async (input: CreateOrderInput, userId: string) => {
  const productIds = input.items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    throw new AppError(400, 'One or more products not found or inactive');
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalAmount = 0;
  const orderItemsData = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    const priceAtOrder = product.price;
    totalAmount += priceAtOrder * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      priceAtOrder,
    };
  });

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  });

  return order;
};

export const getMyOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
};

export const getOrderById = async (id: string, userId: string, role: UserRole) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, image: true, price: true },
          },
        },
      },
    },
  });

  if (!order) throw new AppError(404, 'Order not found');

  if (role !== 'admin' && order.userId !== userId) {
    throw new AppError(403, 'Access denied');
  }

  return order;
};

export const updateOrderStatus = async (id: string, input: UpdateOrderStatusInput) => {
  const order = await prisma.order.update({
    where: { id },
    data: { status: input.status },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  });

  return order;
};
