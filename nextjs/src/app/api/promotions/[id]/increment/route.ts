import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { promotions } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const updatedPromotion = await db
      .update(promotions)
      .set({
        currentUsage: sql`${promotions.currentUsage} + 1`,
      })
      .where(eq(promotions.id, parseInt(params.id)))
      .returning();

    if (updatedPromotion.length === 0) {
      return NextResponse.json({ message: 'Promoção não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ promotion: updatedPromotion[0] });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao incrementar uso da promoção:', error);
    return NextResponse.json({ message: 'Erro ao incrementar uso da promoção', error: error.message }, { status: 500 });
  }
}
