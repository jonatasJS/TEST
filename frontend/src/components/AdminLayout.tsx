import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex' }}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div style={{ flex: 1, marginLeft: '0', transition: 'margin-left 0.3s ease', padding: '3.5rem 0' }}>
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
