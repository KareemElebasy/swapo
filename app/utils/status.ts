import type { AppStatus, StatusMeta } from '~/types/status'

export const statusMap = {
  pending: {
    labelKey: 'status.pending',
    tone: 'pending',
    bgClass: 'bg-status-pending-bg',
    textClass: 'text-status-pending-text',
  },
  awaitingPayment: {
    labelKey: 'status.awaitingPayment',
    tone: 'awaitingPayment',
    bgClass: 'bg-status-awaiting-payment-bg',
    textClass: 'text-status-awaiting-payment-text',
  },
  confirmed: {
    labelKey: 'status.confirmed',
    tone: 'confirmed',
    bgClass: 'bg-status-confirmed-bg',
    textClass: 'text-status-confirmed-text',
  },
  shipped: {
    labelKey: 'status.shipped',
    tone: 'shipped',
    bgClass: 'bg-status-shipped-bg',
    textClass: 'text-status-shipped-text',
  },
  completed: {
    labelKey: 'status.completed',
    tone: 'completed',
    bgClass: 'bg-status-completed-bg',
    textClass: 'text-status-completed-text',
  },
  canceled: {
    labelKey: 'status.canceled',
    tone: 'canceled',
    bgClass: 'bg-status-canceled-bg',
    textClass: 'text-status-canceled-text',
  },
} satisfies Record<AppStatus, StatusMeta>

export function getStatusMeta(status: AppStatus): StatusMeta {
  return statusMap[status]
}
