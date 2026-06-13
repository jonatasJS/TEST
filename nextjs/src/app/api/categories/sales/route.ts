import { NextResponse } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, products, orderItems, orders } from '@/lib/db/schema';

export async function GET() {
  try {
    // Query to get all active categories with total products sold
    const categoriesWithSales = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        totalSold: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orderItems.quantity} ELSE 0 END), 0)`.as('totalSold'),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(categories.isActive, true))
      .groupBy(categories.id)
      .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orderItems.quantity} ELSE 0 END), 0)`));

    return NextResponse.json({ categories: categoriesWithSales });
  } catch (error: any) {
    console.error('Erro ao buscar categorias por vendas:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar categorias por vendas.', error: error.message },
      { status: 500 }
    );
  }
}
