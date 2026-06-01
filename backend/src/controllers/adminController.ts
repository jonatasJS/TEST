import { Response } from 'express';
import { eq, sum, count, sql, desc, and, gte, lte } from 'drizzle-orm';
import { db } from '../db/index';
import { orders, products, orderItems, users } from '../db/schema';
import { AuthRequest } from '../middleware/auth';

// Função auxiliar para gerar CSV
const generateCSV = (data: any[], headers: string[]) => {
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
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

    // 10. Vendas dos últimos 7 dias (Gráfico de linha no dashboard)
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

    return res.status(200).json({
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
    console.error('Erro ao gerar estatísticas administrativas:', error);
    return res.status(500).json({ message: 'Erro ao consolidar relatório de vendas.', error: error.message });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { period } = req.query;
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

    // Vendas por período (diário/semanal)
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
        category: products.category,
        totalSold: sum(orderItems.quantity).mapWith(Number),
        revenue: sql`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase})`.mapWith(Number),
        stock: products.stock,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(and(eq(orders.paymentStatus, 'paid'), dateCondition))
      .groupBy(products.id, products.name, products.category, products.stock)
      .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase})`))
      .limit(10);

    // Breakdown por categoria
    const categoryBreakdown = await db
      .select({
        category: products.category,
        totalRevenue: sum(orders.totalAmount).mapWith(Number),
        totalOrders: count(orders.id).mapWith(Number),
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(and(eq(orders.paymentStatus, 'paid'), dateCondition))
      .groupBy(products.category)
      .orderBy(desc(sql`SUM(${orders.totalAmount})`));

    const totalCategoryRevenue = categoryBreakdown.reduce((sum, cat) => sum + cat.totalRevenue, 0);
    const categoryBreakdownWithPercentage = categoryBreakdown.map(cat => ({
      ...cat,
      percentage: totalCategoryRevenue > 0 ? (cat.totalRevenue / totalCategoryRevenue) * 100 : 0,
    }));

    return res.status(200).json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      newClients,
      revenueByPeriod,
      topProducts,
      categoryBreakdown: categoryBreakdownWithPercentage,
    });
  } catch (error: any) {
    console.error('Erro ao gerar relatórios:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatórios', error: error.message });
  }
};

export const exportOrdersCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { period } = req.query;
    let dateCondition = sql`1=1`;

    if (period === '7d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '7 days'`;
    } else if (period === '30d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '30 days'`;
    } else if (period === '90d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '90 days'`;
    }

    const ordersData = await db
      .select({
        id: orders.id,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        contactPhone: orders.contactPhone,
        shippingAddress: orders.shippingAddress,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentId: orders.paymentId,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(dateCondition)
      .orderBy(desc(orders.createdAt));

    const headers = ['ID', 'Cliente', 'Email', 'Telefone', 'Endereço', 'Total', 'Status', 'Status Pagamento', 'ID Pagamento', 'Data'];
    const csvData = ordersData.map(order => ({
      'ID': order.id,
      'Cliente': order.customerName,
      'Email': order.customerEmail,
      'Telefone': order.contactPhone,
      'Endereço': order.shippingAddress,
      'Total': order.totalAmount.toFixed(2),
      'Status': order.status,
      'Status Pagamento': order.paymentStatus || 'N/A',
      'ID Pagamento': order.paymentId || 'N/A',
      'Data': new Date(order.createdAt).toLocaleString('pt-BR'),
    }));

    const csv = generateCSV(csvData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=pedidos_${period || 'todos'}.csv`);
    return res.status(200).send(csv);
  } catch (error: any) {
    console.error('Erro ao exportar pedidos:', error);
    return res.status(500).json({ message: 'Erro ao exportar pedidos', error: error.message });
  }
};

export const exportProductsCSV = async (req: AuthRequest, res: Response) => {
  try {
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        category: products.category,
        flavor: products.flavor,
        price: products.price,
        stock: products.stock,
        puffs: products.puffs,
        nicotine: products.nicotine,
        isActive: products.isActive,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt));

    const headers = ['ID', 'Nome', 'Categoria', 'Sabor', 'Preço', 'Estoque', 'Puffs', 'Nicotina', 'Ativo', 'Data Criação'];
    const csvData = productsData.map(product => ({
      'ID': product.id,
      'Nome': product.name,
      'Categoria': product.category,
      'Sabor': product.flavor || 'N/A',
      'Preço': product.price.toFixed(2),
      'Estoque': product.stock,
      'Puffs': product.puffs || 'N/A',
      'Nicotina': product.nicotine || 'N/A',
      'Ativo': product.isActive ? 'Sim' : 'Não',
      'Data Criação': new Date(product.createdAt).toLocaleString('pt-BR'),
    }));

    const csv = generateCSV(csvData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=produtos.csv');
    return res.status(200).send(csv);
  } catch (error: any) {
    console.error('Erro ao exportar produtos:', error);
    return res.status(500).json({ message: 'Erro ao exportar produtos', error: error.message });
  }
};

export const exportSalesCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { period } = req.query;
    let dateCondition = sql`1=1`;

    if (period === '7d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '7 days'`;
    } else if (period === '30d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '30 days'`;
    } else if (period === '90d') {
      dateCondition = sql`${orders.createdAt} >= NOW() - INTERVAL '90 days'`;
    }

    const salesData = await db
      .select({
        productId: products.id,
        productName: products.name,
        productCategory: products.category,
        productFlavor: products.flavor,
        quantity: sum(orderItems.quantity).mapWith(Number),
        revenue: sql`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase})`.mapWith(Number),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(and(eq(orders.paymentStatus, 'paid'), dateCondition))
      .groupBy(products.id, products.name, products.category, products.flavor)
      .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.priceAtPurchase})`));

    const headers = ['ID Produto', 'Nome', 'Categoria', 'Sabor', 'Quantidade Vendida', 'Receita Gerada'];
    const csvData = salesData.map(sale => ({
      'ID Produto': sale.productId,
      'Nome': sale.productName,
      'Categoria': sale.productCategory,
      'Sabor': sale.productFlavor || 'N/A',
      'Quantidade Vendida': sale.quantity,
      'Receita Gerada': sale.revenue.toFixed(2),
    }));

    const csv = generateCSV(csvData, headers);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=vendas_${period || 'todas'}.csv`);
    return res.status(200).send(csv);
  } catch (error: any) {
    console.error('Erro ao exportar vendas:', error);
    return res.status(500).json({ message: 'Erro ao exportar vendas', error: error.message });
  }
};
