import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, ToggleLeft, ToggleRight, Search, X, Check, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from '../components/AdminLayout';

interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  productCount?: number;
}

export const AdminCategories: React.FC = () => {
  const { isAdmin, authLoading } = useAuth() as any;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchVal, setSearchVal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Bloqueio de Rota Admin
  React.useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate({ to: '/login' });
    }
  }, [isAdmin, authLoading]);

  // Buscar todas as categorias (incluindo inativas)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiFetch<{ categories: Category[] }>('/categories?includeInactive=true'),
  });

  const allCategories = data?.categories || [];

  // Mutações: Criar/Editar Categoria
  const mutation = useMutation({
    mutationFn: (variables: { id?: number; body: any }) => {
      const url = variables.id ? `/categories/${variables.id}` : '/categories';
      const method = variables.id ? 'PUT' : 'POST';
      return apiFetch(url, {
        method,
        body: JSON.stringify(variables.body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Falha ao salvar categoria.');
    },
  });

  // Mutação para Alterar Ativação/Excluir (Soft Delete)
  const toggleActiveMutation = useMutation({
    mutationFn: (variables: { id: number; active: boolean }) => {
      return apiFetch(`/categories/${variables.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: variables.active }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setSlug('');
    setImageUrl('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setSlug(cat.slug);
    setImageUrl(cat.imageUrl || '');
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!editingCategory) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const body: any = {
      name,
      description: description || null,
      slug,
      imageUrl: imageUrl || null,
      isActive,
    };

    mutation.mutate({
      id: editingCategory?.id,
      body,
    });
  };

  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchVal.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Carregando categorias...</p>
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
              GERENCIAR <span style={{ color: 'var(--primary)' }}>CATEGORIAS</span>
            </h1>
          </div>
          <button onClick={openAddModal} className="btn btn-primary" style={{ gap: '0.4rem', fontSize: '0.85rem' }}>
            <Plus size={16} />
            Nova Categoria
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <input
            type="text"
            placeholder="Pesquise por nome ou descrição..."
            className="input-field"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{ paddingLeft: '2.8rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '2.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)' }} />
        </div>

        {/* Grid de Categorias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="glass"
              style={{
                padding: '1.5rem',
                border: '1px solid var(--border)',
                opacity: cat.isActive ? 1 : 0.5,
                transition: 'all var(--transition-fast)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                    <Package size={24} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <span className={cat.isActive ? 'badge badge-success' : 'badge badge-danger'}>
                  {cat.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {/* Content */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{cat.name}</h3>
              {cat.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>{cat.description}</p>
              )}
              
              {/* Stats */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Package size={14} />
                  {cat.productCount || 0} produtos
                </span>
                <span>Slug: {cat.slug}</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button onClick={() => openEditModal(cat)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem', gap: '0.2rem', borderRadius: '4px' }}>
                  <Edit size={14} />
                  Editar
                </button>
                <button
                  onClick={() => toggleActiveMutation.mutate({ id: cat.id, active: !cat.isActive })}
                  className={cat.isActive ? 'btn btn-outline-primary' : 'btn btn-cyber-cyan'}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.78rem', gap: '0.2rem', borderRadius: '4px' }}
                >
                  {cat.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {cat.isActive ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL CRIAR/EDITAR */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '1rem' }}>
            <div className="glass-glow-primary" style={{ maxWidth: '500px', width: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              
              {/* Header Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', color: '#fff' }}>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Form Modal */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Nome da Categoria *</label>
                  <input type="text" className="input-field" required value={name} onChange={handleNameChange} placeholder="Ex: Descartáveis" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Slug (URL-friendly) *</label>
                  <input type="text" className="input-field" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Ex: descartaveis" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>Gerado automaticamente a partir do nome</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Descrição (Opcional)</label>
                  <textarea className="input-field" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da categoria..." style={{ resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>URL da Imagem (Opcional)</label>
                  <input type="url" className="input-field" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                  <label htmlFor="isActive" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>Categoria ativa</label>
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
