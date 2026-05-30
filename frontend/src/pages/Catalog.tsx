import React, { useState, useEffect } from 'react';
import { Link, useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Check, AlertCircle } from 'lucide-react';
import { apiFetch } from '../config/api';
import { Product } from '../hooks/useCart';

export const Catalog: React.FC = () => {
  const searchParams = useSearch({ from: '/products' }) as any;
  const navigate = useNavigate();

  const [searchVal, setSearchVal] = useState(searchParams.search || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || 'all');
  const [sortBy, setSortBy] = useState(searchParams.sort || 'newest');

  // Sincronizar estados com parâmetros da URL se mudarem externamente
  useEffect(() => {
    setSearchVal(searchParams.search || '');
    setSelectedCategory(searchParams.category || 'all');
    setSortBy(searchParams.sort || 'newest');
  }, [searchParams]);

  // Função para disparar atualização na URL
  const updateFilters = (filters: { search?: string; category?: string; sort?: string }) => {
    const nextSearch = { ...searchParams, ...filters };
    
    // Limpar chaves vazias ou padrão
    if (!nextSearch.search) delete nextSearch.search;
    if (nextSearch.category === 'all') delete nextSearch.category;
    if (nextSearch.sort === 'newest') delete nextSearch.sort;

    navigate({
      to: '/products',
      search: nextSearch,
      replace: true,
    });
  };

  // Buscar produtos com filtros ativos via TanStack Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', selectedCategory, searchParams.search, sortBy],
    queryFn: () => {
      const qParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') qParams.append('category', selectedCategory);
      if (searchParams.search) qParams.append('search', searchParams.search);
      if (sortBy) qParams.append('sort', sortBy);
      return apiFetch<{ products: Product[] }>(`/products?${qParams.toString()}`);
    },
  });

  const productList = data?.products || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchVal });
  };

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'disposable', name: 'Descartáveis (Puffs)' },
    { id: 'pod_system', name: 'Pod Systems' },
    { id: 'juice', name: 'Juices Premium' }
  ];

  return (
    <div style={{ background: '#050505', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container">
        
        {/* Título da Seção */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
            EXPLORE O <span className="text-gradient-primary">CATÁLOGO</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Pods descartáveis, juices selecionados e os melhores vaporizadores do mercado.
          </p>
        </div>

        {/* Barra de Filtros / Busca */}
        <div
          className="glass"
          style={{
            padding: '1.2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'rgba(10,10,13,0.5)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Busca e Sort */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', mdGridTemplateColumns: '2fr 1fr', gap: '1rem', width: '100%' }}>
            
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', width: '100%' }}>
              <input
                type="text"
                placeholder="Busque por sabor, marca ou palavra-chave..."
                className="input-field"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                style={{ paddingLeft: '2.8rem', borderRadius: '8px' }}
              />
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dark)',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', padding: '0 1.2rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                Buscar
              </button>
            </form>

            {/* Ordenação */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <SlidersHorizontal size={18} style={{ color: 'var(--text-dark)' }} />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters({ sort: e.target.value });
                }}
                className="input-field"
                style={{ background: '#0a0a0d', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <option value="newest">Lançamento</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="name_asc">Ordem Alfabética</option>
              </select>
            </div>

          </div>

          {/* Categorias Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    updateFilters({ category: cat.id });
                  }}
                  style={{
                    background: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                    color: active ? '#fff' : 'var(--text-muted)',
                    padding: '0.4rem 1.2rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    boxShadow: active ? '0 0 10px var(--primary-glow)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

        </div>

        {/* Listagem Grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="glass" style={{ height: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '100%', height: '220px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }} />
                <div style={{ width: '70%', height: '22px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                <div style={{ width: '40%', height: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : productList.length === 0 ? (
          <div className="glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ color: 'var(--primary)', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>Nenhum produto encontrado</h3>
            <p style={{ maxWidth: '400px', fontSize: '0.9rem' }}>Experimente alterar seus filtros, limpar o campo de busca ou selecionar outra categoria.</p>
            <button
              onClick={() => {
                setSearchVal('');
                setSelectedCategory('all');
                updateFilters({ search: '', category: 'all', sort: 'newest' });
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {productList.map((product) => {
              const outOfStock = product.stock <= 0;
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ y: outOfStock ? 0 : -6 }}
                  className="glass"
                  style={{
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '420px',
                    position: 'relative',
                    border: '1px solid var(--border)',
                    borderColor: outOfStock ? 'rgba(255,255,255,0.03)' : 'var(--border)',
                    opacity: outOfStock ? 0.65 : 1,
                  }}
                >
                  {/* Categoria Badge */}
                  <span
                    className="badge"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      zIndex: 2,
                      background: 'rgba(15, 15, 18, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--secondary)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                    }}
                  >
                    {product.category === 'disposable' ? 'Descartável' : product.category === 'juice' ? 'Juice' : 'Pod System'}
                  </span>

                  {/* Stock Alert */}
                  {outOfStock && (
                    <span
                      className="badge badge-danger"
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 2,
                        boxShadow: '0 0 10px var(--error-glow)',
                      }}
                    >
                      Esgotado
                    </span>
                  )}

                  {/* Imagem do Produto */}
                  <Link to={`/products/$id`} params={{ id: String(product.id) }} style={{ height: '200px', overflow: 'hidden', borderRadius: '10px', display: 'block', border: '1px solid var(--border)', position: 'relative' }}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: outOfStock ? 'grayscale(80%)' : 'none',
                        transition: 'transform 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        if (!outOfStock) e.currentTarget.style.transform = 'scale(1.08)';
                      }}
                      onMouseLeave={(e) => {
                        if (!outOfStock) e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </Link>

                  {/* Detalhes */}
                  <div style={{ marginTop: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <Link to={`/products/$id`} params={{ id: String(product.id) }} style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-title)', display: 'block' }}>
                        {product.name}
                      </Link>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                        Sabor: <span style={{ color: '#fff', fontWeight: 500 }}>{product.flavor || 'Original'}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Preço</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)', textShadow: '0 0 10px var(--secondary-glow)' }}>
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <Link
                        to={`/products/$id`}
                        params={{ id: String(product.id) }}
                        className={outOfStock ? 'btn btn-secondary' : 'btn btn-outline-primary'}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px' }}
                      >
                        {outOfStock ? 'Detalhes' : 'Comprar'}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
