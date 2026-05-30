import React from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Mail, Phone, MapPin, Package } from 'lucide-react';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  product?: {
    name: string;
    flavor: string;
    imageUrl: string;
  };
}

interface Order {
  id: number;
  createdAt: string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  totalAmount: number;
  shippingAddress: string;
  contactPhone: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
}

export const Account: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const searchParams = useSearch({ from: '/account' }) as any;
  const navigate = useNavigate();

  // Buscar pedidos do usuário logado via TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => apiFetch<{ orders: Order[] }>('/orders/my'),
    enabled: isAuthenticated,
  });

  const ordersList = data?.orders || [];

  // Redirecionar se deslogado após terminar o carregamento do auth
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifySelf: 'center', color: 'var(--text-muted)' }}>
        <p>Carregando perfil e histórico...</p>
      </div>
    );
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-paid">Aprovado</span>;
      case 'shipped':
        return <span className="badge badge-success">Enviado</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelado</span>;
      default:
        return <span className="badge badge-pending">Pendente</span>;
    }
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', padding: '3.5rem 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Banner de Status de Checkout Mercado Pago */}
        {searchParams.payment === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)',
            }}
          >
            <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>PAGAMENTO CONFIRMADO!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Seu pedido #{searchParams.orderId || ''} foi pago com sucesso! A preparação para envio foi iniciada e notificaremos você em breve.
              </p>
            </div>
          </motion.div>
        )}

        {searchParams.payment === 'pending' && (
          <div
            className="glass"
            style={{
              padding: '1.5rem',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <Clock size={36} style={{ color: '#f59e0b' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>PAGAMENTO EM ANÁLISE</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Seu pagamento está sendo processado pelo Mercado Pago. Assim que for confirmado, o status do pedido será atualizado automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* Título de Boas Vindas */}
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
            ÁREA DO <span className="text-gradient-primary">CLIENTE</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Olá, <strong style={{ color: '#fff' }}>{user?.name}</strong>. Acompanhe seus pedidos e dados cadastrais.
          </p>
        </div>

        {/* Informações da Conta & Pedidos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '0.8fr 1.2fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* Coluna Esquerda: Dados Cadastrais */}
          <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
              Dados do Perfil
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-dark)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Nome Completo</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{user?.name}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-dark)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Endereço de E-mail</span>
                <span style={{ color: 'var(--text-muted)' }}>{user?.email}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-dark)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Nível de Acesso</span>
                <span className="badge badge-paid" style={{ display: 'inline-block', marginTop: '0.2rem' }}>
                  {user?.role === 'admin' ? 'Administrador' : 'Cliente Vip'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: '1.2rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <ShieldCheck size={16} />
                <span>Conta Protegida com Criptografia JWT</span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Lista de Pedidos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.25rem', color: '#fff' }}>
              Histórico de Compras ({ordersList.length})
            </h3>

            {ordersList.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Package size={40} style={{ opacity: 0.2 }} />
                <p>Você ainda não realizou nenhuma compra em nossa loja.</p>
                <Link to="/products" className="btn btn-outline-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  Ir para as Compras
                </Link>
              </div>
            ) : (
              ordersList.map((order) => (
                <div
                  key={order.id}
                  className="glass"
                  style={{
                    padding: '1.5rem',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem',
                  }}
                >
                  {/* Cabeçalho do Pedido */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', gap: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pedido </span>
                      <strong style={{ color: 'var(--primary)' }}>#{order.id}</strong>
                      <span style={{ color: 'var(--text-dark)', fontSize: '0.8rem', marginLeft: '0.8rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Detalhes de Contato/Entrega */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <MapPin size={16} style={{ color: 'var(--text-dark)', flexShrink: 0 }} />
                      <span>{order.shippingAddress}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                      <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <Phone size={14} style={{ color: 'var(--text-dark)' }} />
                        {order.contactPhone}
                      </span>
                      <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <Mail size={14} style={{ color: 'var(--text-dark)' }} />
                        {order.customerEmail}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div style={{ background: '#0a0a0d', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--text-dark)', fontWeight: 700 }}>{item.quantity}x</span>
                          <span style={{ color: '#fff' }}>{item.product?.name || `Produto #${item.productId}`}</span>
                          {item.product?.flavor && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>({item.product.flavor})</span>}
                        </div>
                        <span style={{ fontWeight: 600 }}>R$ {(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rodapé do Pedido */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Valor Total Pago:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                      R$ {order.totalAmount.toFixed(2)}
                    </span>
                  </div>

                </div>
              ))
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
