import { NextRequest, NextResponse } from 'next/server';
import { eq, sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

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

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=pedidos_${period || 'todos'}.csv`,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao exportar pedidos:', error);
    return NextResponse.json({ message: 'Erro ao exportar pedidos', error: error.message }, { status: 500 });
  }
}
