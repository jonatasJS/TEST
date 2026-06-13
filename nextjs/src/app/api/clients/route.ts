import { NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

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
    return NextResponse.json({ clients: allClients });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ message: 'Erro ao buscar clientes', error: error.message }, { status: 500 });
  }
}
