import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/notificationService';

export async function GET() {
  try {
    const publicKey = getVapidPublicKey();
    if (!publicKey) {
      return NextResponse.json({ message: 'Notificações push não configuradas no servidor.' }, { status: 503 });
    }
    return NextResponse.json({ publicKey });
  } catch (error: any) {
    console.error('Erro ao obter chave VAPID:', error);
    return NextResponse.json({ message: 'Erro ao obter chave VAPID', error: error.message }, { status: 500 });
  }
}
