import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, data } = body;
    
    const isPaymentUpdate = type === 'payment' || action === 'payment.created' || action === 'payment.updated';
    const paymentId = data?.id || request.nextUrl.searchParams.get('id');

    if (!isPaymentUpdate || !paymentId) {
      return new NextResponse('Notificação ignorada.', { status: 200 });
    }

    console.log(`Webhook Mercado Pago: Processando pagamento ID ${paymentId}`);

    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      console.log('Webhook rodando em modo simulação.');
      return new NextResponse('Webhook processado no modo mock.', { status: 200 });
    }

    const verificationResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!verificationResponse.ok) {
      console.error(`Erro ao consultar pagamento #${paymentId} no Mercado Pago`);
      return new NextResponse('Aguardando próxima notificação.', { status: 200 });
    }

    const paymentDetails = await verificationResponse.json();
    const orderId = paymentDetails.external_reference;
    const status = paymentDetails.status;

    if (!orderId) {
      console.error('ID do pedido não encontrado na external_reference do pagamento.');
      return new NextResponse('Sem external_reference.', { status: 200 });
    }

    console.log(`Pagamento #${paymentId} para Pedido #${orderId} possui status: ${status}`);

    if (status === 'approved') {
      await db.update(orders)
        .set({
          paymentId: String(paymentId),
          paymentStatus: 'paid',
        })
        .where(eq(orders.id, parseInt(orderId)));
      console.log(`Pedido #${orderId} — pagamento confirmado.`);
    } else if (status === 'rejected' || status === 'cancelled') {
      await db.update(orders)
        .set({
          paymentId: String(paymentId),
          paymentStatus: 'cancelled',
        })
        .where(eq(orders.id, parseInt(orderId)));
      console.log(`Pedido #${orderId} — pagamento cancelado/recusado.`);
    } else {
      await db.update(orders)
        .set({
          paymentId: String(paymentId),
          paymentStatus: 'pending',
        })
        .where(eq(orders.id, parseInt(orderId)));
    }

    return new NextResponse('Webhook recebido e processado.', { status: 200 });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return new NextResponse('Erro interno do servidor no webhook.', { status: 500 });
  }
}
