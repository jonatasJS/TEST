import { Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { pushSubscriptions } from '../db/schema';
import { AuthRequest } from '../middleware/auth';
import { getVapidPublicKey } from '../services/notificationService';

export const getVapidPublicKeyHandler = (_req: AuthRequest, res: Response) => {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return res.status(503).json({ message: 'Notificações push não configuradas no servidor.' });
  }
  return res.status(200).json({ publicKey });
};

export const subscribePush = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: 'Dados de inscrição push inválidos.' });
  }

  try {
    const existing = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.endpoint, endpoint),
    });

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({
          userId: req.user.id,
          p256dh: keys.p256dh,
          auth: keys.auth,
        })
        .where(eq(pushSubscriptions.endpoint, endpoint));
    } else {
      await db.insert(pushSubscriptions).values({
        userId: req.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
    }

    return res.status(200).json({ message: 'Inscrição push registrada.' });
  } catch (error: unknown) {
    console.error('Erro ao registrar push:', error);
    return res.status(500).json({ message: 'Erro ao registrar notificações push.' });
  }
};

export const unsubscribePush = async (req: AuthRequest, res: Response) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ message: 'Endpoint obrigatório.' });
  }

  try {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return res.status(200).json({ message: 'Inscrição removida.' });
  } catch (error: unknown) {
    console.error('Erro ao remover push:', error);
    return res.status(500).json({ message: 'Erro ao remover inscrição.' });
  }
};
