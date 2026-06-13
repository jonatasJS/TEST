import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ message: 'Endpoint obrigatório.' }, { status: 400 });
    }

    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return NextResponse.json({ message: 'Inscrição removida.' });
  } catch (error: unknown) {
    console.error('Erro ao remover push:', error);
    return NextResponse.json({ message: 'Erro ao remover inscrição.' }, { status: 500 });
  }
}
