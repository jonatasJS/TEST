import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken();

    if (!user) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ message: 'Dados de inscrição push inválidos.' }, { status: 400 });
    }

    const existing = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.endpoint, endpoint),
    });

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({
          userId: user.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
        })
        .where(eq(pushSubscriptions.endpoint, endpoint));
    } else {
      await db.insert(pushSubscriptions).values({
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
    }

    return NextResponse.json({ message: 'Inscrição push registrada.' });
  } catch (error: unknown) {
    console.error('Erro ao registrar push:', error);
    return NextResponse.json({ message: 'Erro ao registrar notificações push.' }, { status: 500 });
  }
}
