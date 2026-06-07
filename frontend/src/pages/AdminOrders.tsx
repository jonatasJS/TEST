import React from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../components/AdminLayout';
import {
  DeliveryStatus,
  PaymentStatus,
  deliveryStatusLabel,
  normalizeDeliveryStatus,
  normalizePaymentStatus,
  paymentStatusLabel,
} from '../utils/orderLabels';
import { formatCurrency } from '../utils/formatCurrency';

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
  status: string;
  paymentStatus?: string | null;
  deliveryStatus?: DeliveryStatus;
  paymentMethod?: string | null;
  totalAmount: number;
  shippingAddress: string;
  contactPhone: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
}

export const AdminOrders: React.FC = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Bloqueio de Rota Admin
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: '/login' });
    }
  }, [isAdmin, authLoading]);

  // Buscar todos os pedidos via TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiFetch<{ orders: Order[] }>('/orders/admin/all'),
  });

  const ordersList = data?.orders || [];

  // Mutação para atualizar status de pedido
  const statusMutation = useMutation({
    mutationFn: (variables: {
      id: number;
      deliveryStatus?: DeliveryStatus;
      paymentStatus?: PaymentStatus;
    }) => {
      return apiFetch(`/orders/admin/${variables.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          deliveryStatus: variables.deliveryStatus,
          paymentStatus: variables.paymentStatus,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Falha ao atualizar status do pedido.');
    },
  });

  if (authLoading || isLoading) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Acessando central de pedidos e notas fiscais...</p>
      </div>
    );
  }

  const handleDeliveryChange = (orderId: number, nextStatus: DeliveryStatus) => {
    if (confirm(`Alterar entrega do pedido #${orderId} para "${deliveryStatusLabel[nextStatus]}"?`)) {
      statusMutation.mutate({ id: orderId, deliveryStatus: nextStatus });
    }
  };

  const handlePaymentChange = (orderId: number, nextStatus: PaymentStatus) => {
    if (confirm(`Alterar pagamento do pedido #${orderId} para "${paymentStatusLabel[nextStatus]}"?`)) {
      statusMutation.mutate({ id: orderId, paymentStatus: nextStatus });
    }
  };

  return (
    <AdminLayout>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div>
          <Link to="/admin/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&larr; Voltar para Dashboard</Link>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginTop: '0.4rem' }}>
            GERENCIAR <span style={{ color: 'var(--secondary)' }}>PEDIDOS</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Gerencie pagamento e entrega separadamente. O estoque só baixa quando o pedido for marcado como entregue.
          </p>
        </div>

        {/* Lista de Pedidos */}
        {ordersList.length === 0 ? (
          <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Nenhum pedido foi registrado no sistema até o momento.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {ordersList.map((order) => {
              return (
                <div
                  key={order.id}
                  className="glass"
                  style={{
                    padding: '2rem',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
                  {/* Cabeçalho do Bloco */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', gap: '1rem' }}>
                    
                    {/* ID & Hora */}
                    <div>
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Pedido</span>{' '}
                      <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>#{order.id}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginLeft: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pagamento:</span>
                        <select
                          value={normalizePaymentStatus(order.paymentStatus, order.status)}
                          onChange={(e) => handlePaymentChange(order.id, e.target.value as PaymentStatus)}
                          className="input-field"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', minWidth: '140px' }}
                        >
                          <option value="pending">Pendente</option>
                          <option value="paid">Pago</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entrega:</span>
                        <select
                          value={normalizeDeliveryStatus(order.deliveryStatus || order.status)}
                          onChange={(e) => handleDeliveryChange(order.id, e.target.value as DeliveryStatus)}
                          className="input-field"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', minWidth: '180px' }}
                        >
                          <option value="awaiting_courier">Aguardando entregador</option>
                          <option value="on_the_way">A caminho</option>
                          <option value="delivered">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* Informações do Cliente & Entrega */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    
                    {/* Cliente */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>Cliente</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <strong style={{ color: '#fff' }}>{order.customerName}</strong>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                          <Mail size={14} />
                          {order.customerEmail}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                          <Phone size={14} />
                          {order.contactPhone}
                        </span>
                      </div>
                    </div>

                    {/* Entrega */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>Endereço de Entrega</h4>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                        <MapPin size={16} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                        <span style={{ lineHeight: '1.4' }}>{order.shippingAddress}</span>
                      </div>
                    </div>

                    {/* Checkout Details */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '0.4rem', fontWeight: 600 }}>Informações Financeiras</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span>Total: <strong style={{ color: 'var(--secondary)' }}>{formatCurrency(order.totalAmount)}</strong></span>
                        <span>
                          Forma:{' '}
                          <strong style={{ color: '#fff' }}>
                            {order.paymentMethod === 'pix'
                              ? 'PIX'
                              : order.paymentMethod?.includes('credit')
                                ? 'Cartão crédito (na entrega)'
                                : order.paymentMethod?.includes('debit')
                                  ? 'Cartão débito (na entrega)'
                                  : '—'}
                          </strong>
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Detalhes dos Itens */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: 600 }}>Itens do Pedido</h4>
                    <div style={{ background: '#0a0a0d', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.8rem 1.2rem',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            fontSize: '0.88rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>{item.quantity}x</span>
                            <span style={{ color: '#fff', fontWeight: 600 }}>{item.product?.name || `Produto #${item.productId}`}</span>
                            {item.product?.flavor && (
                              <span className="badge badge-paid" style={{ fontSize: '0.7rem' }}>
                                {item.product.flavor}
                              </span>
                            )}
                          </div>

                          <div style={{ textAlign: 'right', fontWeight: 600 }}>
                            {formatCurrency(item.priceAtPurchase * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
