import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, products, orderItems } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';
import {
  DELIVERY_STATUSES,
  PAYMENT_STATUSES,
  formatOrderForClient,
  normalizeDeliveryStatus,
} from '@/lib/orderStatus';
import { notifyOrderDeliveryUpdate } from '@/lib/notificationService';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { deliveryStatus, paymentStatus } = body;

    if (!deliveryStatus && !paymentStatus) {
      return NextResponse.json({ message: 'Informe deliveryStatus e/ou paymentStatus.' }, { status: 400 });
    }

    if (deliveryStatus && !DELIVERY_STATUSES.includes(deliveryStatus)) {
      return NextResponse.json({
        message: 'Status de entrega inválido. Use: awaiting_courier, on_the_way, delivered ou cancelled.',
      }, { status: 400 });
    }

    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ message: 'Status de pagamento inválido. Use: pending, paid ou cancelled.' }, { status: 400 });
    }

    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(params.id)),
    });

    if (!existing) {
      return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }

    const previousDelivery = normalizeDeliveryStatus(existing.status);
    const updates: any = {};

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
      .where(eq(orders.id, parseInt(params.id)))
      .returning();

    if (deliveryStatus && deliveryStatus !== previousDelivery && updatedOrder.userId) {
      notifyOrderDeliveryUpdate(updatedOrder.userId, updatedOrder.id, deliveryStatus).catch((err) =>
        console.error('Falha ao notificar cliente:', err),
      );
    }

    return NextResponse.json({
      message: 'Pedido atualizado com sucesso!',
      order: formatOrderForClient(updatedOrder),
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao atualizar pedido:', error);
    const message = error instanceof Error ? error.message : 'Erro ao atualizar o pedido.';
    return NextResponse.json({ message, error: message }, { status: 500 });
  }
}
