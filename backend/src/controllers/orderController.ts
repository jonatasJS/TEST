import { Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index';
import { orders, orderItems, products, promotions } from '../db/schema';
import { AuthRequest } from '../middleware/auth';
import {
  DELIVERY_STATUSES,
  PAYMENT_STATUSES,
  DeliveryStatus,
  PaymentStatus,
  formatOrderForClient,
  normalizeDeliveryStatus,
  normalizePaymentStatus,
} from '../utils/orderStatus';
import { notifyNewOrderForAdmins, notifyOrderDeliveryUpdate } from '../services/notificationService';

async function getApplicablePromotionForProduct(productId: number, categoryId: number) {
  const now = new Date();

  const activePromotions = await db.query.promotions.findMany({
    where: eq(promotions.isActive, true),
  });

  for (const promo of activePromotions) {
    // Check if promotion is within date range
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    if (now < startDate || now > endDate) continue;

    // Check if product is in applicable categories
    if (promo.applicableCategories) {
      const categories = JSON.parse(promo.applicableCategories as string);
      if (!categories.includes(categoryId)) continue;
    }

    // Check if product is in applicable products
    if (promo.applicableProducts) {
      const products = JSON.parse(promo.applicableProducts as string);
      if (!products.includes(productId)) continue;
    }

    // If no restrictions or product matches, return this promotion
    return promo;
  }

  return null;
}

function calculateDiscountedPrice(originalPrice: number, promotion: any): number {
  if (promotion.type === 'percentage') {
    const discount = originalPrice * (promotion.value / 100);
    const discountedPrice = originalPrice - discount;
    
    // Apply max discount limit if exists
    if (promotion.maxDiscountAmount && discount > promotion.maxDiscountAmount) {
      return originalPrice - promotion.maxDiscountAmount;
    }
    
    return discountedPrice;
  } else if (promotion.type === 'fixed_amount') {
    const discountedPrice = originalPrice - promotion.value;
    return Math.max(0, discountedPrice);
  }
  
  return originalPrice;
}

async function deductStockForOrder(orderId: number) {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
  });

  for (const item of items) {
    if (!item.productId) continue;
    const product = await db.query.products.findFirst({
      where: eq(products.id, item.productId),
    });
    if (!product) continue;

    if (product.stock < item.quantity) {
      throw new Error(`Estoque insuficiente para "${product.name}" ao confirmar entrega.`);
    }

    await db
      .update(products)
      .set({ stock: product.stock - item.quantity })
      .where(eq(products.id, item.productId));
  }
}

async function restoreStockForOrder(orderId: number) {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
  });

  for (const item of items) {
    if (!item.productId) continue;
    const product = await db.query.products.findFirst({
      where: eq(products.id, item.productId),
    });
    if (!product) continue;

    await db
      .update(products)
      .set({ stock: product.stock + item.quantity })
      .where(eq(products.id, item.productId));
  }
}

function mapOrdersForResponse<T extends { status: string; paymentStatus?: string | null }>(list: T[]) {
  return list.map((o) => formatOrderForClient(o));
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  const {
    items,
    shippingAddress,
    contactPhone,
    customerName,
    customerEmail,
    paymentType,
    deliveryPaymentMethod,
  } = req.body;
  const userId = req.user?.id || null;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'O pedido precisa ter pelo menos um item.' });
  }

  if (!shippingAddress || !contactPhone || !customerName || !customerEmail) {
    return res.status(400).json({ message: 'Dados de entrega e contato incompletos (endereço, telefone, nome, e-mail).' });
  }

  const validPaymentTypes = ['pix', 'on_delivery'];
  if (!paymentType || !validPaymentTypes.includes(paymentType)) {
    return res.status(400).json({ message: 'Selecione PIX ou pagamento na entrega.' });
  }

  if (paymentType === 'on_delivery') {
    const validCardTypes = ['credit', 'debit'];
    if (!deliveryPaymentMethod || !validCardTypes.includes(deliveryPaymentMethod)) {
      return res.status(400).json({ message: 'Selecione cartão de crédito ou débito para pagamento na entrega.' });
    }
  }

  const paymentMethod =
    paymentType === 'pix' ? 'pix' : `on_delivery_${deliveryPaymentMethod}`;

  try {
    const result = await db.transaction(async (tx) => {
      let totalAmount = 0;
      const verifiedItems = [];

      for (const item of items) {
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.productId),
        });

        if (!product) {
          throw new Error(`Produto de ID ${item.productId} não foi encontrado.`);
        }

        if (!product.isActive) {
          throw new Error(`O produto "${product.name}" não está mais disponível.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para o produto "${product.name}". Estoque disponível: ${product.stock}`);
        }

        // Check for applicable promotion and calculate discounted price
        const promotion = await getApplicablePromotionForProduct(product.id, product.categoryId);
        console.log(`Produto #${product.id} (${product.name}): Categoria=${product.categoryId}, Promoção=${promotion ? promotion.name : 'Nenhuma'}`);
        
        const finalPrice = promotion ? calculateDiscountedPrice(product.price, promotion) : product.price;
        
        if (promotion) {
          console.log(`  Preço original: ${product.price}, Desconto aplicado: ${promotion.type} - ${promotion.value}%, Preço final: ${finalPrice}`);
        }

        totalAmount += finalPrice * item.quantity;

        verifiedItems.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: finalPrice,
        });
      }

      const [newOrder] = await tx.insert(orders).values({
        userId,
        status: 'awaiting_courier',
        totalAmount,
        shippingAddress,
        contactPhone,
        customerName,
        customerEmail,
        paymentStatus: 'pending',
        paymentMethod,
        stockDeducted: false,
      }).returning();

      for (const vItem of verifiedItems) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: vItem.productId,
          quantity: vItem.quantity,
          priceAtPurchase: vItem.priceAtPurchase,
        });
      }

      return newOrder;
    });

    notifyNewOrderForAdmins(result.id, customerName).catch((err) =>
      console.error('Falha ao notificar admins:', err),
    );

    return res.status(201).json({
      message: 'Pedido criado com sucesso!',
      order: formatOrderForClient(result),
    });
  } catch (error: unknown) {
    console.error('Erro ao criar pedido:', error);
    const message = error instanceof Error ? error.message : 'Erro ao processar criação de pedido.';
    return res.status(400).json({ message });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  try {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, req.user.id),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    return res.status(200).json({ orders: mapOrdersForResponse(userOrders) });
  } catch (error: unknown) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    const message = error instanceof Error ? error.message : 'Erro ao obter histórico de pedidos.';
    return res.status(500).json({ message, error: message });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    return res.status(200).json({ orders: mapOrdersForResponse(allOrders) });
  } catch (error: unknown) {
    console.error('Erro ao buscar todos os pedidos:', error);
    const message = error instanceof Error ? error.message : 'Erro ao listar pedidos no painel.';
    return res.status(500).json({ message, error: message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { deliveryStatus, paymentStatus } = req.body as {
    deliveryStatus?: DeliveryStatus;
    paymentStatus?: PaymentStatus;
  };

  if (!deliveryStatus && !paymentStatus) {
    return res.status(400).json({ message: 'Informe deliveryStatus e/ou paymentStatus.' });
  }

  if (deliveryStatus && !DELIVERY_STATUSES.includes(deliveryStatus)) {
    return res.status(400).json({
      message: 'Status de entrega inválido. Use: awaiting_courier, on_the_way, delivered ou cancelled.',
    });
  }

  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
    return res.status(400).json({ message: 'Status de pagamento inválido. Use: pending, paid ou cancelled.' });
  }

  try {
    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(id)),
    });

    if (!existing) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    const previousDelivery = normalizeDeliveryStatus(existing.status);
    const updates: Partial<typeof orders.$inferInsert> = {};

    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    if (deliveryStatus) {
      updates.status = deliveryStatus;

      if (deliveryStatus === 'delivered' && !existing.stockDeducted) {
        await deductStockForOrder(existing.id);
        updates.stockDeducted = true;
      }

      if (deliveryStatus === 'cancelled' && existing.stockDeducted) {
        await restoreStockForOrder(existing.id);
        updates.stockDeducted = false;
      }
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    if (deliveryStatus && deliveryStatus !== previousDelivery && updatedOrder.userId) {
      notifyOrderDeliveryUpdate(updatedOrder.userId, updatedOrder.id, deliveryStatus).catch((err) =>
        console.error('Falha ao notificar cliente:', err),
      );
    }

    return res.status(200).json({
      message: 'Pedido atualizado com sucesso!',
      order: formatOrderForClient(updatedOrder),
    });
  } catch (error: unknown) {
    console.error('Erro ao atualizar pedido:', error);
    const message = error instanceof Error ? error.message : 'Erro ao atualizar o pedido.';
    return res.status(500).json({ message, error: message });
  }
};
