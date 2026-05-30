import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { AgeGate } from '../components/AgeGate';

export const RootRouteComponent: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Barreira de Verificação de Idade +18 */}
      <AgeGate />
      
      {/* Navegação Topo */}
      <Navbar />

      {/* Conteúdo da Rota Ativa */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* Gaveta do Carrinho Deslizante */}
      <CartDrawer />

      {/* Rodapé Comercial */}
      <Footer />
    </div>
  );
};

export const rootRoute = createRootRoute({
  component: RootRouteComponent,
});
