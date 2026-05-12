<script setup lang="ts">
type BadgeTone =
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

interface Props {
  tone?: BadgeTone
  size?: 'sm' | 'md'
  dot?: boolean
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'default',
  size: 'md',
  dot: false,
  as: 'span',
})

const toneClasses: Record<BadgeTone, string> = {
  default: 'bg-grey-normal text-grey-darker',
  blue: 'bg-blue-light text-blue-normal',
  neutral: 'bg-grey-normal text-grey-darker',
  success: 'bg-status-completed-bg text-status-completed-text',
  warning: 'bg-status-pending-bg text-status-pending-text',
  danger: 'bg-status-canceled-bg text-status-canceled-text',
  info: 'bg-blue-light text-blue-normal',
  brand: 'bg-brand-cyan-light text-blue-normal',
  pending: 'bg-status-pending-bg text-status-pending-text',
  awaitingPayment: 'bg-status-awaiting-payment-bg text-status-awaiting-payment-text',
  confirmed: 'bg-status-confirmed-bg text-status-confirmed-text',
  shipped: 'bg-status-shipped-bg text-status-shipped-text',
  completed: 'bg-status-completed-bg text-status-completed-text',
  canceled: 'bg-status-canceled-bg text-status-canceled-text',
}

const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
}

const badgeClasses = computed(() => [
  'inline-flex items-center font-medium rounded-xs whitespace-nowrap',
  toneClasses[props.tone],
  sizeClasses[props.size],
])

const dotSizeClass = computed(() => (props.size === 'sm' ? 'size-1.5' : 'size-2'))
</script>

<template>
  <component :is="as" :class="badgeClasses">
    <span
      v-if="dot"
      :class="['rounded-full shrink-0 bg-current opacity-80', dotSizeClass]"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>
