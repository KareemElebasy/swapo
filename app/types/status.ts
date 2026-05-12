export type AppStatus =
  | 'pending'
  | 'awaitingPayment'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'canceled'
  | 'active'
  | 'agreed'
  | 'ended'
  | 'draft'
  | 'published'
  | 'boosted'
  | 'sold'
  | 'paused'
  | 'rejected'
  | 'paid'
  | 'refunded'
  | 'failed'

export type StatusTone =
  | 'default'
  | 'blue'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'brand'
  | 'pending'
  | 'awaitingPayment'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'canceled'

export interface StatusMeta {
  labelKey: string
  tone: StatusTone
  bgClass: string
  textClass: string
}
