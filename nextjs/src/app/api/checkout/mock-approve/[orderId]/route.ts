import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    if (ACCESS_TOKEN && !ACCESS_TOKEN.includes('mock')) {
      return NextResponse.json({ message: 'Disponível apenas em modo de teste.' }, { status: 403 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(params.orderId)),
    });

    if (!order) {
      return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
    }

    await db.update(orders)
      .set({
        paymentStatus: 'paid',
        paymentId: order.paymentId || `mock-pix-${order.id}`,
      })
      .where(eq(orders.id, parseInt(params.orderId)));

    return NextResponse.json({ message: 'Pagamento simulado com sucesso.', isPaid: true, paymentStatus: 'paid' });
  } catch (error: any) {
    console.error('Erro ao simular pagamento PIX:', error);
    return NextResponse.json({ message: 'Erro ao simular pagamento.', error: error.message }, { status: 500 });
  }
}
