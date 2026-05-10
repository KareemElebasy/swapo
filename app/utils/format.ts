import type { CurrencyCode } from '~/types/money'

export type FormatLocale = 'ar' | 'en' | 'ar-SA' | 'en-US' | string
export type DateInput = Date | string | number

export interface FormatMoneyOptions {
  locale?: FormatLocale
  currency?: CurrencyCode
  compact?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: FormatLocale
}

export function normalizeIntlLocale(locale: FormatLocale = 'ar'): string {
  const code = locale.toLowerCase()

  if (code.startsWith('ar')) {
    return 'ar-SA'
  }

  if (code.startsWith('en')) {
    return 'en-US'
  }

  return locale
}

export function formatMoney(amount: number, options: FormatMoneyOptions = {}): string {
  const {
    locale = 'ar',
    currency = 'SAR',
    compact = false,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options

  return new Intl.NumberFormat(normalizeIntlLocale(locale), {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

export function formatDate(value: DateInput, options: FormatDateOptions = {}): string {
  const {
    locale = 'ar',
    ...dateOptions
  } = options

  return new Intl.DateTimeFormat(normalizeIntlLocale(locale), {
    dateStyle: 'medium',
    ...dateOptions,
  }).format(value instanceof Date ? value : new Date(value))
}
