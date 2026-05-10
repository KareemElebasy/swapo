<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  to?: string
  iconPosition?: 'start' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
  iconPosition: 'start',
})

const slots = useSlots()
const tag = computed(() => props.to ? resolveComponent('NuxtLink') : 'button')

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

const variantClasses: Record<string, string> = {
  primary: 'bg-blue-normal text-green-normal hover:bg-blue-normal-hover active:bg-blue-normal-active',
  secondary: 'border border-blue-light-active text-blue-normal bg-transparent hover:bg-blue-light active:bg-blue-light-active',
  ghost: 'text-blue-normal bg-transparent hover:bg-blue-light active:bg-blue-light-active',
  danger: 'bg-status-canceled-bg text-status-canceled-text border border-status-canceled-text hover:opacity-90',
  link: 'text-blue-normal bg-transparent underline underline-offset-2 h-auto px-0',
}

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center font-medium rounded-sm transition-colors duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  sizeClasses[props.size ?? 'md'],
  variantClasses[props.variant ?? 'primary'],
  props.fullWidth ? 'w-full' : '',
  props.loading ? 'opacity-75 cursor-wait pointer-events-none' : '',
])

const isDisabled = computed(() => !props.to && (props.disabled || props.loading))
</script>

<template>
  <component
    :is="tag"
    v-bind="to ? { to } : { type }"
    :class="buttonClasses"
    :disabled="isDisabled || undefined"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="shrink-0 animate-spin" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="28" stroke-dashoffset="10" />
      </svg>
    </span>

    <span v-if="!loading && slots.icon && iconPosition === 'start'" class="shrink-0" aria-hidden="true">
      <slot name="icon" />
    </span>

    <slot />

    <span v-if="!loading && slots.icon && iconPosition === 'end'" class="shrink-0" aria-hidden="true">
      <slot name="icon" />
    </span>
  </component>
</template>
