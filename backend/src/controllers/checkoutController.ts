import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { orders } from '../db/schema';

const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5000/api/checkout/webhook';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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
      back_urls: {
        success: `${FRONTEND_URL}/account?payment=success&orderId=${order.id}`,
        failure: `${FRONTEND_URL}/cart?payment=failure`,
        pending: `${FRONTEND_URL}/account?payment=pending`,
      },
      auto_return: 'approved',
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
      throw new Error('Falha ao registrar preferência de pagamento.');
    }

    const mpData = await mpResponse.json() as any;

    return res.status(200).json({
      id: mpData.id,
      initPoint: mpData.init_point,
      sandboxInitPoint: mpData.sandbox_init_point,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Erro ao gerar preferência Mercado Pago:', error);
    return res.status(500).json({ message: 'Erro ao conectar ao provedor de pagamentos.', error: error.message });
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
          status: 'paid',
          paymentId: String(paymentId),
          paymentStatus: status,
        })
        .where(eq(orders.id, parseInt(orderId)));

      console.log(`Pedido #${orderId} atualizado com sucesso para PAGO.`);
    } else if (status === 'rejected' || status === 'cancelled') {
      await db.update(orders)
        .set({
          status: 'cancelled',
          paymentId: String(paymentId),
          paymentStatus: status,
        })
        .where(eq(orders.id, parseInt(orderId)));

      console.log(`Pedido #${orderId} atualizado com sucesso para CANCELADO.`);
    } else {
      // Outros status como 'in_process' (pendente)
      await db.update(orders)
        .set({
          paymentId: String(paymentId),
          paymentStatus: status,
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
    if (!order.paymentId) {
      return res.status(200).json({
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus || 'not_initiated',
        message: 'Pagamento não iniciado',
      });
    }

    // Se estiver em modo teste e sem token válido
    if (!ACCESS_TOKEN || ACCESS_TOKEN.includes('mock')) {
      return res.status(200).json({
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus || 'mock',
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
    if (mpStatus !== order.paymentStatus) {
      if (mpStatus === 'approved') {
        await db.update(orders)
          .set({
            status: 'paid',
            paymentStatus: mpStatus,
          })
          .where(eq(orders.id, parseInt(orderId)));
      } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
        await db.update(orders)
          .set({
            status: 'cancelled',
            paymentStatus: mpStatus,
          })
          .where(eq(orders.id, parseInt(orderId)));
      } else {
        await db.update(orders)
          .set({
            paymentStatus: mpStatus,
          })
          .where(eq(orders.id, parseInt(orderId)));
      }
    }

    return res.status(200).json({
      orderId: order.id,
      status: mpStatus === 'approved' ? 'paid' : order.status,
      paymentStatus: mpStatus,
      message: `Status do pagamento: ${mpStatus}`,
    });
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error);
    return res.status(500).json({ message: 'Erro interno ao verificar status', error: error.message });
  }
};
