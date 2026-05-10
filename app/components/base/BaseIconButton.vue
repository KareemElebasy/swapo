<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'primary'
  ariaLabel: string
  disabled?: boolean
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  disabled: false,
})

const tag = computed(() => props.to ? resolveComponent('NuxtLink') : 'button')

const sizeClasses: Record<string, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
}

const variantClasses: Record<string, string> = {
  default: 'text-blue-normal hover:bg-blue-light active:bg-blue-light-active',
  ghost: 'text-grey-dark-active hover:bg-grey-normal active:bg-grey-normal-hover',
  primary: 'bg-blue-normal text-green-normal hover:bg-blue-normal-hover active:bg-blue-normal-active',
}

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center shrink-0 rounded-sm transition-colors duration-150 cursor-pointer',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal',
  sizeClasses[props.size ?? 'md'],
  variantClasses[props.variant ?? 'default'],
])
</script>

<template>
  <component
    :is="tag"
    v-bind="to ? { to } : { type: 'button' }"
    :class="buttonClasses"
    :disabled="!to && disabled || undefined"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
  >
    <slot name="icon" />
  </component>
</template>
