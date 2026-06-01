-- Execute com: npm run db:push (ou aplique manualmente no Neon)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method varchar(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_deducted boolean NOT NULL DEFAULT false;

-- Normaliza pedidos antigos (status misturava pagamento e entrega)
UPDATE orders SET status = 'awaiting_courier' WHERE status IN ('pending', 'paid');
UPDATE orders SET status = 'on_the_way' WHERE status = 'shipped';
UPDATE orders SET payment_status = 'paid' WHERE payment_status IN ('approved', 'paid') OR status = 'paid';
UPDATE orders SET payment_status = 'pending' WHERE payment_status IS NULL OR payment_status IN ('pix_pending', 'on_delivery_credit', 'on_delivery_debit', 'in_process', 'pending');
UPDATE orders SET payment_status = 'cancelled' WHERE payment_status IN ('rejected', 'cancelled');

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
