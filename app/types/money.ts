export type CurrencyCode = 'SAR' | 'USD' | 'EUR'

export interface Money {
  amount: number
  currency: CurrencyCode
}
