import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Percent, DollarSign, Tag, Check, X } from 'lucide-react';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../components/AdminLayout';
import { formatCurrency } from '../utils/formatCurrency';

interface Promotion {
  id: number;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  value: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number | null;
  currentUsage: number;
  applicableCategories: string | null;
  applicableProducts: string | null;
  createdAt: string;
}

export const AdminPromotions: React.FC = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed_amount' | 'buy_x_get_y'>('percentage');
  const [value, setValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('0');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [usageLimit, setUsageLimit] = useState('');
  const [applicableCategories, setApplicableCategories] = useState('');
  const [applicableProducts, setApplicableProducts] = useState('');

  // Bloqueio de Rota Admin
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: '/login' });
    }
  }, [isAdmin, authLoading]);

  // Buscar todas as promoções
  const { data, isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () => apiFetch<{ promotions: Promotion[] }>('/promotions'),
  });

  const allPromotions = data?.promotions || [];

  // Mutação para Criar/Editar Promoção
  const mutation = useMutation({
    mutationFn: (variables: { id?: number; body: any }) => {
      const url = variables.id ? `/promotions/${variables.id}` : '/promotions';
      const method = variables.id ? 'PUT' : 'POST';
      return apiFetch(url, {
        method,
        body: JSON.stringify(variables.body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
      closeModal();
    },
    onError: (err: any) => {
      alert(err.message || 'Falha ao salvar promoção.');
    },
  });

  // Mutação para Deletar Promoção
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiFetch(`/promotions/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Falha ao deletar promoção.');
    },
  });

  // Mutação para Ativar/Desativar
  const toggleActiveMutation = useMutation({
    mutationFn: (variables: { id: number; active: boolean }) => {
      return apiFetch(`/promotions/${variables.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: variables.active }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
  });

  const openAddModal = () => {
    setEditingPromotion(null);
    setName('');
    setDescription('');
    setType('percentage');
    setValue('');
    setMinPurchaseAmount('0');
    setMaxDiscountAmount('');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setUsageLimit('');
    setApplicableCategories('');
    setApplicableProducts('');
    setIsModalOpen(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromotion(promo);
    setName(promo.name);
    setDescription(promo.description || '');
    setType(promo.type);
    setValue(String(promo.value));
    setMinPurchaseAmount(String(promo.minPurchaseAmount));
    setMaxDiscountAmount(promo.maxDiscountAmount ? String(promo.maxDiscountAmount) : '');
    setStartDate(new Date(promo.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(promo.endDate).toISOString().split('T')[0]);
    setIsActive(promo.isActive);
    setUsageLimit(promo.usageLimit ? String(promo.usageLimit) : '');
    setApplicableCategories(promo.applicableCategories || '');
    setApplicableProducts(promo.applicableProducts || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type || !value || !startDate || !endDate) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const body: any = {
      name,
      description,
      type,
      value: parseFloat(value),
      minPurchaseAmount: parseFloat(minPurchaseAmount),
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      startDate,
      endDate,
      isActive,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      applicableCategories: applicableCategories ? applicableCategories.split(',').map(s => s.trim()) : null,
      applicableProducts: applicableProducts ? applicableProducts.split(',').map(s => s.trim()) : null,
    };

    mutation.mutate({
      id: editingPromotion?.id,
      body,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta promoção?')) {
      deleteMutation.mutate(id);
    }
  };

  const isPromotionActive = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return promo.isActive && now >= start && now <= end;
  };

  const isPromotionExpired = (promo: Promotion) => {
    const now = new Date();
    const end = new Date(promo.endDate);
    return now > end;
  };

  if (authLoading || isLoading) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Carregando promoções...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <Link to="/admin/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&larr; Voltar para Dashboard</Link>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, marginTop: '0.4rem' }}>
              GERENCIAR <span style={{ color: 'var(--primary)' }}>PROMOÇÕES</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Crie descontos por porcentagem, valor fixo ou período especial.
            </p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
            <Plus size={16} />
            Nova Promoção
          </button>
        </div>

        {/* Lista de Promoções */}
        {allPromotions.length === 0 ? (
          <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Nenhuma promoção cadastrada no sistema.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {allPromotions.map((promo) => (
              <div
                key={promo.id}
                className="glass"
                style={{
                  padding: '1.5rem',
                  border: '1px solid var(--border)',
                  background: isPromotionActive(promo) ? 'rgba(16, 185, 129, 0.02)' : isPromotionExpired(promo) ? 'rgba(239, 68, 68, 0.02)' : 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {/* Header do Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>
                      {promo.name}
                    </h3>
                    {promo.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {promo.description}
                      </p>
                    )}
                  </div>
                  <span className={promo.isActive ? 'badge badge-success' : 'badge badge-danger'}>
                    {promo.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                {/* Tipo e Valor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {promo.type === 'percentage' ? (
                    <>
                      <Percent size={24} />
                      <span>{promo.value}% OFF</span>
                    </>
                  ) : promo.type === 'fixed_amount' ? (
                    <>
                      <DollarSign size={24} />
                      <span>{formatCurrency(promo.value)} OFF</span>
                    </>
                  ) : (
                    <>
                      <Tag size={24} />
                      <span>Compre X Ganhe Y</span>
                    </>
                  )}
                </div>

                {/* Detalhes */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} />
                    <span>
                      {new Date(promo.startDate).toLocaleDateString('pt-BR')} até {new Date(promo.endDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {promo.minPurchaseAmount > 0 && (
                    <div>Compra mínima: {formatCurrency(promo.minPurchaseAmount)}</div>
                  )}
                  {promo.usageLimit && (
                    <div>Usos: {promo.currentUsage}/{promo.usageLimit}</div>
                  )}
                  {isPromotionExpired(promo) && (
                    <div style={{ color: 'var(--error)', fontWeight: 600 }}>⚠️ Expirada</div>
                  )}
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button onClick={() => openEditModal(promo)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.8rem', gap: '0.2rem' }}>
                    <Edit size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: promo.id, active: !promo.isActive })}
                    className={promo.isActive ? 'btn btn-outline-primary' : 'btn btn-cyber-cyan'}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', gap: '0.2rem' }}
                  >
                    {promo.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {promo.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => handleDelete(promo.id)} className="btn btn-outline-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', gap: '0.2rem', color: 'var(--error)', borderColor: 'var(--error)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL CRIAR/EDITAR PROMOÇÃO */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '1rem' }}>
            <div className="glass-glow-primary" style={{ maxWidth: '600px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              
              {/* Header Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: '#fff' }}>
                  {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
                </h3>
                <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Form Modal */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nome da Promoção *</label>
                  <input type="text" className="input-field" required placeholder="Black Friday 2024" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Descrição</label>
                  <textarea className="input-field" rows={2} placeholder="Descreva a promoção..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ resize: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tipo de Desconto *</label>
                    <select className="input-field" value={type} onChange={(e) => setType(e.target.value as any)}>
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed_amount">Valor Fixo (R$)</option>
                      <option value="buy_x_get_y">Compre X Ganhe Y</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {type === 'percentage' ? 'Porcentagem (%) *' : type === 'fixed_amount' ? 'Valor (R$) *' : 'Valor *'}
                    </label>
                    <input type="number" step="0.01" className="input-field" required placeholder={type === 'percentage' ? '10' : '10.00'} value={value} onChange={(e) => setValue(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Data Início *</label>
                    <input type="date" className="input-field" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Data Fim *</label>
                    <input type="date" className="input-field" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Compra Mínima (R$)</label>
                    <input type="number" step="0.01" className="input-field" placeholder="0.00" value={minPurchaseAmount} onChange={(e) => setMinPurchaseAmount(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Desconto Máximo (R$)</label>
                    <input type="number" step="0.01" className="input-field" placeholder="Sem limite" value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Limite de Usos</label>
                    <input type="number" className="input-field" placeholder="Ilimitado" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                    <label htmlFor="isActive" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>Promoção Ativa</label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Categorias Aplicáveis (separadas por vírgula)</label>
                  <input type="text" className="input-field" placeholder="disposable, juice, pod_system" value={applicableCategories} onChange={(e) => setApplicableCategories(e.target.value)} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>IDs de Produtos Aplicáveis (separados por vírgula)</label>
                  <input type="text" className="input-field" placeholder="1, 2, 3" value={applicableProducts} onChange={(e) => setApplicableProducts(e.target.value)} />
                </div>

                <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', gap: '0.5rem' }}>
                  <Check size={18} />
                  {mutation.isPending ? 'Salvando...' : 'Confirmar e Salvar'}
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
