import React, { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ArrowLeft, Plus, Minus, Star, Flame, Shield } from 'lucide-react';
import { apiFetch } from '../config/api';
import { useCart, Product } from '../hooks/useCart';
import { ClientLayout } from '../components/ClientLayout';

export const ProductDetails: React.FC = () => {
  const { id } = useParams({ from: '/products/$id' }) as any;
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  // Buscar detalhes do produto via TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiFetch<{ product: Product }>(`/products/${id}`),
  });

  const product = data?.product;

  if (isLoading) {
    return (
      <ClientLayout>
        <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p>Carregando especificações técnicas...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error || !product) {
    return (
      <ClientLayout>
        <div style={{ background: '#050505', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <div className="glass" style={{ padding: '3rem 2rem', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--error)' }}>Produto Não Encontrado</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>O produto solicitado não existe ou foi removido do catálogo de vendas.</p>
            <Link to="/products" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <ArrowLeft size={16} />
              Voltar para o Catálogo
            </Link>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleQtyChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      if (qty >= product.stock) {
        alert(`Desculpe! O estoque máximo para este produto é ${product.stock} unidades.`);
      } else {
        setQty((prev) => prev + 1);
      }
    } else {
      setQty((prev) => (prev > 1 ? prev - 1 : 1));
    }
  };

  const handleAdd = () => {
    addToCart(product, qty);
  };

  return (
    <ClientLayout>
      <div style={{ background: '#050505', minHeight: '100vh', padding: '4rem 0' }}>
        <div className="container">
        
        {/* Botão Voltar */}
        <Link
          to="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 500,
            marginBottom: '2.5rem',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          Voltar para o catálogo
        </Link>

        {/* Grade do Produto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          
          {/* Lado Esquerdo: Imagem do Produto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            <div
              className="glass"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                maxHeight: '480px',
                height: '450px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 30px rgba(168,85,247,0.05)',
                position: 'relative',
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {outOfStock && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="badge badge-danger" style={{ fontSize: '1.2rem', padding: '0.6rem 1.5rem', boxShadow: '0 0 15px var(--error-glow)' }}>
                    Esgotado
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Lado Direito: Detalhes Técnicos e Botão Comprar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Header Detalhes */}
            <div>
              <span className="badge badge-paid" style={{ marginBottom: '0.8rem' }}>
                {product.category === 'disposable' ? 'Descartável' : product.category === 'juice' ? 'Juice Premium' : 'Pod System'}
              </span>
              
              <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, lineHeight: '1.1', marginBottom: '0.8rem' }}>
                {product.name}
              </h1>

              {/* Avaliação Estrela Simbolica */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
                <Star size={16} fill="var(--primary)" />
                <Star size={16} fill="var(--primary)" />
                <Star size={16} fill="var(--primary)" />
                <Star size={16} fill="var(--primary)" />
                <Star size={16} fill="var(--primary)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(48 avaliações de clientes)</span>
              </div>
            </div>

            {/* Preço e Status de Estoque */}
            <div
              className="glass"
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Preço Especial</span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)', textShadow: '0 0 15px var(--secondary-glow)' }}>
                  R$ {product.price.toFixed(2)}
                </h2>
              </div>

              <div>
                {outOfStock ? (
                  <span className="badge badge-danger">Sem Estoque</span>
                ) : lowStock ? (
                  <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid #f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.2)' }}>
                    🔥 Apenas {product.stock} no estoque!
                  </span>
                ) : (
                  <span className="badge badge-success">Em Estoque</span>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>Sobre o Produto</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {product.description}
              </p>
            </div>

            {/* Especificações Técnicas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
              
              {product.flavor && (
                <div className="glass" style={{ padding: '0.8rem 1rem', background: '#0a0a0d' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Sabor</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{product.flavor}</span>
                </div>
              )}

              {product.puffs && (
                <div className="glass" style={{ padding: '0.8rem 1rem', background: '#0a0a0d' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Puffs</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)' }}>{product.puffs}</span>
                </div>
              )}

              {product.nicotine && (
                <div className="glass" style={{ padding: '0.8rem 1rem', background: '#0a0a0d' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Teor de Nicotina</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>{product.nicotine}</span>
                </div>
              )}

            </div>

            {/* Compras / Seletor Quantidade */}
            {!outOfStock && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                
                {/* Seletor Quantidade */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Qtd</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#0a0a0d', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.2rem' }}>
                    <button
                      onClick={() => handleQtyChange('dec')}
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem 0.8rem', display: 'flex' }}
                    >
                      <Minus size={15} />
                    </button>
                    <span style={{ fontSize: '1rem', fontWeight: 700, width: '32px', textAlign: 'center' }}>{qty}</span>
                    <button
                      onClick={() => handleQtyChange('inc')}
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem 0.8rem', display: 'flex' }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                {/* Botão de Adicionar */}
                <button
                  onClick={handleAdd}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '1rem', gap: '0.6rem', marginTop: '1.2rem', boxShadow: '0 6px 20px 0 var(--primary-glow)' }}
                >
                  <ShoppingBag size={20} />
                  Adicionar à Sacola
                </button>

              </div>
            )}

            {/* Garantia do Cliente */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} style={{ color: 'var(--success)' }} />
                <span>Garantia de Autenticidade</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={16} style={{ color: 'var(--primary)' }} />
                <span>Bateria Testada Oficial</span>
              </div>
            </div>

          </div>

        </div>

      </div>
      </div>
    </ClientLayout>
  );
};
