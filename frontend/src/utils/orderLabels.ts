export type DeliveryStatus = 'awaiting_courier' | 'on_the_way' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export function normalizeDeliveryStatus(status: string): DeliveryStatus {
  switch (status) {
    case 'awaiting_courier':
    case 'on_the_way':
    case 'delivered':
    case 'cancelled':
      return status;
    case 'pending':
    case 'paid':
      return 'awaiting_courier';
    case 'shipped':
      return 'on_the_way';
    default:
      return 'awaiting_courier';
  }
}

export function normalizePaymentStatus(
  paymentStatus?: string | null,
  legacyOrderStatus?: string,
): PaymentStatus {
  if (!paymentStatus && legacyOrderStatus === 'paid') return 'paid';
  if (!paymentStatus) return 'pending';
  const raw = paymentStatus.toLowerCase();
  if (raw === 'paid' || raw === 'approved') return 'paid';
  if (raw === 'cancelled' || raw === 'rejected') return 'cancelled';
  return 'pending';
}

export const deliveryStatusLabel: Record<DeliveryStatus, string> = {
  awaiting_courier: 'Aguardando entregador',
  on_the_way: 'A caminho',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: 'Pagamento pendente',
  paid: 'Pago',
  cancelled: 'Pagamento cancelado',
};
