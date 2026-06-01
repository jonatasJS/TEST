import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { Home, Package, ShoppingCart, User, LogOut, X } from 'lucide-react';

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/products', label: 'Produtos', icon: Package },
    { path: '/cart', label: 'Carrinho', icon: ShoppingCart },
    { path: '/account', label: 'Minha Conta', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'block',
          }}
          className="desktop-hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: isOpen ? 0 : '-280px',
          top: 0,
          width: '280px',
          height: '100vh',
          background: '#0a0a0d',
          borderRight: '1px solid var(--border)',
          zIndex: 1000,
          transition: 'left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: 800, color: '#fff' }}>
            VAPES <span style={{ color: 'var(--primary)' }}>SHOP</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Sua loja de vapes
          </p>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => onClose()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: isActive(item.path) ? '#fff' : 'var(--text-muted)',
                      background: isActive(item.path) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      border: isActive(item.path) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#fff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <Link
            to="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              background: 'transparent',
              border: '1px solid var(--border)',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'var(--error)';
              e.currentTarget.style.color = 'var(--error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <LogOut size={18} />
            Sair
          </Link>
        </div>

        {/* Botão Fechar (Mobile) */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '4px',
            display: 'none',
          }}
          className="mobile-only"
        >
          <X size={20} />
        </button>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-hidden {
            display: block !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
        @media (min-width: 1025px) {
          .desktop-hidden {
            display: none !important;
          }
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
