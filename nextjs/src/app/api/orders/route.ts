import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, orderItems, products, promotions } from '@/lib/db/schema';
import { getUserFromToken, requireAdmin } from '@/lib/auth';
import {
  DELIVERY_STATUSES,
  PAYMENT_STATUSES,
  formatOrderForClient,
  normalizeDeliveryStatus,
  normalizePaymentStatus,
} from '@/lib/orderStatus';
import { notifyNewOrderForAdmins, notifyOrderDeliveryUpdate } from '@/lib/notificationService';

async function getApplicablePromotionForProduct(productId: number, categoryId: number) {
  const now = new Date();

  const activePromotions = await db.query.promotions.findMany({
    where: eq(promotions.isActive, true),
  });

  for (const promo of activePromotions) {
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    if (now < startDate || now > endDate) continue;

    if (promo.applicableCategories) {
      const categories = JSON.parse(promo.applicableCategories as string);
      if (!categories.includes(categoryId)) continue;
    }

    if (promo.applicableProducts) {
      const products = JSON.parse(promo.applicableProducts as string);
      if (!products.includes(productId)) continue;
    }

    return promo;
  }

  return null;
}

function calculateDiscountedPrice(originalPrice: number, promotion: any): number {
  if (promotion.type === 'percentage') {
    const discount = originalPrice * (promotion.value / 100);
    const discountedPrice = originalPrice - discount;
    
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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }

    if (user.role === 'admin') {
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

      return NextResponse.json({ orders: mapOrdersForResponse(allOrders) });
    } else {
      const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, user.id),
        orderBy: [desc(orders.createdAt)],
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      });

      return NextResponse.json({ orders: mapOrdersForResponse(userOrders) });
    }
  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error);
    const message = error instanceof Error ? error.message : 'Erro ao obter histórico de pedidos.';
    return NextResponse.json({ message, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken();
    const userId = user?.id || null;

    const body = await request.json();
    const {
      items,
      shippingAddress,
      contactPhone,
      customerName,
      customerEmail,
      paymentType,
      deliveryPaymentMethod,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'O pedido precisa ter pelo menos um item.' }, { status: 400 });
    }

    if (!shippingAddress || !contactPhone || !customerName || !customerEmail) {
      return NextResponse.json({ message: 'Dados de entrega e contato incompletos (endereço, telefone, nome, e-mail).' }, { status: 400 });
    }

    const validPaymentTypes = ['pix', 'on_delivery'];
    if (!paymentType || !validPaymentTypes.includes(paymentType)) {
      return NextResponse.json({ message: 'Selecione PIX ou pagamento na entrega.' }, { status: 400 });
    }

    if (paymentType === 'on_delivery') {
      const validCardTypes = ['credit', 'debit'];
      if (!deliveryPaymentMethod || !validCardTypes.includes(deliveryPaymentMethod)) {
        return NextResponse.json({ message: 'Selecione cartão de crédito ou débito para pagamento na entrega.' }, { status: 400 });
      }
    }

    const paymentMethod = paymentType === 'pix' ? 'pix' : `on_delivery_${deliveryPaymentMethod}`;

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

        const promotion = await getApplicablePromotionForProduct(product.id, product.categoryId);
        const finalPrice = promotion ? calculateDiscountedPrice(product.price, promotion) : product.price;

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

    return NextResponse.json({
      message: 'Pedido criado com sucesso!',
      order: formatOrderForClient(result),
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Erro ao criar pedido:', error);
    const message = error instanceof Error ? error.message : 'Erro ao processar criação de pedido.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
