import webpush from 'web-push';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { pushSubscriptions, users } from '../db/schema';
import { deliveryStatusLabel, DeliveryStatus } from '../utils/orderStatus';

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@cybervapes.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured || !VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidConfigured = true;
  return true;
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

async function sendToSubscriptions(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload,
) {
  if (!ensureVapid() || subscriptions.length === 0) return;

  const data = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || `${FRONTEND_URL}/account`,
  });

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        data,
      ),
    ),
  );
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC;
}

export async function notifyUser(userId: number, payload: PushPayload) {
  const subs = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  });
  await sendToSubscriptions(subs, payload);
}

export async function notifyAdmins(payload: PushPayload) {
  const adminUsers = await db.query.users.findMany({
    where: eq(users.role, 'admin'),
    columns: { id: true },
  });

  const allSubs: { endpoint: string; p256dh: string; auth: string }[] = [];
  for (const admin of adminUsers) {
    const subs = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, admin.id),
    });
    allSubs.push(...subs);
  }

  await sendToSubscriptions(allSubs, payload);
}

export async function notifyOrderDeliveryUpdate(
  userId: number | null,
  orderId: number,
  deliveryStatus: DeliveryStatus,
) {
  if (!userId) return;

  await notifyUser(userId, {
    title: `Pedido #${orderId} atualizado`,
    body: `Status da entrega: ${deliveryStatusLabel(deliveryStatus)}`,
    url: `${FRONTEND_URL}/account`,
  });
}

export async function notifyNewOrderForAdmins(orderId: number, customerName: string) {
  await notifyAdmins({
    title: 'Novo pedido recebido',
    body: `Pedido #${orderId} de ${customerName}. Separe os itens para envio.`,
    url: `${FRONTEND_URL}/admin/orders`,
  });
}
