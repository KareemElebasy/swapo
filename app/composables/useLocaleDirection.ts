import { computed } from 'vue'
import { getDirection, getLanguage, type LocaleInput } from '~/utils/direction'

type LocaleEntry = LocaleInput

export function useLocaleDirection() {
  const { locale, locales } = useI18n()

  const code = computed(() => String(locale.value || 'ar'))

  const localeConfig = computed<LocaleEntry>(() => {
    const availableLocales = Array.isArray(locales.value) ? locales.value : []

    return availableLocales.find((entry) => {
      if (typeof entry === 'string') {
        return entry === code.value
      }

      return entry.code === code.value
    }) || code.value
  })

  const dir = computed(() => getDirection(localeConfig.value))
  const language = computed(() => getLanguage(localeConfig.value))
  const currentLanguageCode = computed(() => language.value.split('-')[0] || code.value)
  const isRtl = computed(() => dir.value === 'rtl')
  const isLtr = computed(() => dir.value === 'ltr')

  return {
    locale,
    code,
    language,
    currentLanguageCode,
    dir,
    isRtl,
    isLtr,
  }
}
