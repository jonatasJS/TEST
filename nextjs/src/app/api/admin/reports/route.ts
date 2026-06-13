import { NextRequest, NextResponse } from 'next/server';
import { eq, sum, count, sql, desc, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, products, orderItems, users } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    let dateCondition = sql`1=1`;

    if (period === '7d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '7 days'`;
    } else if (period === '30d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '30 days'`;
    } else if (period === '90d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '90 days'`;
    }

    // Receita total no período
    const revenueResult = await db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(and(eq(orders.paymentStatus, 'paid'), dateCondition));
    const totalRevenue = parseFloat(revenueResult[0]?.total || '0');

    // Total de pedidos no período
    const ordersCountResult = await db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(dateCondition);
    const totalOrders = ordersCountResult[0]?.total || 0;

    // Ticket médio
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Novos clientes no período
    const newClientsResult = await db
      .select({ total: count(users.id) })
      .from(users)
      .where(and(eq(users.role, 'client'), dateCondition));
    const newClients = newClientsResult[0]?.total || 0;

    // Vendas por período
    const revenueByPeriod = await db
      .select({
        period: sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`.mapWith(String),
        revenue: sum(orders.totalAmount).mapWith(Number),
        orders: count(orders.id).mapWith(Number),
      })
      .from(orders)
      .where(and(eq(orders.paymentStatus, 'paid'), dateCondition))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`, sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`)
      .limit(30);

    // Top produtos por receita
    const topProducts = await db
      .select({
        productId: products.id,
        name: products.name,
        totalSold: sum(orderItems.quantity).mapWith(Number),
        revenue: sql`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase})`.mapWith(Number),
        stock: products.stock,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(and(eq(orders.paymentStatus, 'paid'), dateCondition))
      .groupBy(products.id, products.name, products.stock)
      .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase})`))
      .limit(10);

    // Breakdown por categoria
    const categoryBreakdown = await db
      .select({
        categoryId: products.categoryId,
        totalRevenue: sum(orders.totalAmount).mapWith(Number),
        totalOrders: count(orders.id).mapWith(Number),
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(and(eq(orders.paymentStatus, 'paid'), dateCondition))
      .groupBy(products.categoryId)
      .orderBy(desc(sql`SUM(${orders.totalAmount})`));

    const totalCategoryRevenue = categoryBreakdown.reduce((sum, cat) => sum + cat.totalRevenue, 0);
    const categoryBreakdownWithPercentage = categoryBreakdown.map(cat => ({
      ...cat,
      percentage: totalCategoryRevenue > 0 ? (cat.totalRevenue / totalCategoryRevenue) * 100 : 0,
    }));

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      newClients,
      revenueByPeriod,
      topProducts,
      categoryBreakdown: categoryBreakdownWithPercentage,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao gerar relatórios:', error);
    return NextResponse.json({ message: 'Erro ao gerar relatórios', error: error.message }, { status: 500 });
  }
}
