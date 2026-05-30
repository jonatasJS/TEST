import React from 'react';
import { Link } from '@tanstack/react-router';
import { ShoppingBag, User, LogOut, LayoutDashboard, Compass } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid var(--border)',
        borderRadius: 0,
        background: 'rgba(5, 5, 5, 0.75)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Logotipo */}
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span style={{ color: '#fff' }}>CYBER</span>
          <span
            style={{
              color: 'var(--primary)',
              textShadow: '0 0 10px var(--primary-glow)',
            }}
          >
            VAPES
          </span>
        </Link>

        {/* Links Centrais */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link
            to="/products"
            className="text-muted"
            activeProps={{ style: { color: 'var(--primary)', textShadow: '0 0 8px var(--primary-glow)' } }}
            style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Compass size={18} />
            Catálogo
          </Link>
        </nav>

        {/* Ações Direitas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {/* Link do Admin */}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin/dashboard"
              className="btn btn-outline-primary"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
                gap: '0.3rem',
              }}
            >
              <LayoutDashboard size={15} />
              Painel
            </Link>
          )}

          {/* Carrinho Ícone */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              padding: '0.4rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <ShoppingBag size={22} className="glow-text" style={{ color: 'var(--secondary)' }} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px var(--primary-glow)',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Área do Usuário */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Link
                to="/account"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    padding: '0.3rem',
                    borderRadius: '50%',
                    display: 'flex',
                  }}
                >
                  <User size={16} />
                </div>
                <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  padding: '0.4rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--error)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
              }}
            >
              <User size={15} />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
