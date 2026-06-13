import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { promotions } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly');

    let allPromotions;

    if (activeOnly === 'true') {
      const now = new Date();
      allPromotions = await db.query.promotions.findMany({
        where: eq(promotions.isActive, true),
        orderBy: [desc(promotions.createdAt)],
      });
      
      const activePromotions = allPromotions.filter(promo => {
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        return now >= startDate && now <= endDate;
      });
      
      return NextResponse.json({ promotions: activePromotions });
    } else {
      allPromotions = await db.query.promotions.findMany({
        orderBy: [desc(promotions.createdAt)],
      });
      return NextResponse.json({ promotions: allPromotions });
    }
  } catch (error: any) {
    console.error('Erro ao buscar promoções:', error);
    return NextResponse.json({ message: 'Erro ao buscar promoções', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      description,
      type,
      value,
      minPurchaseAmount = 0,
      maxDiscountAmount,
      startDate,
      endDate,
      isActive = true,
      usageLimit,
      applicableCategories,
      applicableProducts,
    } = body;

    if (!name || !type || !value || !startDate || !endDate) {
      return NextResponse.json({ message: 'Campos obrigatórios: name, type, value, startDate, endDate' }, { status: 400 });
    }

    const newPromotion = await db.insert(promotions).values({
      name,
      description,
      type,
      value,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
      usageLimit,
      currentUsage: 0,
      applicableCategories: applicableCategories ? JSON.stringify(applicableCategories) : null,
      applicableProducts: applicableProducts ? JSON.stringify(applicableProducts) : null,
    }).returning();

    return NextResponse.json({ promotion: newPromotion[0] }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao criar promoção:', error);
    return NextResponse.json({ message: 'Erro ao criar promoção', error: error.message }, { status: 500 });
  }
}
