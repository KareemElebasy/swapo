<script setup lang="ts">
import type { CurrencyCode } from '~/types/money'

interface Props {
  amount: number
  currency?: CurrencyCode
  locale?: string
  compact?: boolean
  showSymbol?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  as?: string
  size?: 'sm' | 'md' | 'lg'
  weight?: 'normal' | 'medium' | 'bold'
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'SAR',
  compact: false,
  showSymbol: true,
  as: 'span',
  size: 'md',
  weight: 'medium',
})

const { locale: i18nLocale } = useI18n()

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value)

const formatted = computed(() => {
  const options: Intl.NumberFormatOptions = props.showSymbol
    ? {
        style: 'currency',
        currency: props.currency,
        notation: props.compact ? 'compact' : 'standard',
        minimumFractionDigits: props.minimumFractionDigits,
        maximumFractionDigits: props.maximumFractionDigits,
      }
    : {
        style: 'decimal',
        notation: props.compact ? 'compact' : 'standard',
        minimumFractionDigits: props.minimumFractionDigits,
        maximumFractionDigits: props.maximumFractionDigits,
      }

  return new Intl.NumberFormat(normalizeIntlLocale(resolvedLocale.value), options).format(props.amount)
})

const isNegative = computed(() => props.amount < 0)

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
}

const weightClasses: Record<NonNullable<Props['weight']>, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  bold: 'font-bold',
}
</script>

<template>
  <component
    :is="as"
    :class="[
      'inline-flex items-center gap-0.5 tabular-nums',
      sizeClasses[size],
      weightClasses[weight],
      isNegative ? 'text-status-canceled-text' : '',
    ]"
    :dir="resolvedLocale.startsWith('ar') ? 'rtl' : 'ltr'"
  >
    <slot name="prefix" />
    <span>{{ formatted }}</span>
    <slot name="suffix" />
  </component>
</template>
