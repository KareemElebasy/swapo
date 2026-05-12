<script setup lang="ts">
type ConfirmIntent = 'danger' | 'warning' | 'info'

interface Props {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  intent?: ConfirmIntent
  loading?: boolean
  closeOnConfirm?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: undefined,
  confirmLabel: undefined,
  cancelLabel: undefined,
  intent: 'danger',
  loading: false,
  closeOnConfirm: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const { t } = useI18n()

const iconClasses: Record<ConfirmIntent, string> = {
  danger: 'bg-status-canceled-bg text-status-canceled-text',
  warning: 'bg-status-pending-bg text-status-pending-text',
  info: 'bg-blue-light text-blue-normal',
}

const confirmVariant = computed(() => props.intent === 'danger' ? 'danger' : 'primary')

function cancel() {
  emit('cancel')
  emit('update:open', false)
}

function confirm() {
  emit('confirm')
  if (props.closeOnConfirm) {
    emit('update:open', false)
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    size="md"
    :title="title"
    :description="message"
    :close-label="t('common.close')"
    panel-class="max-w-[474px]"
    @update:open="emit('update:open', $event)"
  >
    <template #icon>
      <slot name="icon">
        <div :class="['flex size-14 items-center justify-center rounded-full', iconClasses[intent]]">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M14 8v7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path d="M14 19.5h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
            <path d="M12.4 4.9 3.8 20a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L15.6 4.9a1.8 1.8 0 0 0-3.2 0Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </div>
      </slot>
    </template>

    <slot />

    <template #footer>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BaseButton variant="secondary" size="lg" full-width :disabled="loading" @click="cancel">
          {{ cancelLabel ?? t('common.cancel') }}
        </BaseButton>
        <BaseButton
          :variant="confirmVariant"
          size="lg"
          full-width
          :loading="loading"
          @click="confirm"
        >
          {{ confirmLabel ?? t('common.confirm') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
