import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, ToggleLeft, ToggleRight, Search, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { Product, Category } from '../hooks/useCart';
import { AdminLayout } from '../components/AdminLayout';
import { formatCurrency } from '../utils/formatCurrency';

export const AdminProducts: React.FC = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchVal, setSearchVal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [puffs, setPuffs] = useState('');
  const [nicotine, setNicotine] = useState('');
  const [flavor, setFlavor] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Bloqueio de Rota Admin
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: '/login' });
    }
  }, [isAdmin, authLoading]);

  // Buscar todos os produtos (incluindo inativos)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => apiFetch<{ products: Product[] }>('/products?includeInactive=true'),
  });

  const allProducts = data?.products || [];

  // Buscar categorias ativas para seleção
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<{ categories: Category[] }>('/categories'),
  });

  const categories = categoriesData?.categories || [];

  // Mutações: Criar/Editar Produto
  const mutation = useMutation({
    mutationFn: (variables: { id?: number; body: any }) => {
      const url = variables.id ? `/products/${variables.id}` : '/products';
      const method = variables.id ? 'PUT' : 'POST';
      return apiFetch(url, {
        method,
        body: JSON.stringify(variables.body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Falha ao salvar produto.');
    },
  });

  // Mutação para Alterar Ativação/Excluir (Soft Delete)
  const toggleActiveMutation = useMutation({
    mutationFn: (variables: { id: number; active: boolean }) => {
      return apiFetch(`/products/${variables.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: variables.active }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setImageUrl('');
    setCategoryId('');
    setPuffs('');
    setNicotine('');
    setFlavor('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(String(prod.price));
    setStock(String(prod.stock));
    setImageUrl(prod.imageUrl);
    setCategoryId(prod.categoryId || '');
    setPuffs(prod.puffs ? String(prod.puffs) : '');
    setNicotine(prod.nicotine || '');
    setFlavor(prod.flavor || '');
    setIsActive(prod.isActive);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !stock || !imageUrl || !categoryId) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const body: any = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      imageUrl,
      categoryId,
      puffs: puffs ? parseInt(puffs) : null,
      nicotine: nicotine || null,
      flavor: flavor || null,
      isActive,
    };

    mutation.mutate({
      id: editingProduct?.id,
      body,
    });
  };

  const filteredProducts = allProducts.filter((prod) =>
    prod.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    prod.flavor?.toLowerCase().includes(searchVal.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Acessando catálogo administrativo de produtos...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <Link to="/admin/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&larr; Voltar para Dashboard</Link>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
              GERENCIAR <span style={{ color: 'var(--primary)' }}>PRODUTOS</span>
            </h1>
          </div>
          <button onClick={openAddModal} className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
            <Plus size={16} />
            Novo Produto
          </button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <input
            type="text"
            placeholder="Pesquise por nome do vape ou sabor..."
            className="input-field"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{ paddingLeft: '2.8rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '2.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)' }} />
        </div>

        {/* Tabela de Produtos */}
        <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Img</th>
                <th style={{ padding: '1rem 0.5rem' }}>Nome</th>
                <th style={{ padding: '1rem 0.5rem' }}>Categoria</th>
                <th style={{ padding: '1rem 0.5rem' }}>Sabor</th>
                <th style={{ padding: '1rem 0.5rem' }}>Estoque</th>
                <th style={{ padding: '1rem 0.5rem' }}>Preço</th>
                <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', opacity: prod.isActive ? 1 : 0.5 }}>
                  <td style={{ padding: '0.8rem 0.5rem' }}>
                    <img src={prod.imageUrl} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                  </td>
                  <td style={{ padding: '0.8rem 0.5rem', fontWeight: 600, color: '#fff' }}>{prod.name}</td>
                  <td style={{ padding: '0.8rem 0.5rem', textTransform: 'capitalize' }}>
                    {prod.category?.name || 'Sem categoria'}
                  </td>
                  <td style={{ padding: '0.8rem 0.5rem', color: 'var(--primary)', fontWeight: 500 }}>{prod.flavor || '-'}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>
                    <span style={{ color: prod.stock <= 0 ? 'var(--error)' : prod.stock < 5 ? '#f59e0b' : '#fff', fontWeight: 700 }}>
                      {prod.stock} un
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 0.5rem', fontWeight: 700, color: 'var(--secondary)' }}>{formatCurrency(prod.price)}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>
                    <span className={prod.isActive ? 'badge badge-success' : 'badge badge-danger'}>
                      {prod.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEditModal(prod)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', gap: '0.2rem', borderRadius: '4px' }}>
                        <Edit size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: prod.id, active: !prod.isActive })}
                        className={prod.isActive ? 'btn btn-outline-primary' : 'btn btn-cyber-cyan'}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', gap: '0.2rem', borderRadius: '4px' }}
                      >
                        {prod.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {prod.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL CRIAR/EDITAR (Glassmorphism Modal) */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '1rem' }}>
            <div className="glass-glow-primary" style={{ maxWidth: '600px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              
              {/* Header Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: '#fff' }}>
                  {editingProduct ? 'Editar Especificações Vape' : 'Cadastrar Novo Vape no Estoque'}
                </h3>
                <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Form Modal */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nome do Vape *</label>
                    <input type="text" className="input-field" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Categoria *</label>
                    <select 
                      className="input-field" 
                      value={categoryId} 
                      onChange={(e) => setCategoryId(parseInt(e.target.value))}
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Preço de Venda (R$) *</label>
                    <input type="number" step="0.01" className="input-field" required placeholder="89.90" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quantidade de Estoque *</label>
                    <input type="number" className="input-field" required placeholder="15" value={stock} onChange={(e) => setStock(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>URL da Imagem do Vape *</label>
                  <input type="url" className="input-field" required placeholder="https://unsplash.com/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sabor (Opcional)</label>
                    <input type="text" className="input-field" placeholder="Watermelon Ice" value={flavor} onChange={(e) => setFlavor(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Puffs (Apenas Pods)</label>
                    <input type="number" className="input-field" placeholder="5000" value={puffs} onChange={(e) => setPuffs(e.target.value)} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nicotina (Opcional)</label>
                    <input type="text" className="input-field" placeholder="5%" value={nicotine} onChange={(e) => setNicotine(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Descrição do Vape *</label>
                  <textarea className="input-field" required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                  <label htmlFor="isActive" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>Habilitar produto visível para venda no catálogo</label>
                </div>

                <button type="submit" disabled={mutation.isPending} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', gap: '0.5rem' }}>
                  <Check size={18} />
                  {mutation.isPending ? 'Sincronizando...' : 'Confirmar e Salvar'}
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
