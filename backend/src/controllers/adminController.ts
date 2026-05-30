import { Response } from 'express';
import { eq, sum, count, sql, desc } from 'drizzle-orm';
import { db } from '../db/index';
import { orders, products, orderItems, users } from '../db/schema';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Receita Total (Apenas pedidos pagos)
    const revenueResult = await db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(eq(orders.status, 'paid'));
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

    // 6. Produtos Mais Vendidos (Top 5)
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
      .where(eq(orders.status, 'paid'))
      .groupBy(orderItems.productId, products.name, products.flavor, products.imageUrl)
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(5);

    // 7. Vendas dos últimos 7 dias (Gráfico de linha no dashboard)
    const last7DaysSales = await db
      .select({
        date: sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`.mapWith(String),
        salesCount: count(orders.id).mapWith(Number),
        revenue: sum(orders.totalAmount).mapWith(Number),
      })
      .from(orders)
      .where(sql`${orders.status} = 'paid' AND ${orders.createdAt} >= NOW() - INTERVAL '7 days'`)
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'DD/MM')`, sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // 8. Pedidos Recentes
    const recentOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 5,
      columns: {
        id: true,
        customerName: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockCount,
        totalClients,
      },
      topProducts,
      salesHistory: last7DaysSales,
      recentOrders,
    });
  } catch (error: any) {
    console.error('Erro ao gerar estatísticas administrativas:', error);
    return res.status(500).json({ message: 'Erro ao consolidar relatório de vendas.', error: error.message });
  }
};
