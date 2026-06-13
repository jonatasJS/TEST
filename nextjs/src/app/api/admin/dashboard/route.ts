import { NextResponse } from 'next/server';
import { eq, sum, count, sql, desc, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, products, orderItems, users } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    // 1. Receita Total (Apenas pedidos pagos E enviados)
    const revenueResult = await db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(and(eq(orders.status, 'delivered'), eq(orders.paymentStatus, 'paid')));
    const totalRevenue = parseFloat(revenueResult[0]?.total || '0');

    // 2. Total de Pedidos
    const ordersCountResult = await db
      .select({ total: count(orders.id) })
      .from(orders);
    const totalOrders = ordersCountResult[0]?.total || 0;

    // 3. Total de Produtos
    const productsCountResult = await db
      .select({ total: count(products.id) })
      .from(products);
    const totalProducts = productsCountResult[0]?.total || 0;

    // 4. Produtos com Baixo Estoque (estoque < 5)
    const lowStockResult = await db
      .select({ total: count(products.id) })
      .from(products)
      .where(sql`${products.stock} < 5 AND ${products.isActive} = true`);
    const lowStockCount = lowStockResult[0]?.total || 0;

    // 5. Total de Clientes Cadastrados
    const clientsCountResult = await db
      .select({ total: count(users.id) })
      .from(users)
      .where(eq(users.role, 'client'));
    const totalClients = clientsCountResult[0]?.total || 0;

    // 6. Pedidos por status
    const awaitingCourierResult = await db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(eq(orders.status, 'awaiting_courier'));
    const awaitingCourier = awaitingCourierResult[0]?.total || 0;

    const onTheWayResult = await db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(eq(orders.status, 'on_the_way'));
    const onTheWay = onTheWayResult[0]?.total || 0;

    const deliveredOrdersResult = await db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(eq(orders.status, 'delivered'));
    const deliveredOrders = deliveredOrdersResult[0]?.total || 0;

    const cancelledOrdersResult = await db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(eq(orders.status, 'cancelled'));
    const cancelledOrders = cancelledOrdersResult[0]?.total || 0;

    const paymentPendingResult = await db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(eq(orders.paymentStatus, 'pending'));
    const paymentPending = paymentPendingResult[0]?.total || 0;

    const paymentPaidResult = await db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(eq(orders.paymentStatus, 'paid'));
    const paymentPaid = paymentPaidResult[0]?.total || 0;

    // 7. Ticket Médio
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 8. Métricas de hoje
    const todayRevenueResult = await db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(and(
        eq(orders.status, 'delivered'),
        eq(orders.paymentStatus, 'paid'),
        sql`${orders.createdAt} >= CURRENT_DATE`
      ));
    const todayRevenue = parseFloat(todayRevenueResult[0]?.total || '0');

    const todayOrdersResult = await db
      .select({ total: count(orders.id) })
      .from(orders)
      .where(sql`${orders.createdAt} >= CURRENT_DATE`);
    const todayOrders = todayOrdersResult[0]?.total || 0;

    // 9. Produtos Mais Vendidos (Top 5)
    const topProducts = await db
      .select({
        productId: orderItems.productId,
        name: products.name,
        flavor: products.flavor,
        imageUrl: products.imageUrl,
        totalSold: sum(orderItems.quantity).mapWith(Number),
        revenueGenerated: sql`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase})`.mapWith(Number),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(and(eq(orders.status, 'delivered'), eq(orders.paymentStatus, 'paid')))
      .groupBy(orderItems.productId, products.name, products.flavor, products.imageUrl)
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(5);

    // 10. Vendas dos últimos 7 dias
    const last7DaysSales = await db
      .select({
        date: sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`.mapWith(String),
        salesCount: count(orders.id).mapWith(Number),
        revenue: sum(orders.totalAmount).mapWith(Number),
      })
      .from(orders)
      .where(and(
        eq(orders.status, 'delivered'),
        eq(orders.paymentStatus, 'paid'),
        sql`${orders.createdAt} >= NOW() - INTERVAL '7 days'`
      ))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`, sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // 11. Pedidos Recentes
    const recentOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 5,
      columns: {
        id: true,
        customerName: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockCount,
        totalClients,
        awaitingCourier,
        onTheWay,
        deliveredOrders,
        cancelledOrders,
        paymentPending,
        paymentPaid,
        avgOrderValue,
        todayRevenue,
        todayOrders,
      },
      topProducts,
      salesHistory: last7DaysSales,
      recentOrders,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao gerar estatísticas administrativas:', error);
    return NextResponse.json({ message: 'Erro ao consolidar relatório de vendas.', error: error.message }, { status: 500 });
  }
}
