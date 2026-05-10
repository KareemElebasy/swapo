export type AppDirection = 'rtl' | 'ltr'

export interface LocaleLike {
  code?: string
  language?: string
  dir?: string
}

export type LocaleInput = string | LocaleLike

const rtlLocales = new Set(['ar'])

export function getLocaleCode(locale: LocaleInput = 'ar'): string {
  if (typeof locale === 'string') {
    return locale || 'ar'
  }

  return locale.code || locale.language || 'ar'
}

export function getDirection(locale: LocaleInput = 'ar'): AppDirection {
  if (typeof locale !== 'string' && (locale.dir === 'rtl' || locale.dir === 'ltr')) {
    return locale.dir
  }

  const code = getLocaleCode(locale).toLowerCase().split('-')[0]

  return rtlLocales.has(code) ? 'rtl' : 'ltr'
}

export function isRtlLocale(locale: LocaleInput = 'ar'): boolean {
  return getDirection(locale) === 'rtl'
}

export function getLanguage(locale: LocaleInput = 'ar'): string {
  if (typeof locale !== 'string' && locale.language) {
    return locale.language
  }

  const code = getLocaleCode(locale).toLowerCase()

  if (code.startsWith('ar')) {
    return 'ar-SA'
  }

  if (code.startsWith('en')) {
    return 'en-US'
  }

  return code
}
