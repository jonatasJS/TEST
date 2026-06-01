import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { ClientSidebar } from './ClientSidebar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex' }}>
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={{ flex: 1, marginLeft: '0', transition: 'margin-left 0.3s ease' }}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1001,
            background: 'var(--primary)',
            border: 'none',
            color: '#fff',
            padding: '0.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'none',
          }}
          className="mobile-only"
        >
          <Menu size={24} />
        </button>

        {children}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-only {
            display: block !important;
          }
        }
        @media (min-width: 1025px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
