import { pgTable, serial, text, varchar, timestamp, integer, boolean, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tabela de Usuários
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).default('client').notNull(), // 'admin' ou 'client'
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  profileImage: text('profile_image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Produtos (Pods, Juices, Mods, etc.)
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
  stock: integer('stock').notNull(),
  imageUrl: text('image_url').notNull(),
  category: varchar('category', { length: 100 }).notNull(), // e.g., 'disposable', 'juice', 'pod_system', 'accessories'
  puffs: integer('puffs'), // Opcional (apenas para pod descartável)
  nicotine: varchar('nicotine', { length: 50 }), // Opcional (ex: "5%", "50mg")
  flavor: varchar('flavor', { length: 150 }), // Opcional (ex: "Watermelon Ice", "Blue Razz")
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Pedidos
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  /** Entrega: awaiting_courier | on_the_way | delivered | cancelled */
  status: varchar('status', { length: 50 }).default('awaiting_courier').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  paymentId: varchar('payment_id', { length: 255 }),
  /** Pagamento: pending | paid | cancelled */
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending').notNull(),
  /** pix | on_delivery_credit | on_delivery_debit */
  paymentMethod: varchar('payment_method', { length: 50 }),
  stockDeducted: boolean('stock_deducted').default(false).notNull(),
  shippingAddress: text('shipping_address').notNull(),
  contactPhone: varchar('contact_phone', { length: 50 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de Itens do Pedido
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  priceAtPurchase: doublePrecision('price_at_purchase').notNull(),
});

// Relações entre Tabelas (Drizzle Relations)
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  pushSubscriptions: many(pushSubscriptions),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// Tabela de Promoções
export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'percentage', 'fixed_amount', 'buy_x_get_y'
  value: doublePrecision('value').notNull(), // Valor do desconto (ex: 10 para 10% ou 10.00 para R$10)
  minPurchaseAmount: doublePrecision('min_purchase_amount').default(0), // Valor mínimo de compra
  maxDiscountAmount: doublePrecision('max_discount_amount'), // Valor máximo de desconto
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  usageLimit: integer('usage_limit'), // Limite de usos (null = ilimitado)
  currentUsage: integer('current_usage').default(0).notNull(),
  applicableCategories: text('applicable_categories'), // JSON array de categorias aplicáveis
  applicableProducts: text('applicable_products'), // JSON array de IDs de produtos aplicáveis
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
