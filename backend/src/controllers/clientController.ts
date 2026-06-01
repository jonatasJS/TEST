import { Response } from 'express';
import { eq, desc, count, sum } from 'drizzle-orm';
import { db } from '../db/index';
import { users, orders } from '../db/schema';
import { AuthRequest } from '../middleware/auth';

export const getAllClients = async (req: AuthRequest, res: Response) => {
  try {
    const allClients = await db.query.users.findMany({
      where: eq(users.role, 'client'),
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return res.status(200).json({ clients: allClients });
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({ message: 'Erro ao buscar clientes', error: error.message });
  }
};

export const getClientDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const client = await db.query.users.findFirst({
      where: eq(users.id, parseInt(id)),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Buscar pedidos do cliente
    const clientOrders = await db.query.orders.findMany({
      where: eq(orders.userId, parseInt(id)),
      orderBy: [desc(orders.createdAt)],
    });

    // Calcular estatísticas do cliente
    const totalOrders = clientOrders.length;
    const totalSpent = clientOrders
      .filter(order => order.status === 'paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return res.status(200).json({
      client,
      orders: clientOrders,
      stats: {
        totalOrders,
        totalSpent,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar detalhes do cliente:', error);
    return res.status(500).json({ message: 'Erro ao buscar detalhes do cliente', error: error.message });
  }
};

export const updateClientRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'client' && role !== 'admin') {
      return res.status(400).json({ message: 'Role inválido. Use "client" ou "admin"' });
    }

    const updatedClient = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (updatedClient.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    return res.status(200).json({ client: updatedClient[0] });
  } catch (error: any) {
    console.error('Erro ao atualizar role do cliente:', error);
    return res.status(500).json({ message: 'Erro ao atualizar role do cliente', error: error.message });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedClient = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (deletedClient.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    return res.status(200).json({ message: 'Cliente deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar cliente:', error);
    return res.status(500).json({ message: 'Erro ao deletar cliente', error: error.message });
  }
};
