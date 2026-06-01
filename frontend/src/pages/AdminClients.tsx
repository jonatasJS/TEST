import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Mail, Calendar, ShoppingBag, DollarSign, Shield, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../components/AdminLayout';

interface Client {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ClientDetails extends Client {
  orders: Array<{
    id: number;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  stats: {
    totalOrders: number;
    totalSpent: number;
  };
}

export const AdminClients: React.FC = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchVal, setSearchVal] = useState('');
  const [expandedClient, setExpandedClient] = useState<number | null>(null);
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);

  // Bloqueio de Rota Admin
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: '/login' });
    }
  }, [isAdmin, authLoading]);

  // Buscar todos os clientes
  const { data, isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => apiFetch<{ clients: Client[] }>('/clients'),
  });

  const allClients = data?.clients || [];

  // Buscar detalhes do cliente quando expandido
  const { data: detailsData, isLoading: detailsLoading } = useQuery({
    queryKey: ['client-details', expandedClient],
    queryFn: () => apiFetch<ClientDetails>(`/clients/${expandedClient}`),
    enabled: expandedClient !== null,
  });

  React.useEffect(() => {
    if (detailsData) {
      setClientDetails(detailsData);
    }
  }, [detailsData]);

  // Mutação para deletar cliente
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiFetch(`/clients/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      setExpandedClient(null);
      setClientDetails(null);
    },
    onError: (err: any) => {
      alert(err.message || 'Falha ao deletar cliente.');
    },
  });

  // Mutação para alterar role
  const roleMutation = useMutation({
    mutationFn: (variables: { id: number; role: string }) => {
      return apiFetch(`/clients/${variables.id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: variables.role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Falha ao alterar role do cliente.');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRoleChange = (id: number, newRole: string) => {
    if (confirm(`Deseja alterar o role do cliente para "${newRole}"?`)) {
      roleMutation.mutate({ id, role: newRole });
    }
  };

  const toggleExpand = async (clientId: number) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
      setClientDetails(null);
    } else {
      setExpandedClient(clientId);
    }
  };

  const filteredClients = allClients.filter((client) =>
    client.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    client.email.toLowerCase().includes(searchVal.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Carregando clientes...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div>
          <Link to="/admin/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&larr; Voltar para Dashboard</Link>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginTop: '0.4rem' }}>
            GERENCIAR <span style={{ color: 'var(--secondary)' }}>CLIENTES</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Visualize e gerencie todos os clientes cadastrados no sistema.
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <input
            type="text"
            placeholder="Pesquise por nome ou email..."
            className="input-field"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{ paddingLeft: '2.8rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '2.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)' }} />
        </div>

        {/* Lista de Clientes */}
        {filteredClients.length === 0 ? (
          <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="glass"
                style={{
                  padding: '1.5rem',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                {/* Header do Cliente */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{client.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Mail size={14} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={client.role === 'admin' ? 'badge badge-success' : 'badge badge-paid'} style={{ fontSize: '0.75rem' }}>
                      {client.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                    <button
                      onClick={() => toggleExpand(client.id)}
                      className="btn btn-outline-primary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.2rem' }}
                    >
                      {expandedClient === client.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {expandedClient === client.id ? 'Recolher' : 'Detalhes'}
                    </button>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {expandedClient === client.id && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    {detailsLoading ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Carregando detalhes...</p>
                    ) : clientDetails ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Estatísticas */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                          <div className="glass" style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                              <ShoppingBag size={14} />
                              <span>Total de Pedidos</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                              {clientDetails.stats.totalOrders}
                            </div>
                          </div>

                          <div className="glass" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                              <DollarSign size={14} />
                              <span>Total Gasto</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                              R$ {clientDetails.stats.totalSpent.toFixed(2)}
                            </div>
                          </div>

                          <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                              <Calendar size={14} />
                              <span>Membro Desde</span>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                              {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>

                        {/* Histórico de Pedidos */}
                        <div>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '0.8rem', fontWeight: 600 }}>
                            Histórico de Pedidos
                          </h4>
                          {clientDetails.orders.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum pedido realizado.</p>
                          ) : (
                            <div style={{ background: '#0a0a0d', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                              {clientDetails.orders.map((order) => (
                                <div
                                  key={order.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.8rem 1.2rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>#{order.id}</span>
                                    <span className={`badge ${order.status === 'paid' ? 'badge-paid' : order.status === 'shipped' ? 'badge-success' : 'badge'}`} style={{ fontSize: '0.7rem' }}>
                                      {order.status === 'paid' ? 'Pago' : order.status === 'shipped' ? 'Enviado' : order.status}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)' }}>
                                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                                    R$ {order.totalAmount.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Ações */}
                        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                          {client.role === 'client' && (
                            <button
                              onClick={() => handleRoleChange(client.id, 'admin')}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.3rem' }}
                            >
                              <Shield size={14} />
                              Tornar Admin
                            </button>
                          )}
                          {client.role === 'admin' && (
                            <button
                              onClick={() => handleRoleChange(client.id, 'client')}
                              className="btn btn-outline-primary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.3rem' }}
                            >
                              Remover Admin
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="btn btn-outline-primary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.3rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                          >
                            <Trash2 size={14} />
                            Deletar
                          </button>
                        </div>

                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
