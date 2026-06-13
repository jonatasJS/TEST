import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  try {
    const userPayload = await getUserFromToken();

    if (!userPayload) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userPayload.id),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        cep: true,
        street: true,
        number: true,
        complement: true,
        neighborhood: true,
        city: true,
        state: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { message: 'Erro interno ao buscar perfil.', error: error.message },
      { status: 500 }
    );
  }
}
