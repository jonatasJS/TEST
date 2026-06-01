import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { orders } from '../db/schema';
import { normalizePaymentStatus } from '../utils/orderStatus';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5000/api/checkout/webhook';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('=== Mercado Pago Config ===');
console.log('ACCESS_TOKEN:', ACCESS_TOKEN ? `${ACCESS_TOKEN.substring(0, 20)}...` : 'NÃO CONFIGURADO');
console.log('WEBHOOK_URL:', WEBHOOK_URL);
console.log('FRONTEND_URL:', FRONTEND_URL);
console.log('=========================');

export const createCheckoutPreference = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'O ID do pedido é obrigatório.' });
  }

  try {
    // 1. Buscar pedido e seus itens
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
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // 2. Formatar os itens do Mercado Pago
    const mpItems = order.items.map((item) => {
      const productName = item.product?.name || `Produto #${item.productId}`;
      return {
        title: productName,
        quantity: item.quantity,
        unit_price: item.priceAtPurchase,
        currency_id: 'BRL',
      };
    });

    // 3. Montar a requisição de preferência
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

    // Caso o ACCESS_TOKEN não esteja configurado corretamente para testes locais, criamos um mock!
    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      console.log('--- Modo de Teste: Gerando Link de Pagamento Simulado ---');
      return res.status(200).json({
        id: `mock-pref-${order.id}`,
        // Um link simulado que redireciona diretamente para o sucesso
        initPoint: `${FRONTEND_URL}/account?payment=success&orderId=${order.id}&mock=true`,
        isMock: true,
      });
    }

    // 4. Disparar chamada HTTP para a API do Mercado Pago
    console.log('Enviando requisição para Mercado Pago:', JSON.stringify(preferenceBody, null, 2));
    
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
    });

    console.log('Status da resposta Mercado Pago:', mpResponse.status);

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Erro na resposta do Mercado Pago:', errorData);
      throw new Error(`Falha ao registrar preferência de pagamento. Status: ${mpResponse.status}, Erro: ${JSON.stringify(errorData)}`);
    }

    const mpData = await mpResponse.json() as any;

    // Usar sandbox_init_point para testes (credenciais de teste)
    const isTestToken = ACCESS_TOKEN.includes('APP_USR');
    return res.status(200).json({
      id: mpData.id,
      initPoint: isTestToken ? mpData.sandbox_init_point : mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point,
      isMock: false,
      isTest: isTestToken,
    });
  } catch (error: any) {
    console.error('Erro ao gerar preferência Mercado Pago:', error);
    return res.status(500).json({ message: 'Erro ao conectar ao provedor de pagamentos.', error: error.message });
  }
};

export const createPixPayment = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'O ID do pedido é obrigatório.' });
  }

  try {
    // 1. Buscar pedido
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
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // 2. Criar pagamento PIX
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

    // Caso o ACCESS_TOKEN não esteja configurado, criar mock
    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      console.log('--- Modo de Teste: Gerando QR Code PIX Simulado ---');
      return res.status(200).json({
        id: `mock-pix-${order.id}`,
        qr_code: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540550.005802BR5913CYBERVAPES6008BRASIL62070503***6304ABCD',
        qr_code_base64: null,
        ticket_url: `${FRONTEND_URL}/account?payment=success&orderId=${order.id}&mock=true`,
        isMock: true,
      });
    }

    // 3. Criar pagamento PIX na API do Mercado Pago
    console.log('Criando pagamento PIX:', JSON.stringify(paymentBody, null, 2));

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

    console.log('Status da resposta Mercado Pago PIX:', mpResponse.status);

    if (!mpResponse.ok) {
      const errorData = await mpResponse.json();
      console.error('Erro na resposta do Mercado Pago PIX:', errorData);
      throw new Error(`Falha ao criar pagamento PIX. Status: ${mpResponse.status}, Erro: ${JSON.stringify(errorData)}`);
    }

    const mpData = await mpResponse.json() as any;

    // 4. Atualizar pedido com o ID do pagamento
    await db.update(orders)
      .set({
        paymentId: String(mpData.id),
        paymentStatus: 'pending',
      })
      .where(eq(orders.id, parseInt(orderId)));

    return res.status(200).json({
      id: mpData.id,
      qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
      status: mpData.status,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento PIX:', error);
    return res.status(500).json({ message: 'Erro ao criar pagamento PIX.', error: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const { action, type, data } = req.body;
  
  // O Mercado Pago envia notificações com tópicos variados. 
  // Nós estamos interessados em 'payment' e na ação de criação/atualização.
  const isPaymentUpdate = type === 'payment' || action === 'payment.created' || action === 'payment.updated';
  const paymentId = data?.id || req.query.id;

  if (!isPaymentUpdate || !paymentId) {
    // Retornamos 200 para sinalizar recebimento para outros tipos de notificações não tratados
    return res.status(200).send('Notificação ignorada.');
  }

  try {
    console.log(`Webhook Mercado Pago: Processando pagamento ID ${paymentId}`);

    // Se estivermos em modo teste e sem token válido, ignoramos a verificação externa
    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      console.log('Webhook rodando em modo simulação.');
      return res.status(200).send('Webhook processado no modo mock.');
    }

    // 1. Validar pagamento chamando diretamente a API do Mercado Pago (Segurança)
    const verificationResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!verificationResponse.ok) {
      console.error(`Erro ao consultar pagamento #${paymentId} no Mercado Pago`);
      return res.status(200).send('Aguardando próxima notificação.'); // Retorna 200 para evitar retentativas infinitas se for erro de credencial temporário
    }

    const paymentDetails = await verificationResponse.json() as any;
    const orderId = paymentDetails.external_reference;
    const status = paymentDetails.status; // ex: 'approved', 'rejected', 'in_process'

    if (!orderId) {
      console.error('ID do pedido não encontrado na external_reference do pagamento.');
      return res.status(200).send('Sem external_reference.');
    }

    console.log(`Pagamento #${paymentId} para Pedido #${orderId} possui status: ${status}`);

    // 2. Atualizar o banco de dados baseado no status
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

    return res.status(200).send('Webhook recebido e processado.');
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).send('Erro interno do servidor no webhook.');
  }
};

export const checkPaymentStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ message: 'ID do pedido é obrigatório.' });
  }

  try {
    // Buscar pedido no banco
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(orderId)),
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // Se não tem paymentId, não foi para o Mercado Pago ainda
    const currentPayment = normalizePaymentStatus(order.paymentStatus, order.status);

    if (!order.paymentId) {
      return res.status(200).json({
        orderId: order.id,
        deliveryStatus: order.status,
        paymentStatus: currentPayment,
        isPaid: currentPayment === 'paid',
        message: 'Pagamento não iniciado no gateway',
      });
    }

    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      return res.status(200).json({
        orderId: order.id,
        deliveryStatus: order.status,
        paymentStatus: currentPayment,
        isPaid: currentPayment === 'paid',
        message: 'Modo de teste - status simulado',
      });
    }

    // Consultar status atual no Mercado Pago
    const verificationResponse = await fetch(`https://api.mercadopago.com/v1/payments/${order.paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!verificationResponse.ok) {
      console.error(`Erro ao consultar pagamento #${order.paymentId} no Mercado Pago`);
      return res.status(500).json({ message: 'Erro ao consultar status no Mercado Pago' });
    }

    const paymentDetails = await verificationResponse.json() as any;
    const mpStatus = paymentDetails.status;

    // Atualizar banco se houver mudança
    if (mpStatus === 'approved') {
      await db.update(orders)
        .set({ paymentStatus: 'paid' })
        .where(eq(orders.id, parseInt(orderId)));
    } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
      await db.update(orders)
        .set({ paymentStatus: 'cancelled' })
        .where(eq(orders.id, parseInt(orderId)));
    } else {
      await db.update(orders)
        .set({ paymentStatus: 'pending' })
        .where(eq(orders.id, parseInt(orderId)));
    }

    const paymentStatus = mpStatus === 'approved' ? 'paid' : mpStatus === 'rejected' || mpStatus === 'cancelled' ? 'cancelled' : 'pending';

    return res.status(200).json({
      orderId: order.id,
      deliveryStatus: order.status,
      paymentStatus,
      isPaid: paymentStatus === 'paid',
      message: `Status do pagamento: ${mpStatus}`,
    });
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error);
    return res.status(500).json({ message: 'Erro interno ao verificar status', error: error.message });
  }
};

export const mockApprovePixPayment = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ message: 'ID do pedido é obrigatório.' });
  }

  if (ACCESS_TOKEN && !ACCESS_TOKEN.includes('mock')) {
    return res.status(403).json({ message: 'Disponível apenas em modo de teste.' });
  }

  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(orderId)),
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    await db.update(orders)
      .set({
        paymentStatus: 'paid',
        paymentId: order.paymentId || `mock-pix-${order.id}`,
      })
      .where(eq(orders.id, parseInt(orderId)));

    return res.status(200).json({ message: 'Pagamento simulado com sucesso.', isPaid: true, paymentStatus: 'paid' });
  } catch (error: any) {
    console.error('Erro ao simular pagamento PIX:', error);
    return res.status(500).json({ message: 'Erro ao simular pagamento.', error: error.message });
  }
};
