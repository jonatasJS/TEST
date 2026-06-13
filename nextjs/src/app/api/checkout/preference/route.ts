import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/checkout/webhook';
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

    const mpItems = order.items.map((item) => {
      const productName = item.product?.name || `Produto #${item.productId}`;
      return {
        title: productName,
        quantity: item.quantity,
        unit_price: item.priceAtPurchase,
        currency_id: 'BRL',
      };
    });

    const preferenceBody = {
      items: mpItems,
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        default_payment_method_id: null,
        installments: 12,
        default_installments: 1,
      },
      external_reference: String(order.id),
      notification_url: WEBHOOK_URL,
      statement_descriptor: 'CYBERVAPES',
    };

    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      console.log('--- Modo de Teste: Gerando Link de Pagamento Simulado ---');
      return NextResponse.json({
        id: `mock-pref-${order.id}`,
        initPoint: `${FRONTEND_URL}/account?payment=success&orderId=${order.id}&mock=true`,
        isMock: true,
      });
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Erro na resposta do Mercado Pago:', errorData);
      throw new Error(`Falha ao registrar preferência de pagamento. Entre em contato com o suporte: suporte@cybervapes.com`);
    }

    const mpData = await mpResponse.json();
    const isTestToken = ACCESS_TOKEN.includes('APP_USR');
    
    return NextResponse.json({
      id: mpData.id,
      initPoint: isTestToken ? mpData.sandbox_init_point : mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point,
      isMock: false,
      isTest: isTestToken,
    });
  } catch (error: any) {
    console.error('Erro ao gerar preferência Mercado Pago:', error);
    return NextResponse.json({ message: 'Erro ao conectar ao provedor de pagamentos.', error: error.message }, { status: 500 });
  }
}
