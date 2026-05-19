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
  active: {
    labelKey: 'status.active',
    tone: 'brand',
    bgClass: 'bg-brand-cyan-light',
    textClass: 'text-blue-normal',
  },
  agreed: {
    labelKey: 'status.agreed',
    tone: 'completed',
    bgClass: 'bg-status-completed-bg',
    textClass: 'text-status-completed-text',
  },
  ended: {
    labelKey: 'status.ended',
    tone: 'shipped',
    bgClass: 'bg-status-shipped-bg',
    textClass: 'text-status-shipped-text',
  },
  draft: {
    labelKey: 'status.draft',
    tone: 'neutral',
    bgClass: 'bg-grey-normal',
    textClass: 'text-grey-darker',
  },
  published: {
    labelKey: 'status.published',
    tone: 'confirmed',
    bgClass: 'bg-status-confirmed-bg',
    textClass: 'text-status-confirmed-text',
  },
  boosted: {
    labelKey: 'status.boosted',
    tone: 'blue',
    bgClass: 'bg-blue-light',
    textClass: 'text-blue-normal',
  },
  sold: {
    labelKey: 'status.sold',
    tone: 'completed',
    bgClass: 'bg-status-completed-bg',
    textClass: 'text-status-completed-text',
  },
  paused: {
    labelKey: 'status.paused',
    tone: 'warning',
    bgClass: 'bg-status-pending-bg',
    textClass: 'text-status-pending-text',
  },
  rejected: {
    labelKey: 'status.rejected',
    tone: 'canceled',
    bgClass: 'bg-status-canceled-bg',
    textClass: 'text-status-canceled-text',
  },
  paid: {
    labelKey: 'status.paid',
    tone: 'completed',
    bgClass: 'bg-status-completed-bg',
    textClass: 'text-status-completed-text',
  },
  refunded: {
    labelKey: 'status.refunded',
    tone: 'awaitingPayment',
    bgClass: 'bg-status-awaiting-payment-bg',
    textClass: 'text-status-awaiting-payment-text',
  },
  failed: {
    labelKey: 'status.failed',
    tone: 'canceled',
    bgClass: 'bg-status-canceled-bg',
    textClass: 'text-status-canceled-text',
  },
} satisfies Record<AppStatus, StatusMeta>

export function getStatusMeta(status: AppStatus | string): StatusMeta {
  return statusMap[status as AppStatus] ?? {
    labelKey: 'status.default',
    tone: 'default',
    bgClass: 'bg-grey-normal',
    textClass: 'text-grey-darker',
  }
}

const apiOrderStatusMap: Record<string, AppStatus> = {
  pending_approval: 'pending',
  pending_payment: 'awaitingPayment',
  pending_shipment: 'confirmed',
  shipped: 'shipped',
  completed: 'completed',
  cancelled: 'canceled',
  rejected: 'rejected',
}

export function mapApiOrderStatus(apiStatus: string): AppStatus {
  return apiOrderStatusMap[apiStatus] ?? 'pending'
}

/** Returns a 0-based index of the current step in the order timeline (0–4), or -1 for terminal states */
export function orderTimelineStep(apiStatus: string): number {
  const steps: Record<string, number> = {
    pending_approval: 0,
    pending_payment: 1,
    pending_shipment: 2,
    shipped: 3,
    completed: 4,
  }
  return steps[apiStatus] ?? -1
}
