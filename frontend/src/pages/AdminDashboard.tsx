import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Users, AlertTriangle, ArrowUpRight, Plus, FileSpreadsheet, Menu, TrendingUp, Package, Clock, CheckCircle, XCircle, Calendar, Activity, Download } from 'lucide-react';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { AdminSidebar } from '../components/AdminSidebar';

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
    totalClients: number;
    pendingOrders: number;
    paidOrders: number;
    shippedOrders: number;
    cancelledOrders: number;
    avgOrderValue: number;
    todayRevenue: number;
    todayOrders: number;
  };
  topProducts: Array<{
    productId: number;
    name: string;
    flavor: string;
    imageUrl: string;
    totalSold: number;
    revenueGenerated: number;
  }>;
  salesHistory: Array<{
    date: string;
    salesCount: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: number;
    customerName: string;
    status: 'pending' | 'paid' | 'shipped' | 'cancelled';
    totalAmount: number;
    createdAt: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Buscar estatísticas administrativas consolidadas via TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiFetch<DashboardData>('/admin/stats'),
    enabled: true, // Será bloqueado no useEffect abaixo se não for admin
  });

  // Redirecionamento de Segurança de Rota se não for Admin
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      alert('Acesso restrito apenas a administradores.');
      navigate({ to: '/login' });
    }
  }, [isAdmin, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Consolidando estatísticas de vendas em tempo real...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--error)' }}>
          <h3>Falha ao sincronizar dados com servidor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Verifique se o backend está ativo e seu usuário possui permissões.</p>
        </div>
      </div>
    );
  }

  const { stats, topProducts, recentOrders } = data;

  const orderStatuses = {
    pending: { label: 'Pendente', color: 'var(--primary)' },
    paid: { label: 'Está Pago', color: 'var(--success)' },
    shipped: { label: 'Enviado', color: 'var(--secondary)' },
    cancelled: { label: 'Cancelado', color: 'var(--error)' },
  };

  const handleExport = async (type: string, period: string = '30d') => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/export/${type}?period=${period}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${period}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar arquivo');
    }
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={{ flex: 1, marginLeft: '0', transition: 'margin-left 0.3s ease', padding: '3.5rem 0' }}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1001,
            background: 'var(--primary)',
            border: 'none',
            color: '#fff',
            padding: '0.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'none',
          }}
          className="mobile-only"
        >
          <Menu size={24} />
        </button>

        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Cabeçalho Admin */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Painel Executivo</span>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginTop: '0.2rem' }}>
              DASHBOARD <span style={{ color: 'var(--primary)' }}>CYBER</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Visão geral completa do negócio em tempo real
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/admin/products" className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              <Plus size={16} />
              Novo Produto
            </Link>
            <Link to="/admin/orders" className="btn btn-secondary" style={{ gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              <FileSpreadsheet size={16} />
              Pedidos
            </Link>
            <button
              onClick={() => handleExport('orders', '30d')}
              className="btn btn-outline-primary"
              style={{ gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              <Download size={16} />
              Exportar Pedidos
            </button>
            <button
              onClick={() => handleExport('sales', '30d')}
              className="btn btn-outline-primary"
              style={{ gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              <Download size={16} />
              Exportar Vendas
            </button>
            <button
              onClick={() => handleExport('products')}
              className="btn btn-outline-primary"
              style={{ gap: '0.4rem', fontSize: '0.8rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              <Download size={16} />
              Exportar Produtos
            </button>
          </div>
        </div>

        {/* KPIs Principais - Linha Superior */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Faturamento Total */}
          <div className="glass" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.15)', background: 'rgba(16, 185, 129, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--success)' }}>Faturamento</span>
              <DollarSign size={16} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', textShadow: '0 0 10px var(--success-glow)' }}>
              R$ {stats.totalRevenue.toFixed(2)}
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>Pedidos pagos e enviados</span>
          </div>

          {/* Pedidos Totais */}
          <div className="glass" style={{ padding: '1.25rem', border: '1px solid rgba(6, 182, 212, 0.15)', background: 'rgba(6, 182, 212, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--secondary)' }}>Pedidos</span>
              <ShoppingCart size={16} style={{ color: 'var(--secondary)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', textShadow: '0 0 10px var(--secondary-glow)' }}>
              {stats.totalOrders}
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>Total de pedidos</span>
          </div>

          {/* Ticket Médio */}
          <div className="glass" style={{ padding: '1.25rem', border: '1px solid rgba(139, 92, 246, 0.15)', background: 'rgba(139, 92, 246, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#8b5cf6' }}>Ticket Médio</span>
              <TrendingUp size={16} style={{ color: '#8b5cf6' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              R$ {stats.avgOrderValue.toFixed(2)}
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>Valor médio por pedido</span>
          </div>

          {/* Clientes */}
          <div className="glass" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Clientes</span>
              <Users size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {stats.totalClients}
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>Total de clientes</span>
          </div>

        </div>

        {/* Métricas Detalhadas - Status dos Pedidos */}
        <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            Status dos Pedidos
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            
            {/* Pendentes */}
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Clock size={14} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>Pendentes</span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{stats.pendingOrders}</span>
            </div>

            {/* Pagos */}
            <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <CheckCircle size={14} style={{ color: 'var(--secondary)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>Pagos</span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{stats.paidOrders}</span>
            </div>

            {/* Enviados */}
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Package size={14} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>Enviados</span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{stats.shippedOrders}</span>
            </div>

            {/* Cancelados */}
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <XCircle size={14} style={{ color: 'var(--error)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--error)', textTransform: 'uppercase' }}>Cancelados</span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{stats.cancelledOrders}</span>
            </div>

          </div>
        </div>

        {/* Métricas de Hoje */}
        <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            Desempenho de Hoje
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dark)', textTransform: 'uppercase' }}>Faturamento Hoje</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', display: 'block', marginTop: '0.2rem' }}>
                R$ {stats.todayRevenue.toFixed(2)}
              </span>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dark)', textTransform: 'uppercase' }}>Pedidos Hoje</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)', display: 'block', marginTop: '0.2rem' }}>
                {stats.todayOrders}
              </span>
            </div>

          </div>
        </div>

        {/* Grade de Tabelas de Controle */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          
          {/* Pedidos Recentes */}
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={16} style={{ color: 'var(--primary)' }} />
                Pedidos Recentes
              </h3>
              <Link to="/admin/orders" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Ver Todos <ArrowUpRight size={12} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Nenhum pedido recente.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                      <th style={{ padding: '0.6rem 0.4rem' }}>ID</th>
                      <th style={{ padding: '0.6rem 0.4rem' }}>Cliente</th>
                      <th style={{ padding: '0.6rem 0.4rem' }}>Status</th>
                      <th style={{ padding: '0.6rem 0.4rem', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '0.6rem 0.4rem', fontWeight: 700, color: 'var(--primary)' }}>#{ord.id}</td>
                        <td style={{ padding: '0.6rem 0.4rem', color: '#fff' }}>{ord.customerName}</td>
                        <td style={{ padding: '0.6rem 0.4rem' }}>
                          <span className="badge" style={{
                            backgroundColor: ord.status === 'paid' ? 'rgba(6,182,212,0.1)' : ord.status === 'shipped' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                            color: ord.status === 'paid' ? 'var(--secondary)' : ord.status === 'shipped' ? 'var(--success)' : 'var(--text-muted)'
                          }}>
                            {orderStatuses[ord.status]?.label || ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.4rem', textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }}>
                          R$ {ord.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Produtos */}
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
              Top Produtos
            </h3>

            {topProducts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Sem dados de vendas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {topProducts.map((prod, index) => (
                  <div key={prod.productId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: index === 0 ? 'var(--primary)' : index === 1 ? 'var(--secondary)' : 'var(--text-dark)', width: '18px' }}>
                      #{index + 1}
                    </div>

                    <img src={prod.imageUrl} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prod.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {prod.totalSold} vendidos
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>
                        R$ {prod.revenueGenerated.toFixed(2)}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Alertas de Estoque */}
        {stats.lowStockCount > 0 && (
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} />
                Alerta de Estoque Baixo
              </h3>
              <Link to="/admin/products" style={{ fontSize: '0.75rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Gerenciar <ArrowUpRight size={12} />
              </Link>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--error)' }}>{stats.lowStockCount}</strong> produtos com estoque abaixo de 5 unidades. Considere reabastecer o estoque.
            </p>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
