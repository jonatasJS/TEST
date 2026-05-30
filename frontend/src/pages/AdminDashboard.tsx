import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, ArrowUpRight, Plus, Box, FileSpreadsheet } from 'lucide-react';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockCount: number;
    totalClients: number;
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
    paid: { label: 'Aprovado', color: 'var(--secondary)' },
    shipped: { label: 'Enviado', color: 'var(--success)' },
    cancelled: { label: 'Cancelado', color: 'var(--error)' },
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', padding: '3.5rem 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Cabeçalho Admin */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Painel Executivo</span>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
              DASHBOARD <span style={{ color: 'var(--primary)' }}>CYBER</span>
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/admin/products" className="btn btn-outline-primary" style={{ gap: '0.4rem', fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>
              <Plus size={16} />
              Novo Produto
            </Link>
            <Link to="/admin/orders" className="btn btn-secondary" style={{ gap: '0.4rem', fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}>
              <FileSpreadsheet size={16} />
              Gerenciar Pedidos
            </Link>
          </div>
        </div>

        {/* Métricas Principais (Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.5rem' }}>
          
          {/* Faturamento */}
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.15)', background: 'rgba(16, 185, 129, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Faturamento</span>
              <DollarSign size={18} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textShadow: '0 0 10px var(--success-glow)' }}>
              R$ {stats.totalRevenue.toFixed(2)}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Geral aprovado no Mercado Pago</span>
          </div>

          {/* Pedidos */}
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.15)', background: 'rgba(6, 182, 212, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Pedidos</span>
              <ShoppingCart size={18} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textShadow: '0 0 10px var(--secondary-glow)' }}>
              {stats.totalOrders}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Pedidos integrados criados</span>
          </div>

          {/* Clientes */}
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Clientes</span>
              <Users size={18} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {stats.totalClients}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Clientes VIP registrados</span>
          </div>

          {/* Baixo Estoque Alerta */}
          <div className="glass" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--error)', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Estoque Alerta</span>
              <AlertTriangle size={18} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: stats.lowStockCount > 0 ? 'var(--error)' : '#fff', textShadow: stats.lowStockCount > 0 ? '0 0 10px var(--error-glow)' : 'none' }}>
              {stats.lowStockCount}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Itens ativos com menos de 5 un.</span>
          </div>

        </div>

        {/* Grade de Tabelas de Controle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
          
          {/* Lado Esquerdo: Pedidos Recentes */}
          <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', color: '#fff' }}>Vendas Recentes</h3>
              <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Ver Todos <ArrowUpRight size={14} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>Nenhuma venda recente para exibir.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                      <th style={{ padding: '0.8rem 0.5rem' }}>ID</th>
                      <th style={{ padding: '0.8rem 0.5rem' }}>Cliente</th>
                      <th style={{ padding: '0.8rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '0.8rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>#{ord.id}</td>
                        <td style={{ padding: '0.8rem 0.5rem', color: '#fff' }}>{ord.customerName}</td>
                        <td style={{ padding: '0.8rem 0.5rem' }}>
                          <span className="badge" style={{
                            backgroundColor: ord.status === 'paid' ? 'rgba(6,182,212,0.1)' : ord.status === 'shipped' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                            color: ord.status === 'paid' ? 'var(--secondary)' : ord.status === 'shipped' ? 'var(--success)' : 'var(--text-muted)'
                          }}>
                            {orderStatuses[ord.status]?.label || ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }}>
                          R$ {ord.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Lado Direito: Top 5 Produtos Mais Vendidos */}
          <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>
              Produtos Mais Vendidos
            </h3>

            {topProducts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>Dados pendentes de vendas confirmadas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {topProducts.map((prod, index) => (
                  <div key={prod.productId} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    
                    {/* Rank Number */}
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: index === 0 ? 'var(--primary)' : index === 1 ? 'var(--secondary)' : 'var(--text-dark)', width: '20px' }}>
                      #{index + 1}
                    </div>

                    <img src={prod.imageUrl} alt={prod.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prod.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Qtd vendida: <strong style={{ color: '#fff' }}>{prod.totalSold}</strong>
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
                        R$ {prod.revenueGenerated.toFixed(2)}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
