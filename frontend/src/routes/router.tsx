import { createRoute, createRouter } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { Home } from '../pages/Home';
import { Catalog } from '../pages/Catalog';
import { ProductDetails } from '../pages/ProductDetails';
import { CartPage } from '../pages/CartPage';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Account } from '../pages/Account';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminProducts } from '../pages/AdminProducts';
import { AdminOrders } from '../pages/AdminOrders';

// 1. Definição das rotas folha vinculadas à rota raiz
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: Catalog,
});

const productDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$id',
  component: ProductDetails,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: Account,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/products',
  component: AdminProducts,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  component: AdminOrders,
});

// 2. Acoplar todas as rotas filhas na rota raiz
const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailsRoute,
  cartRoute,
  loginRoute,
  registerRoute,
  accountRoute,
  adminDashboardRoute,
  adminProductsRoute,
  adminOrdersRoute,
]);

// 3. Criar a instância do Roteador
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// 4. Registro do Roteador para Autocompletar Caminhos Tipados
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
export type RouterType = typeof router;
