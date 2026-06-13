import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { promotions } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      description,
      type,
      value,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      isActive,
      usageLimit,
      applicableCategories,
      applicableProducts,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (minPurchaseAmount !== undefined) updateData.minPurchaseAmount = minPurchaseAmount;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories ? JSON.stringify(applicableCategories) : null;
    if (applicableProducts !== undefined) updateData.applicableProducts = applicableProducts ? JSON.stringify(applicableProducts) : null;

    const updatedPromotion = await db
      .update(promotions)
      .set(updateData)
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
    console.error('Erro ao atualizar promoção:', error);
    return NextResponse.json({ message: 'Erro ao atualizar promoção', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const deletedPromotion = await db
      .delete(promotions)
      .where(eq(promotions.id, parseInt(params.id)))
      .returning();

    if (deletedPromotion.length === 0) {
      return NextResponse.json({ message: 'Promoção não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Promoção deletada com sucesso' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao deletar promoção:', error);
    return NextResponse.json({ message: 'Erro ao deletar promoção', error: error.message }, { status: 500 });
  }
}
