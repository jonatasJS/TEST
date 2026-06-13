# CyberVapes - Next.js Migration

Este projeto é uma migração completa do backend (Express) e frontend (React) para Next.js com App Router, Drizzle ORM e TypeScript.

## Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **Drizzle ORM** - ORM para PostgreSQL
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **JWT** - Autenticação
- **Mercado Pago** - Integração de pagamentos
- **Cloudinary** - Armazenamento de imagens

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cybervapes

# JWT
JWT_SECRET=your-secret-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=your-mercado-pago-token
WEBHOOK_URL=https://your-domain.com/api/checkout/webhook
FRONTEND_URL=http://localhost:3000

# Web Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=your-email@example.com

# API URL (opcional, padrão: http://localhost:3000/api)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Configurar Banco de Dados

Execute as migrations do Drizzle:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Executar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura do Projeto

```
src/
├── app/                    # App Router (páginas)
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticação
│   │   ├── products/      # Produtos
│   │   ├── categories/    # Categorias
│   │   ├── orders/        # Pedidos
│   │   ├── checkout/      # Checkout
│   │   ├── promotions/   # Promoções
│   │   ├── admin/         # Admin
│   │   ├── clients/       # Clientes
│   │   └── notifications/ # Notificações
│   ├── catalog/           # Página de catálogo
│   ├── product/[id]/      # Página de produto
│   ├── cart/              # Página de carrinho
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── account/           # Página de conta
│   ├── admin/             # Páginas admin
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   └── Navbar.tsx         # Barra de navegação
├── hooks/                 # Custom hooks
│   ├── useAuth.ts         # Hook de autenticação
│   └── useCart.ts         # Hook de carrinho
├── lib/                   # Utilitários
│   ├── db/                # Configuração Drizzle
│   │   ├── schema.ts      # Schema do banco
│   │   └── index.ts       # Conexão
│   ├── auth.ts            # Funções de autenticação
│   ├── cloudinary.ts      # Configuração Cloudinary
│   ├── orderStatus.ts     # Status de pedidos
│   └── notificationService.ts # Notificações
└── middleware.ts          # Middleware Next.js
```

## API Routes

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Obter usuário atual
- `PUT /api/auth/update-profile` - Atualizar perfil

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto (admin)
- `GET /api/products/[id]` - Obter produto
- `PUT /api/products/[id]` - Atualizar produto (admin)
- `DELETE /api/products/[id]` - Deletar produto (admin)
- `GET /api/products/hero` - Produtos hero

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria (admin)
- `GET /api/categories/[id]` - Obter categoria
- `PUT /api/categories/[id]` - Atualizar categoria (admin)
- `DELETE /api/categories/[id]` - Deletar categoria (admin)
- `GET /api/categories/slug/[slug]` - Categoria por slug
- `GET /api/categories/sales` - Categorias por vendas

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/[id]` - Atualizar status (admin)

### Checkout
- `POST /api/checkout/preference` - Criar preferência Mercado Pago
- `POST /api/checkout/pix` - Criar pagamento PIX
- `POST /api/checkout/webhook` - Webhook Mercado Pago
- `GET /api/checkout/status/[orderId]` - Status do pagamento
- `POST /api/checkout/mock-approve/[orderId]` - Aprovação mock (teste)

### Promoções
- `GET /api/promotions` - Listar promoções
- `POST /api/promotions` - Criar promoção (admin)
- `PUT /api/promotions/[id]` - Atualizar promoção (admin)
- `DELETE /api/promotions/[id]` - Deletar promoção (admin)
- `POST /api/promotions/[id]/increment` - Incrementar uso (admin)

### Admin
- `GET /api/admin/dashboard` - Estatísticas do dashboard
- `GET /api/admin/reports` - Relatórios
- `GET /api/admin/export/orders` - Exportar pedidos CSV

### Clientes
- `GET /api/clients` - Listar clientes (admin)
- `GET /api/clients/[id]` - Detalhes do cliente (admin)
- `PUT /api/clients/[id]` - Atualizar cliente (admin)
- `DELETE /api/clients/[id]` - Deletar cliente (admin)

### Notificações
- `GET /api/notifications/vapid` - Chave VAPID pública
- `POST /api/notifications/subscribe` - Inscrever para notificações
- `POST /api/notifications/unsubscribe` - Desinscrever

## Scripts Disponíveis

```bash
npm run dev          # Executar servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Executar servidor de produção
npm run db:generate # Gerar migrations Drizzle
npm run db:migrate   # Executar migrations Drizzle
npm run db:studio    # Abrir Drizzle Studio
```

## Deploy

Para fazer deploy da aplicação, você pode usar:

- [Vercel](https://vercel.com) - Recomendado para Next.js
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Netlify](https://netlify.com)

Certifique-se de configurar todas as variáveis de ambiente no ambiente de produção.
