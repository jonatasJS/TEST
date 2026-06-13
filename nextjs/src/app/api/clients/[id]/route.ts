import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, orders } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const client = await db.query.users.findFirst({
      where: eq(users.id, parseInt(params.id)),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!client) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }

    const clientOrders = await db.query.orders.findMany({
      where: eq(orders.userId, parseInt(params.id)),
      orderBy: [desc(orders.createdAt)],
    });

    const totalOrders = clientOrders.length;
    const totalSpent = clientOrders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return NextResponse.json({
      client,
      orders: clientOrders,
      stats: {
        totalOrders,
        totalSpent,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao buscar detalhes do cliente:', error);
    return NextResponse.json({ message: 'Erro ao buscar detalhes do cliente', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { role } = body;

    if (role !== 'client' && role !== 'admin') {
      return NextResponse.json({ message: 'Role inválido. Use "client" ou "admin"' }, { status: 400 });
    }

    const updatedClient = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, parseInt(params.id)))
      .returning();

    if (updatedClient.length === 0) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ client: updatedClient[0] });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao atualizar role do cliente:', error);
    return NextResponse.json({ message: 'Erro ao atualizar role do cliente', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const deletedClient = await db
      .delete(users)
      .where(eq(users.id, parseInt(params.id)))
      .returning();

    if (deletedClient.length === 0) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cliente deletado com sucesso' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json({ message: 'Erro ao deletar cliente', error: error.message }, { status: 500 });
  }
}
