import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { normalizePaymentStatus } from '@/lib/orderStatus';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(params.orderId)),
    });

    if (!order) {
      return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }

    const currentPayment = normalizePaymentStatus(order.paymentStatus, order.status);

    if (!order.paymentId) {
      return NextResponse.json({
        orderId: order.id,
        deliveryStatus: order.status,
        paymentStatus: currentPayment,
        isPaid: currentPayment === 'paid',
        message: 'Pagamento não iniciado no gateway',
      });
    }

    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      return NextResponse.json({
        orderId: order.id,
        deliveryStatus: order.status,
        paymentStatus: currentPayment,
        isPaid: currentPayment === 'paid',
        message: 'Modo de teste - status simulado',
      });
    }

    const verificationResponse = await fetch(`https://api.mercadopago.com/v1/payments/${order.paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!verificationResponse.ok) {
      console.error(`Erro ao consultar pagamento #${order.paymentId} no Mercado Pago`);
      return NextResponse.json({ message: 'Erro ao consultar status no Mercado Pago' }, { status: 500 });
    }

    const paymentDetails = await verificationResponse.json();
    const mpStatus = paymentDetails.status;

    if (mpStatus === 'approved') {
      await db.update(orders)
        .set({ paymentStatus: 'paid' })
        .where(eq(orders.id, parseInt(params.orderId)));
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      await db.update(orders)
        .set({ paymentStatus: 'cancelled' })
        .where(eq(orders.id, parseInt(params.orderId)));
    } else {
      await db.update(orders)
        .set({ paymentStatus: 'pending' })
        .where(eq(orders.id, parseInt(params.orderId)));
    }

    const paymentStatus = mpStatus === 'approved' ? 'paid' : mpStatus === 'rejected' || mpStatus === 'cancelled' ? 'cancelled' : 'pending';

    return NextResponse.json({
      orderId: order.id,
      deliveryStatus: order.status,
      paymentStatus,
      isPaid: paymentStatus === 'paid',
      message: `Status do pagamento: ${mpStatus}`,
    });
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error);
    return NextResponse.json({ message: 'Erro interno ao verificar status', error: error.message }, { status: 500 });
  }
}
