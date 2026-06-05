# Guia Completo de Reprodução - CyberVapes E-commerce

## 📋 Visão Geral do Projeto

**Nome do Projeto:** CyberVapes / Loja Vapes Fullstack  
**Tipo:** E-commerce Fullstack de Pods Premium  
**Arquitetura:** Monorepo com Workspaces (Frontend + Backend)  
**Versão:** 1.0.0  

Este é um sistema de e-commerce completo para venda de produtos de vape (pods descartáveis, juices, mods, acessórios) com painel administrativo integrado, sistema de pagamentos via Mercado Pago, notificações push, e upload de imagens com Cloudinary.

---

## 🛠 Stack Tecnológica Completa

### Frontend
- **Framework:** React 18.3.1
- **Linguagem:** TypeScript 5.4.2
- **Build Tool:** Vite 5.2.11
- **Roteamento:** @tanstack/react-router 1.34.6
- **Gerenciamento de Estado/Cache:** @tanstack/react-query 5.37.1
- **Animações:** Framer Motion 11.2.6
- **Ícones:** Lucide React 0.379.0
- **Upload de Imagens:** react-easy-crop 5.5.7, browser-image-compression 2.0.2
- **Notificações:** react-hot-toast 2.6.0
- **Plugin React:** @vitejs/plugin-react 4.3.0

### Backend
- **Framework:** Express 4.19.2
- **Linguagem:** TypeScript 5.4.5
- **ORM:** Drizzle ORM 0.30.10
- **Banco de Dados:** PostgreSQL (via Neon Cloud)
- **Driver do Banco:** pg 8.11.5
- **Autenticação:** JWT (jsonwebtoken 9.0.2)
- **Hash de Senhas:** bcryptjs 2.4.3
- **Upload de Imagens:** Cloudinary 2.10.0
- **Pagamentos:** Mercado Pago SDK 2.0.15
- **Notificações Push:** web-push 3.6.7
- **CORS:** cors 2.8.5
- **Cookies:** cookie-parser 1.4.6
- **Variáveis de Ambiente:** dotenv 16.4.5
- **Upload de Arquivos:** multer 2.1.1
- **Runtime:** tsx 4.11.0 (para desenvolvimento)

### DevOps / Ferramentas
- **Gerenciador de Pacotes:** npm / pnpm (suporta ambos)
- **Workspaces:** npm workspaces / pnpm workspaces
- **Execução Paralela:** concurrently 8.2.2
- **Migrations:** drizzle-kit 0.21.4

---

## 📁 Estrutura Completa do Projeto

```
TEST/
├── .cursor/                    # Configurações do Cursor IDE
├── .git/                       # Controle de versão
├── .gitignore                  # Arquivos ignorados pelo Git
├── .env                        # Variáveis de ambiente (vazio na raiz)
├── package.json                # Configuração do monorepo
├── package-lock.json           # Lock do npm
├── pnpm-lock.yaml             # Lock do pnpm
├── proximos_passos.md          # Documentação de próximos passos (upload de imagens)
├── GUIA_REPRODUCAO_COMPLETO.md # Este documento
│
├── backend/                    # API Backend
│   ├── .env                    # Variáveis de ambiente do backend
│   ├── .env.example            # Template de variáveis de ambiente
│   ├── .gitignore
│   ├── drizzle.config.ts       # Configuração do Drizzle ORM
│   ├── package.json            # Dependências do backend
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── tsconfig.json           # Configuração TypeScript
│   └── src/
│       ├── index.ts            # Ponto de entrada do servidor
│       ├── controllers/        # Controladores da API
│       │   ├── adminController.ts
│       │   ├── authController.ts
│       │   ├── checkoutController.ts
│       │   ├── clientController.ts
│       │   ├── notificationController.ts
│       │   ├── orderController.ts
│       │   ├── productController.ts
│       │   └── promotionController.ts
│       ├── db/                 # Configuração do banco de dados
│       │   ├── schema.ts       # Schema do banco (Drizzle)
│       │   ├── migrations/     # Migrations do banco
│       │   ├── seed.ts         # Dados iniciais
│       │   └── index.ts        # Conexão com o banco
│       ├── middleware/         # Middlewares
│       │   └── auth.ts         # Middleware de autenticação
│       ├── routes/             # Rotas da API
│       │   ├── adminRoutes.ts
│       │   ├── authRoutes.ts
│       │   ├── checkoutRoutes.ts
│       │   ├── clientRoutes.ts
│       │   ├── notificationRoutes.ts
│       │   ├── orderRoutes.ts
│       │   ├── productRoutes.ts
│       │   └── promotionRoutes.ts
│       ├── services/           # Serviços
│       │   └── notificationService.ts
│       └── utils/              # Utilitários
│           ├── cloudinary.ts   # Configuração Cloudinary
│           └── orderStatus.ts  # Utilitários de status de pedido
│
└── frontend/                   # Aplicação React
    ├── .gitignore
    ├── index.html              # HTML de entrada
    ├── package.json            # Dependências do frontend
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── tsconfig.json           # Configuração TypeScript
    ├── vite.config.ts          # Configuração Vite
    ├── public/                 # Arquivos estáticos
    └── src/
        ├── main.tsx            # Ponto de entrada React
        ├── index.css           # Estilos globais
        ├── components/         # Componentes React
        │   ├── AdminLayout.tsx
        │   ├── AdminSidebar.tsx
        │   ├── AgeGate.tsx     # Verificação de idade
        │   ├── CartDrawer.tsx  # Carrinho lateral
        │   ├── ClientLayout.tsx
        │   ├── ClientSidebar.tsx
        │   ├── Footer.tsx
        │   ├── Navbar.tsx
        │   └── PushNotificationsSetup.tsx
        ├── config/             # Configurações
        │   └── api.ts          # Configuração da API
        ├── hooks/              # Hooks personalizados
        │   ├── useAuth.tsx     # Hook de autenticação
        │   ├── useCart.tsx     # Hook do carrinho
        │   ├── useCartAnimation.tsx
        │   └── usePushNotifications.ts
        ├── pages/              # Páginas da aplicação
        │   ├── Account.tsx     # Página da conta do usuário
        │   ├── AdminClients.tsx
        │   ├── AdminDashboard.tsx
        │   ├── AdminOrders.tsx
        │   ├── AdminProducts.tsx
        │   ├── AdminPromotions.tsx
        │   ├── AdminReports.tsx
        │   ├── CartPage.tsx    # Página do carrinho
        │   ├── Catalog.tsx     # Catálogo de produtos
        │   ├── ErrorPage.tsx   # Página de erro
        │   ├── Home.tsx        # Página inicial
        │   ├── Login.tsx       # Página de login
        │   ├── ProductDetails.tsx
        │   └── Register.tsx    # Página de registro
        ├── routes/             # Configuração de rotas
        │   ├── __root.tsx      # Rota raiz
        │   └── router.tsx      # Configuração do router
        └── utils/              # Utilitários
            ├── formatCurrency.ts
            └── orderLabels.ts
```

---

## 🗄️ Banco de Dados - Schema Completo

### Tabelas do Banco de Dados (PostgreSQL via Drizzle ORM)

#### 1. **users** - Usuários do Sistema
```typescript
{
  id: serial (PK)
  name: varchar(255) NOT NULL
  email: varchar(255) UNIQUE NOT NULL
  password_hash: text NOT NULL
  role: varchar(50) DEFAULT 'client' NOT NULL  // 'admin' ou 'client'
  phone: varchar(50)
  address: text
  profile_image: text
  created_at: timestamp DEFAULT NOW() NOT NULL
}
```

#### 2. **products** - Catálogo de Produtos
```typescript
{
  id: serial (PK)
  name: varchar(255) NOT NULL
  description: text NOT NULL
  price: double precision NOT NULL
  stock: integer NOT NULL
  image_url: text NOT NULL
  category: varchar(100) NOT NULL  // 'disposable', 'juice', 'pod_system', 'accessories'
  puffs: integer  // Opcional (apenas para pod descartável)
  nicotine: varchar(50)  // Opcional (ex: "5%", "50mg")
  flavor: varchar(150)  // Opcional (ex: "Watermelon Ice", "Blue Razz")
  is_active: boolean DEFAULT true NOT NULL
  created_at: timestamp DEFAULT NOW() NOT NULL
}
```

#### 3. **orders** - Pedidos
```typescript
{
  id: serial (PK)
  user_id: integer (FK → users.id, ON DELETE SET NULL)
  status: varchar(50) DEFAULT 'awaiting_courier' NOT NULL
  // Status de entrega: awaiting_courier | on_the_way | delivered | cancelled
  total_amount: double precision NOT NULL
  payment_id: varchar(255)
  payment_status: varchar(50) DEFAULT 'pending' NOT NULL
  // Status de pagamento: pending | paid | cancelled
  payment_method: varchar(50)
  // Métodos: pix | on_delivery_credit | on_delivery_debit
  stock_deducted: boolean DEFAULT false NOT NULL
  shipping_address: text NOT NULL
  contact_phone: varchar(50) NOT NULL
  customer_name: varchar(255) NOT NULL
  customer_email: varchar(255) NOT NULL
  created_at: timestamp DEFAULT NOW() NOT NULL
}
```

#### 4. **order_items** - Itens do Pedido
```typescript
{
  id: serial (PK)
  order_id: integer (FK → orders.id, ON DELETE CASCADE) NOT NULL
  product_id: integer (FK → products.id, ON DELETE SET NULL)
  quantity: integer NOT NULL
  price_at_purchase: double precision NOT NULL
}
```

#### 5. **promotions** - Promoções e Descontos
```typescript
{
  id: serial (PK)
  name: varchar(255) NOT NULL
  description: text
  type: varchar(50) NOT NULL
  // Tipos: 'percentage', 'fixed_amount', 'buy_x_get_y'
  value: double precision NOT NULL
  // Valor do desconto (ex: 10 para 10% ou 10.00 para R$10)
  min_purchase_amount: double precision DEFAULT 0
  max_discount_amount: double precision
  start_date: timestamp NOT NULL
  end_date: timestamp NOT NULL
  is_active: boolean DEFAULT true NOT NULL
  usage_limit: integer  // Limite de usos (null = ilimitado)
  current_usage: integer DEFAULT 0 NOT NULL
  applicable_categories: text  // JSON array de categorias
  applicable_products: text  // JSON array de IDs de produtos
  created_at: timestamp DEFAULT NOW() NOT NULL
}
```

#### 6. **push_subscriptions** - Assinaturas de Notificações Push
```typescript
{
  id: serial (PK)
  user_id: integer (FK → users.id, ON DELETE CASCADE) NOT NULL
  endpoint: text UNIQUE NOT NULL
  p256dh: text NOT NULL
  auth: text NOT NULL
  created_at: timestamp DEFAULT NOW() NOT NULL
}
```

### Relações entre Tabelas
- **users** → **orders** (one-to-many)
- **users** → **push_subscriptions** (one-to-many)
- **products** → **order_items** (one-to-many)
- **orders** → **order_items** (one-to-many)
- **orders** → **users** (many-to-one)

---

## 🔌 Endpoints da API (Backend)

### Base URL: `http://localhost:5000/api`

### Autenticação (`/api/auth`)
- `POST /register` - Registro de novo usuário
- `POST /login` - Login do usuário (retorna JWT cookie)
- `POST /logout` - Logout do usuário
- `GET /me` - Obter dados do usuário autenticado
- `PUT /profile` - Atualizar perfil do usuário

### Produtos (`/api/products`)
- `GET /` - Listar todos os produtos (com filtros por categoria)
- `GET /:id` - Obter detalhes de um produto
- `POST /` - Criar novo produto (admin)
- `PUT /:id` - Atualizar produto (admin)
- `DELETE /:id` - Deletar produto (admin)

### Pedidos (`/api/orders`)
- `GET /` - Listar pedidos do usuário autenticado
- `GET /:id` - Obter detalhes de um pedido
- `POST /` - Criar novo pedido
- `PUT /:id/status` - Atualizar status do pedido (admin)
- `DELETE /:id` - Cancelar pedido

### Checkout (`/api/checkout`)
- `POST /create-preference` - Criar preferência de pagamento Mercado Pago
- `POST /webhook` - Webhook para notificações do Mercado Pago
- `GET /payment/:id` - Obter status do pagamento

### Admin (`/api/admin`)
- `GET /dashboard` - Estatísticas do dashboard
- `GET /stats` - Estatísticas gerais

### Promoções (`/api/promotions`)
- `GET /` - Listar promoções ativas
- `GET /:id` - Obter detalhes de uma promoção
- `POST /` - Criar nova promoção (admin)
- `PUT /:id` - Atualizar promoção (admin)
- `DELETE /:id` - Deletar promoção (admin)
- `POST /apply` - Aplicar cupom de desconto

### Clientes (`/api/clients`)
- `GET /` - Listar todos os clientes (admin)
- `GET /:id` - Obter detalhes de um cliente (admin)

### Notificações (`/api/notifications`)
- `POST /subscribe` - Assinar notificações push
- `POST /send` - Enviar notificação push (admin)

### Upload de Imagens
- `POST /upload/avatar` - Upload de avatar para Cloudinary

---

## 🌐 Rotas do Frontend (React Router)

### Rotas Públicas
- `/` - **Home** - Página inicial com destaque de produtos
- `/products` - **Catalog** - Catálogo completo de produtos
- `/products/:id` - **ProductDetails** - Detalhes de um produto específico
- `/cart` - **CartPage** - Página do carrinho de compras
- `/login` - **Login** - Página de login
- `/register` - **Register** - Página de registro

### Rotas do Cliente
- `/account` - **Account** - Página da conta do usuário (pedidos, perfil)

### Rotas do Admin
- `/admin/dashboard` - **AdminDashboard** - Dashboard administrativo
- `/admin/products` - **AdminProducts** - Gestão de produtos
- `/admin/orders` - **AdminOrders** - Gestão de pedidos
- `/admin/promotions` - **AdminPromotions** - Gestão de promoções
- `/admin/clients` - **AdminClients** - Gestão de clientes
- `/admin/reports` - **AdminReports** - Relatórios e estatísticas

### Outras
- `*` - **ErrorPage** - Página de erro 404

---

## ⚙️ Variáveis de Ambiente

### Backend (.env)
```bash
# Servidor
PORT=5000

# Banco de Dados PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Autenticação JWT
JWT_SECRET=sua_chave_secreta_jwt_aqui

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_de_teste
MERCADO_PAGO_PUBLIC_KEY=seu_public_key_de_teste
WEBHOOK_URL=http://localhost:5000/api/checkout/webhook

# Web Push Notifications (gerar com: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=sua_chave_publica_vapid
VAPID_PRIVATE_KEY=sua_chave_privada_vapid
VAPID_EMAIL=mailto:admin@cybervapes.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
```

### Frontend
O frontend usa a configuração da API em `src/config/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 🔑 Serviços Externos Necessários

### 1. **Neon PostgreSQL** (Banco de Dados)
- Criar conta em: https://neon.tech
- Criar um projeto PostgreSQL
- Copiar a connection string
- Adicionar ao `.env` como `DATABASE_URL`

### 2. **Mercado Pago** (Pagamentos)
- Criar conta de desenvolvedor: https://www.mercadopago.com.br/developers
- Criar uma aplicação de teste
- Obter Access Token e Public Key
- Configurar webhook URL (usar ngrok em desenvolvimento local)
- Adicionar ao `.env`

### 3. **Cloudinary** (Upload de Imagens)
- Criar conta: https://cloudinary.com
- Criar um "Cloud" (nome único)
- Obter API Key, API Secret e Cloud Name
- Adicionar ao `.env`

### 4. **Web Push VAPID Keys** (Notificações Push)
- Gerar chaves com: `npx web-push generate-vapid-keys`
- Adicionar as chaves ao `.env`

### 5. **ngrok** (Para webhooks em desenvolvimento local)
- Instalar ngrok: https://ngrok.com
- Executar: `ngrok http 5000`
- Usar a URL gerada para configurar o webhook do Mercado Pago

---

## 🚀 Passo a Passo de Reprodução

### Pré-requisitos
- Node.js 20+ instalado
- npm ou pnpm instalado
- Contas nos serviços externos (Neon, Mercado Pago, Cloudinary)

### 1. Clonar o Projeto
```bash
git clone <repository-url>
cd TEST
```

### 2. Instalar Dependências
```bash
# Opção 1: Usando npm
npm install
npm install --prefix backend
npm install --prefix frontend

# Opção 2: Usando o script do monorepo
npm run install-all

# Opção 3: Usando pnpm
pnpm install
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar o arquivo de exemplo
cp backend/.env.example backend/.env

# Editar backend/.env com suas credenciais reais:
# - DATABASE_URL (Neon PostgreSQL)
# - JWT_SECRET (gerar uma string aleatória)
# - MERCADO_PAGO_ACCESS_TOKEN
# - MERCADO_PAGO_PUBLIC_KEY
# - VAPID_PUBLIC_KEY
# - VAPID_PRIVATE_KEY
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET
```

### 4. Configurar Banco de Dados
```bash
# Entrar no diretório backend
cd backend

# Gerar migrations (se houver mudanças no schema)
npm run db:generate

# Aplicar migrations ao banco
npm run db:push

# (Opcional) Popular banco com dados iniciais
npm run db:seed

# (Opcional) Abrir Drizzle Studio para visualizar o banco
npm run db:studio
```

### 5. Executar em Desenvolvimento
```bash
# Voltar para a raiz do projeto
cd ..

# Opção 1: Executar frontend e backend simultaneamente
npm run dev

# Opção 2: Executar separadamente
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 6. Acessar a Aplicação
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/

### 7. Criar Usuário Admin
```bash
# Registrar um novo usuário na aplicação
# Depois, acessar o banco de dados (via Drizzle Studio ou SQL direto)
# e alterar o role do usuário para 'admin'

UPDATE users SET role = 'admin' WHERE email = 'seu_email@admin.com';
```

---

## 📦 Scripts Disponíveis

### Root (Monorepo)
```json
{
  "install-all": "Instala dependências de root, backend e frontend",
  "dev:backend": "Executa backend em modo desenvolvimento",
  "dev:frontend": "Executa frontend em modo desenvolvimento",
  "dev": "Executa backend e frontend simultaneamente",
  "build": "Build de backend e frontend"
}
```

### Backend
```json
{
  "dev": "Executa backend com tsx watch",
  "build": "Compila TypeScript para JavaScript",
  "start": "Executa o backend compilado",
  "db:generate": "Gera migrations do Drizzle",
  "db:push": "Aplica migrations ao banco",
  "db:seed": "Popula banco com dados iniciais",
  "db:studio": "Abre interface visual do banco"
}
```

### Frontend
```json
{
  "dev": "Executa Vite dev server",
  "build": "Compila TypeScript e build com Vite",
  "lint": "Executa ESLint",
  "preview": "Preview do build de produção"
}
```

---

## 🎨 Funcionalidades Principais

### Funcionalidades do Cliente
- ✅ Registro e login de usuários
- ✅ Navegação por catálogo de produtos
- ✅ Filtros por categoria (disposable, juice, pod_system, accessories)
- ✅ Carrinho de compras com animações
- ✅ Checkout com múltiplos métodos de pagamento
  - PIX
  - Pagamento na entrega (crédito)
  - Pagamento na entrega (débito)
- ✅ Aplicação de cupons de desconto
- ✅ Visualização de histórico de pedidos
- ✅ Edição de perfil (nome, email, telefone, endereço, foto)
- ✅ Verificação de idade (Age Gate)
- ✅ Notificações push (opcional)

### Funcionalidades do Admin
- ✅ Dashboard com estatísticas
  - Total de vendas
  - Total de pedidos
  - Produtos mais vendidos
  - Pedidos recentes
- ✅ Gestão de produtos
  - Criar, editar, deletar produtos
  - Upload de imagens
  - Controle de estoque
  - Ativar/desativar produtos
- ✅ Gestão de pedidos
  - Visualizar todos os pedidos
  - Atualizar status de entrega
  - Visualizar detalhes do pedido
- ✅ Gestão de promoções
  - Criar cupons de desconto
  - Tipos: percentual, valor fixo, compre X leve Y
  - Definir validade e limites de uso
- ✅ Gestão de clientes
  - Listar todos os clientes
  - Visualizar detalhes do cliente
- ✅ Relatórios
  - Relatórios de vendas
  - Estatísticas detalhadas

### Funcionalidades Técnicas
- ✅ Autenticação JWT com cookies httpOnly
- ✅ Middleware de autorização (admin/client)
- ✅ Upload de imagens para Cloudinary
- ✅ Integração com Mercado Pago
- ✅ Webhook para notificações de pagamento
- ✅ Sistema de notificações push (Web Push API)
- ✅ Cache de requisições com TanStack Query
- ✅ Roteamento tipado com TanStack Router
- ✅ Animações com Framer Motion
- ✅ Responsivo (mobile-first)
- ✅ Tratamento de erros global
- ✅ Validação de formulários

---

## 🔐 Segurança

### Autenticação
- Senhas hasheadas com bcryptjs
- Tokens JWT com assinatura HMAC-SHA256
- Cookies httpOnly e secure em produção
- Middleware de autenticação em rotas protegidas

### Autorização
- Roles: admin e client
- Verificação de permissões no middleware
- Rotas de admin protegidas

### CORS
- Configurado para permitir apenas origem do frontend
- Credentials habilitados para cookies

### Validação
- Validação de inputs nos controllers
- Validação de tipos com TypeScript
- Sanitização de dados

---

## 📱 Componentes Principais do Frontend

### Layout Components
- **Navbar** - Barra de navegação com logo, busca, carrinho
- **Footer** - Rodapé com links e informações
- **AdminLayout** - Layout para páginas admin
- **ClientLayout** - Layout para páginas do cliente
- **AdminSidebar** - Sidebar de navegação admin
- **ClientSidebar** - Sidebar de navegação cliente

### Functional Components
- **CartDrawer** - Carrinho lateral com animações
- **AgeGate** - Verificação de idade obrigatória
- **PushNotificationsSetup** - Configuração de notificações push

### Pages
- **Home** - Página inicial com banner e produtos em destaque
- **Catalog** - Catálogo com filtros e busca
- **ProductDetails** - Detalhes do produto com add to cart
- **CartPage** - Página completa do carrinho
- **Login/Register** - Formulários de autenticação
- **Account** - Painel do usuário com pedidos e perfil
- **AdminDashboard** - Dashboard administrativo
- **AdminProducts** - CRUD de produtos
- **AdminOrders** - Gestão de pedidos
- **AdminPromotions** - Gestão de promoções
- **AdminClients** - Lista de clientes
- **AdminReports** - Relatórios e estatísticas

---

## 🎯 Hooks Personalizados

### useAuth
- Gerencia estado de autenticação
- Fornece funções de login, logout, register
- Verifica se usuário está autenticado
- Fornece dados do usuário atual

### useCart
- Gerencia estado do carrinho
- Adicionar/remover itens
- Atualizar quantidades
- Calcular total
- Persistência em localStorage

### useCartAnimation
- Animações ao adicionar itens ao carrinho
- Feedback visual

### usePushNotifications
- Solicita permissão para notificações
- Gerencia assinatura push
- Envia notificações

---

## 🔄 Fluxo de Pagamento (Mercado Pago)

### 1. Criação de Preferência
```
Cliente → Frontend → Backend → Mercado Pago API
```
- Backend cria preferência com itens do carrinho
- Mercado Pago retorna URL de pagamento e ID

### 2. Redirecionamento
```
Frontend redireciona para URL do Mercado Pago
```
- Cliente é redirecionado para página de pagamento
- Cliente realiza pagamento (PIX, cartão, etc)

### 3. Webhook
```
Mercado Pago → Backend Webhook → Atualização do Pedido
```
- Mercado Pago notifica backend sobre status do pagamento
- Backend atualiza status do pedido
- Backend deduz estoque (se pagamento aprovado)

### 4. Atualização Frontend
```
Frontend → Backend (polling) → Atualização UI
```
- Frontend verifica status do pagamento periodicamente
- Atualiza UI quando pagamento é confirmado

---

## 🖼️ Fluxo de Upload de Imagens

### Atual (URL)
```
Usuário insere URL → Salva no banco → Cloudinary não usado
```

### Planejado (Upload Real)
```
Usuário seleciona arquivo → Editor de crop 1:1 → Compressão → 
Upload para Cloudinary → URL salva no banco
```

**Dependências:**
- react-easy-crop (editor de crop)
- browser-image-compression (compressão)
- Cloudinary SDK (upload)

**Fluxo Detalhado:**
1. Usuário seleciona arquivo (jpg, jpeg, png, webp)
2. Validação (máx 5MB)
3. Abre editor com crop obrigatório 1:1
4. Preview da imagem cropada
5. Compressão (máx 1MB, 1200x1200px, WebP)
6. Upload para Cloudinary (folder: avatars ou products)
7. URL retornada salva no banco

---

## 📊 Status de Pedidos

### Status de Entrega
- `awaiting_courier` - Aguardando coleta
- `on_the_way` - A caminho
- `delivered` - Entregue
- `cancelled` - Cancelado

### Status de Pagamento
- `pending` - Pendente
- `paid` - Pago
- `cancelled` - Cancelado

### Métodos de Pagamento
- `pix` - PIX
- `on_delivery_credit` - Pagamento na entrega (crédito)
- `on_delivery_debit` - Pagamento na entrega (débito)

---

## 🧪 Testes e Debug

### Testar API
```bash
# Health check
curl http://localhost:5000/

# Testar registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'

# Testar login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  -c cookies.txt

# Testar rota protegida
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Visualizar Banco de Dados
```bash
cd backend
npm run db:studio
```

### Logs do Backend
- Logs de requisições são exibidos no console
- Formato: `[timestamp] METHOD URL`

---

## 🐛 Problemas Comuns e Soluções

### 1. Erro de Conexão com Banco de Dados
**Solução:** Verificar se `DATABASE_URL` está correta no `.env`

### 2. Erro de CORS
**Solução:** Verificar se `FRONTEND_URL` está correto no `.env`

### 3. Mercado Pago Webhook não funciona localmente
**Solução:** Usar ngrok para expor o backend:
```bash
ngrok http 5000
```
Atualizar `WEBHOOK_URL` no `.env` com a URL do ngrok

### 4. Upload de Imagens falha
**Solução:** Verificar credenciais do Cloudinary no `.env`

### 5. Portas já em uso
**Solução:** Mudar `PORT` no `.env` do backend ou porta no `vite.config.ts`

---

## 📝 Próximos Passos (Documentado no projeto)

O projeto tem um documento `proximos_passos.md` que detalha a implementação de upload de imagens com editor de crop 1:1, substituindo os campos de URL por upload real de arquivos.

**Principais pontos:**
- Criar componente `ImageCropUpload.tsx` reutilizável
- Implementar editor de crop obrigatório 1:1
- Comprimir imagens antes do upload
- Corrigir controllers para não fazer reupload desnecessário
- Integrar com formulários de perfil e produtos

---

## 🚀 Deploy para Produção

### Backend
1. Build do TypeScript: `npm run build`
2. Executar: `node dist/index.js`
3. Usar PM2 para gerenciamento de processo
4. Configurar variáveis de ambiente de produção
5. Usar banco de dados PostgreSQL de produção
6. Configurar webhook URL de produção no Mercado Pago

### Frontend
1. Build: `npm run build`
2. Deploy do diretório `dist/` para Vercel, Netlify, ou similar
3. Atualizar `FRONTEND_URL` no backend
4. Configurar domínio personalizado

### Banco de Dados
- Usar Neon PostgreSQL ou outro serviço gerenciado
- Configurar backups automáticos
- Monitorar uso de recursos

---

## 📚 Recursos e Documentação

### Tecnologias
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack Query](https://tanstack.com/query/latest)
- [Express](https://expressjs.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [PostgreSQL](https://www.postgresql.org)
- [Mercado Pago](https://www.mercadopago.com.br/developers)
- [Cloudinary](https://cloudinary.com)
- [Web Push](https://web-push-libs.org)

### Ferramentas
- [Neon](https://neon.tech) - PostgreSQL Cloud
- [ngrok](https://ngrok.com) - Túneis locais
- [PM2](https://pm2.keymetrics.io) - Process Manager

---

## 👥 Equipe e Contato

- **Projeto:** CyberVapes / Loja Vapes Fullstack
- **Email de Contato:** soaresjonatas398@gmail.com (configurado para VAPID)

---

## 📄 Licença

Este projeto é privado e propriedade do desenvolvedor.

---

**Última Atualização:** Junho 2026  
**Versão:** 1.0.0
