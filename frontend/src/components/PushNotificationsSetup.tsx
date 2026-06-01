import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

/** Registra push quando o usuário está autenticado (cliente ou admin). */
export const PushNotificationsSetup: React.FC = () => {
  usePushNotifications();
  return null;
};
