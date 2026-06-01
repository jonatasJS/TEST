import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { PushNotificationsSetup } from './components/PushNotificationsSetup';
import { router } from './routes/router';
import './index.css';

// 1. Inicializar o cliente do TanStack Query para gerenciamento e cache de requisições
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita re-buscas chatas ao trocar de aba no navegador
      retry: 1,                    // Limitar retentativas em falhas de API
    },
  },
});

// 2. Renderizar aplicação no nó root do HTML
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <PushNotificationsSetup />
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
