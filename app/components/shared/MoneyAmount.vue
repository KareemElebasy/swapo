<script setup lang="ts">
import type { CurrencyCode } from '~/types/money'

interface Props {
  amount: number
  currency?: CurrencyCode
  locale?: string
  compact?: boolean
  showSymbol?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'SAR',
  compact: false,
  showSymbol: true,
})

const { locale: i18nLocale } = useI18n()

const resolvedLocale = computed(() => props.locale ?? i18nLocale.value)

const formatted = computed(() =>
  formatMoney(props.amount, {
    locale: resolvedLocale.value,
    currency: props.currency,
    compact: props.compact,
  }),
)

const isNegative = computed(() => props.amount < 0)
const isFree = computed(() => props.amount === 0)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-0.5 tabular-nums font-medium',
      isNegative ? 'text-status-canceled-text' : '',
    ]"
    :dir="resolvedLocale.startsWith('ar') ? 'rtl' : 'ltr'"
  >
    <slot name="symbol" />
    <span>{{ formatted }}</span>
  </span>
</template>
