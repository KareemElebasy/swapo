<script setup lang="ts">
type EmptyStateVariant = 'inline' | 'section' | 'fullPage' | 'modal'
type EmptyStateTone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand'

interface Props {
  title: string
  message?: string
  variant?: EmptyStateVariant
  tone?: EmptyStateTone
  actionLabel?: string
  actionTo?: string
  secondaryActionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: undefined,
  variant: 'section',
  tone: 'neutral',
  actionLabel: undefined,
  actionTo: undefined,
  secondaryActionLabel: undefined,
})

const emit = defineEmits<{
  action: []
  secondaryAction: []
}>()

const localePath = useLocalePath()

const wrapperClasses = computed(() => [
  'flex flex-col items-center justify-center text-center',
  props.variant === 'inline' ? 'gap-3 py-6' : '',
  props.variant === 'section' ? 'min-h-[280px] gap-4 rounded-md bg-grey-light-active p-8' : '',
  props.variant === 'fullPage' ? 'min-h-[60vh] gap-5 px-4 py-12' : '',
  props.variant === 'modal' ? 'gap-4 p-2' : '',
])

const iconClasses: Record<EmptyStateTone, string> = {
  neutral: 'bg-grey-normal text-grey-darker',
  success: 'bg-status-completed-bg text-status-completed-text',
  warning: 'bg-status-pending-bg text-status-pending-text',
  danger: 'bg-status-canceled-bg text-status-canceled-text',
  brand: 'bg-brand-cyan-light text-blue-normal',
}
</script>

<template>
  <div :class="wrapperClasses">
    <slot name="icon">
      <div :class="['flex size-14 items-center justify-center rounded-full', iconClasses[tone]]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M7 8.5h14v11H7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          <path d="m9.5 17 3.2-3.2 2.3 2.3 1.5-1.5L19 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="18" cy="11.5" r="1.2" fill="currentColor" />
        </svg>
      </div>
    </slot>

    <div class="flex max-w-md flex-col gap-2">
      <h2 class="text-xl font-medium leading-7 text-black-normal">
        {{ title }}
      </h2>
      <p v-if="message" class="text-sm leading-6 text-grey-darker">
        {{ message }}
      </p>
    </div>

    <div v-if="$slots.actions || actionLabel || secondaryActionLabel" class="flex flex-wrap items-center justify-center gap-3 pt-1">
      <slot name="actions">
        <BaseButton
          v-if="secondaryActionLabel"
          variant="secondary"
          @click="emit('secondaryAction')"
        >
          {{ secondaryActionLabel }}
        </BaseButton>
        <BaseButton
          v-if="actionLabel"
          :to="actionTo ? localePath(actionTo) : undefined"
          @click="emit('action')"
        >
          {{ actionLabel }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>
