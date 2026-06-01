import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, ShoppingCart, Users, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../components/AdminLayout';

interface ReportData {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  newClients: number;
}

interface ProductReport {
  productId: number;
  name: string;
  category: string;
  totalSold: number;
  revenue: number;
  stock: number;
}

interface CategoryReport {
  category: string;
  totalRevenue: number;
  totalOrders: number;
  percentage: number;
}

export const AdminReports: React.FC = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const navigate = useNavigate();

  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Bloqueio de Rota Admin
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: '/login' });
    }
  }, [isAdmin, authLoading]);

  // Buscar dados de relatórios
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', periodFilter],
    queryFn: () => apiFetch<any>('/admin/reports'),
  });

  const reportData = data || {
    revenueByPeriod: [],
    topProducts: [],
    categoryBreakdown: [],
    paymentMethods: [],
  };

  if (authLoading || isLoading) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Gerando relatórios...</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <Link to="/admin/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&larr; Voltar para Dashboard</Link>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginTop: '0.4rem' }}>
              RELATÓRIOS <span style={{ color: 'var(--secondary)' }}>ANALÍTICOS</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Análise detalhada de vendas, produtos e performance do negócio.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="input-field"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="all">Todo o período</option>
            </select>
            <button className="btn btn-secondary" style={{ gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>

        {/* KPIs Principais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.15)', background: 'rgba(16, 185, 129, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Receita Total</span>
              <DollarSign size={18} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textShadow: '0 0 10px var(--success-glow)' }}>
              {formatCurrency(reportData.totalRevenue || 0)}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Faturamento no período selecionado</span>
          </div>

          <div className="glass" style={{ padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.15)', background: 'rgba(6, 182, 212, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Pedidos</span>
              <ShoppingCart size={18} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textShadow: '0 0 10px var(--secondary-glow)' }}>
              {reportData.totalOrders || 0}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Total de pedidos realizados</span>
          </div>

          <div className="glass" style={{ padding: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.15)', background: 'rgba(139, 92, 246, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b5cf6', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Ticket Médio</span>
              <TrendingUp size={18} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {formatCurrency(reportData.avgOrderValue || 0)}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Valor médio por pedido</span>
          </div>

          <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Novos Clientes</span>
              <Users size={18} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {reportData.newClients || 0}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Clientes cadastrados</span>
          </div>

        </div>

        {/* Gráficos e Tabelas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Vendas por Período */}
          <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>
              Vendas por Período
            </h3>

            {reportData.revenueByPeriod?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                Sem dados para o período selecionado.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {reportData.revenueByPeriod?.map((item: ReportData, index: number) => {
                  const maxValue = Math.max(...reportData.revenueByPeriod.map((d: ReportData) => d.revenue));
                  const percentage = (item.revenue / maxValue) * 100;
                  const isGrowth = index > 0 && item.revenue >= reportData.revenueByPeriod[index - 1].revenue;

                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '80px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.period}
                      </div>
                      <div style={{ flex: 1, height: '32px', background: '#0a0a0d', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                      <div style={{ width: '60px', textAlign: 'right', fontSize: '0.8rem', color: isGrowth ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                        {isGrowth ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {item.orders}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Breakdown por Categoria */}
          <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>
              Vendas por Categoria
            </h3>

            {reportData.categoryBreakdown?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                Sem dados disponíveis.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reportData.categoryBreakdown?.map((item: CategoryReport, index: number) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>
                        {item.category === 'disposable' ? 'Descartável' : item.category === 'juice' ? 'Juice' : item.category === 'pod_system' ? 'Pod System' : item.category}
                      </span>
                      <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>
                        {formatCurrency(item.totalRevenue)}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#0a0a0d', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          background: index === 0 ? 'var(--primary)' : index === 1 ? 'var(--secondary)' : index === 2 ? 'var(--success)' : '#8b5cf6',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {item.totalOrders} pedidos ({item.percentage.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Top Produtos */}
        <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>
            Top Produtos por Receita
          </h3>

          {reportData.topProducts?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              Sem dados de produtos disponíveis.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                    <th style={{ padding: '0.8rem 0.5rem' }}>Rank</th>
                    <th style={{ padding: '0.8rem 0.5rem' }}>Produto</th>
                    <th style={{ padding: '0.8rem 0.5rem' }}>Categoria</th>
                    <th style={{ padding: '0.8rem 0.5rem' }}>Vendidos</th>
                    <th style={{ padding: '0.8rem 0.5rem' }}>Estoque</th>
                    <th style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topProducts?.map((product: ProductReport, index: number) => (
                    <tr key={product.productId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.8rem 0.5rem', fontWeight: 800, color: index < 3 ? 'var(--primary)' : '#fff' }}>
                        #{index + 1}
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem', fontWeight: 600, color: '#fff' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem', textTransform: 'capitalize' }}>
                        {product.category === 'disposable' ? 'Descartável' : product.category === 'juice' ? 'Juice' : 'Pod System'}
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem', fontWeight: 700, color: 'var(--secondary)' }}>
                        {product.totalSold}
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem' }}>
                        <span style={{ color: product.stock <= 0 ? 'var(--error)' : product.stock < 5 ? '#f59e0b' : '#fff', fontWeight: 700 }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};
