import { NextResponse } from 'next/server';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, orderItems, orders } from '@/lib/db/schema';

export async function GET() {
  try {
    // Query to get products with total sold
    const productsWithSales = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        puffs: products.puffs,
        nicotine: products.nicotine,
        flavor: products.flavor,
        isActive: products.isActive,
        createdAt: products.createdAt,
        totalSold: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orderItems.quantity} ELSE 0 END), 0)`.as('totalSold'),
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(products.isActive, true))
      .groupBy(products.id)
      .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orderItems.quantity} ELSE 0 END), 0)`));

    // Fetch category details for all products
    const productsWithCategories = await Promise.all(
      productsWithSales.map(async (p) => {
        const productWithCategory = await db.query.products.findFirst({
          where: eq(products.id, p.id),
          with: {
            category: true,
          },
        });
        return productWithCategory;
      })
    );

    return NextResponse.json({ products: productsWithCategories });
  } catch (error: any) {
    console.error('Erro ao buscar produtos hero:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar produtos hero.', error: error.message },
      { status: 500 }
    );
  }
}
