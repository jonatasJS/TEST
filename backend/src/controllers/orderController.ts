import { Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index';
import { orders, orderItems, products } from '../db/schema';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { items, shippingAddress, contactPhone, customerName, customerEmail } = req.body;
  const userId = req.user?.id || null;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'O pedido precisa ter pelo menos um item.' });
  }

  if (!shippingAddress || !contactPhone || !customerName || !customerEmail) {
    return res.status(400).json({ message: 'Dados de entrega e contato incompletos (endereço, telefone, nome, e-mail).' });
  }

  try {
    // Iniciar transação para garantir atomicidade
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

        const price = product.price;
        totalAmount += price * item.quantity;

        verifiedItems.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: price,
          newStock: product.stock - item.quantity,
        });
      }

      // 1. Criar o cabeçalho do pedido
      const [newOrder] = await tx.insert(orders).values({
        userId,
        status: 'pending',
        totalAmount,
        shippingAddress,
        contactPhone,
        customerName,
        customerEmail,
      }).returning();

      // 2. Criar os itens do pedido e atualizar o estoque
      for (const vItem of verifiedItems) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: vItem.productId,
          quantity: vItem.quantity,
          priceAtPurchase: vItem.priceAtPurchase,
        });

        await tx.update(products)
          .set({ stock: vItem.newStock })
          .where(eq(products.id, vItem.productId));
      }

      return newOrder;
    });

    return res.status(201).json({
      message: 'Pedido criado com sucesso!',
      order: result,
    });
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    return res.status(400).json({ message: error.message || 'Erro ao processar criação de pedido.' });
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

    return res.status(200).json({ orders: userOrders });
  } catch (error: any) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    return res.status(500).json({ message: 'Erro ao obter histórico de pedidos.', error: error.message });
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

    return res.status(200).json({ orders: allOrders });
  } catch (error: any) {
    console.error('Erro ao buscar todos os pedidos:', error);
    return res.status(500).json({ message: 'Erro ao listar pedidos no painel.', error: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'paid', 'shipped', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status inválido. Use: pending, paid, shipped ou cancelled.' });
  }

  try {
    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(id)),
    });

    if (!existing) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // Se o pedido for cancelado, repor estoque dos produtos correspondentes!
    if (status === 'cancelled' && existing.status !== 'cancelled') {
      const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, existing.id),
      });

      for (const item of items) {
        if (item.productId) {
          const product = await db.query.products.findFirst({
            where: eq(products.id, item.productId),
          });
          if (product) {
            await db.update(products)
              .set({ stock: product.stock + item.quantity })
              .where(eq(products.id, item.productId));
          }
        }
      }
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return res.status(200).json({
      message: 'Status do pedido atualizado com sucesso!',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status de pedido:', error);
    return res.status(500).json({ message: 'Erro ao atualizar o pedido.', error: error.message });
  }
};
