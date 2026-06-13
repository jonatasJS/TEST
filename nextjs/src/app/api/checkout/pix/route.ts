import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ message: 'O ID do pedido é obrigatório.' }, { status: 400 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(orderId)),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }

    const calculatedTotal = order.items.reduce((sum, item) => {
      return sum + (item.priceAtPurchase * item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - order.totalAmount) > 0.01) {
      console.error(`Inconsistência de valor no pedido #${order.id}: DB=${order.totalAmount}, Calculado=${calculatedTotal}`);
      return NextResponse.json({ 
        message: 'Inconsistência no valor do pedido. Entre em contato com o suporte.',
        error: 'VALUE_MISMATCH',
        supportContact: 'suporte@cybervapes.com'
      }, { status: 400 });
    }

    const paymentBody = {
      transaction_amount: order.totalAmount,
      description: `Pedido #${order.id} - CYBERVAPES`,
      payment_method_id: 'pix',
      payer: {
        email: order.customerEmail,
        first_name: order.customerName.split(' ')[0],
        last_name: order.customerName.split(' ').slice(1).join(' ') || '',
      },
      external_reference: String(order.id),
    };

    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      console.log('--- Modo de Teste: Gerando QR Code PIX Simulado ---');
      return NextResponse.json({
        id: `mock-pix-${order.id}`,
        qr_code: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540550.005802BR5913CYBERVAPES6008BRASIL62070503***6304ABCD',
        qr_code_base64: null,
        ticket_url: `${FRONTEND_URL}/account?payment=success&orderId=${order.id}&mock=true`,
        isMock: true,
      });
    }

    const idempotencyKey = `pix-order-${order.id}`;

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentBody),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Erro na resposta do Mercado Pago PIX:', errorData);
      throw new Error(`Falha ao criar pagamento PIX. Entre em contato com o suporte: suporte@cybervapes.com`);
    }

    const mpData = await mpResponse.json();

    await db.update(orders)
      .set({
        paymentId: String(mpData.id),
        paymentStatus: 'pending',
      })
      .where(eq(orders.id, parseInt(orderId)));

    return NextResponse.json({
      id: mpData.id,
      qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
      status: mpData.status,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento PIX:', error);
    return NextResponse.json({ message: 'Erro ao criar pagamento PIX.', error: error.message }, { status: 500 });
  }
}
