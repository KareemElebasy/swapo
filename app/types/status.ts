export type AppStatus =
  | 'pending'
  | 'awaitingPayment'
  | 'confirmed'
  | 'shipped'
  | 'completed'
  | 'canceled'

export type StatusTone = AppStatus

export interface StatusMeta {
  labelKey: string
  tone: StatusTone
  bgClass: string
  textClass: string
}
