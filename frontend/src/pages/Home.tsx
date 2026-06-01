import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Truck, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { apiFetch } from '../config/api';
import { Product } from '../hooks/useCart';
import { ClientLayout } from '../components/ClientLayout';
import { formatCurrency } from '../utils/formatCurrency';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Buscar produtos para a vitrine
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => apiFetch<{ products: Product[] }>('/products?limit=3'),
  });

  const featured = data?.products?.slice(0, 3) || [];

  const categories = [
    { id: 'disposable', name: 'Pods Descartáveis', desc: 'Práticos, diversos sabores e alto puffs', count: '5000+ Puffs', color: 'var(--primary)', glow: 'var(--primary-glow)', img: 'https://images.unsplash.com/photo-1527137341206-1aa2539bbff6?q=80&w=400' },
    { id: 'pod_system', name: 'Pod Systems', desc: 'Dispositivos recarregáveis duráveis', count: 'Recarregáveis', color: 'var(--secondary)', glow: 'var(--secondary-glow)', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400' },
    { id: 'juice', name: 'Juices Premium', desc: 'Líquidos nacionais e importados freebase/nic salt', count: 'Freebase & Salt', color: 'var(--success)', glow: 'var(--success-glow)', img: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?q=80&w=400' }
  ];

  return (
    <ClientLayout>
      <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* SEÇÃO HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '6rem 0 4rem 0', borderBottom: '1px solid var(--border)' }}>
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', width: '400px', height: '400px', background: 'var(--primary-glow)', filter: 'blur(150px)', borderRadius: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '300px', height: '300px', background: 'var(--secondary-glow)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          
          {/* Hero Texto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '0.4rem 1rem', borderRadius: '9999px', width: 'fit-content' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nova Coleção Cyber 2026</span>
            </div>

            <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, fontFamily: 'var(--font-title)', fontWeight: 800, letterSpacing: '-0.04em' }}>
              SABOR INTENSO.<br />
              <span className="text-gradient-cyber" style={{ textShadow: '0 0 30px rgba(6,182,212,0.2)' }}>DESIGN CYBERNÉTICO.</span>
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '540px', lineHeight: '1.6' }}>
              Explore nossa curadoria de pods descartáveis e vaporizadores recarregáveis. Visual futurista, sabores vibrantes e entrega ultrarrápida.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button onClick={() => navigate({ to: '/products' })} className="btn btn-primary" style={{ gap: '0.6rem', padding: '0.9rem 2rem' }}>
                Ver Catálogo
                <ChevronRight size={18} />
              </button>
              <a href="#categories" className="btn btn-secondary" style={{ padding: '0.9rem 2rem' }}>
                Categorias
              </a>
            </div>
          </motion.div>

          {/* Hero Banner Imagem / Animação */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{
                position: 'relative',
                width: '320px',
                height: '380px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(6,182,212,0.15) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Moldura / Pod Ilustrativo */}
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <span style={{ fontSize: '7rem', filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.6))' }}>💨</span>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', color: '#fff', marginTop: '1rem', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>IGNITE V50</h3>
                <span className="badge badge-success" style={{ marginTop: '0.5rem', boxShadow: '0 0 10px var(--success-glow)' }}>Watermelon Ice</span>
              </div>

              {/* Detalhes de grade cibernética no card */}
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>PUFFS: 5000</span>
                <span>NIC: 5%</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ padding: '3.5rem 0', background: 'rgba(255, 255, 255, 0.01)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.7rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <Zap size={22} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>Envio Instantâneo</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Despachamos no mesmo dia útil com frete expresso para todo o território nacional.</p>
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.7rem', borderRadius: '10px', color: 'var(--secondary)' }}>
              <Truck size={22} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>Frete Grátis</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aproveite frete gratuito em compras acima de R$ 250,00 para regiões selecionadas.</p>
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.7rem', borderRadius: '10px', color: 'var(--success)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>100% Originais</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Garantia total de originalidade com código de verificação oficial do fabricante.</p>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO CATEGORIAS */}
      <section id="categories" style={{ padding: '5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>NOSSAS <span style={{ color: 'var(--primary)' }}>LINHAS</span></h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Selecione a categoria perfeita para a sua sessão</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -8 }}
                onClick={() => navigate({ to: '/products', search: { category: cat.id } as any })}
                style={{
                  position: 'relative',
                  height: '240px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
                }}
              >
                {/* Background Image */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `linear-gradient(to top, rgba(5,5,5,0.95) 20%, rgba(5,5,5,0.2) 80%), url(${cat.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.5s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Conteúdo */}
                <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem', width: '100%' }}>
                  <span className="badge" style={{ backgroundColor: cat.glow, color: cat.color, border: `1px solid ${cat.color}`, marginBottom: '0.5rem' }}>
                    {cat.count}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.35rem', color: '#fff', marginBottom: '0.2rem' }}>{cat.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO VITRINE MOCK */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>VAPES EM <span style={{ color: 'var(--secondary)' }}>DESTAQUE</span></h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>Os campeões de vendas com melhor avaliação</p>
            </div>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Ver Todos <ChevronRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass" style={{ height: '380px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                  <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }} className="glow-text" />
                  <div style={{ width: '60%', height: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                  <div style={{ width: '40%', height: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
              {featured.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -6 }}
                  className="glass"
                  style={{
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '420px',
                    position: 'relative',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Categoria Badge */}
                  <span
                    className="badge badge-success"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      zIndex: 2,
                      background: 'rgba(15, 15, 18, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    {product.category === 'disposable' ? 'Descartável' : product.category === 'juice' ? 'Juice' : 'Pod System'}
                  </span>

                  {/* Imagem do Produto */}
                  <Link to={`/products/$id`} params={{ id: String(product.id) }} style={{ height: '200px', overflow: 'hidden', borderRadius: '10px', display: 'block', border: '1px solid var(--border)', position: 'relative' }}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </Link>

                  {/* Detalhes */}
                  <div style={{ marginTop: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <Link 
                        to={`/products/$id`} 
                        params={{ id: String(product.id) }} 
                        style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-title)', display: 'block', color: '#fff', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                      >
                        {product.name}
                      </Link>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                        Flavor: <span style={{ color: '#fff', fontWeight: 500 }}>{product.flavor || 'Padrão'}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Preço</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)', textShadow: '0 0 10px var(--secondary-glow)' }}>
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <Link
                        to={`/products/$id`}
                        params={{ id: String(product.id) }}
                        className="btn btn-outline-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px' }}
                      >
                        Comprar
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
    </ClientLayout>
  );
};
