<script setup lang="ts">
interface Props {
  open: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  closeOnBackdrop?: boolean
  closeLabel?: string
  bodyClass?: string
  footerClass?: string
  panelClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  closeLabel: 'Close',
  bodyClass: '',
  footerClass: '',
  panelClass: '',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const slots = useSlots()
const panelRef = ref<HTMLElement | null>(null)

function close() {
  emit('update:open', false)
  emit('close')
}

function onBackdropClick() {
  if (props.closeOnBackdrop) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closable) close()
  if (event.key === 'Tab') trapFocus(event)
}

function trapFocus(event: KeyboardEvent) {
  const panel = panelRef.value
  if (!panel) return
  const focusable = panel.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
}

watch(
  () => props.open,
  (val) => {
    if (!import.meta.client) return

    if (val) {
      document.body.style.overflow = 'hidden'
      nextTick(() => {
        const first = panelRef.value?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        first?.focus()
      })
    } else {
      document.body.style.overflow = ''
    }
  },
)

onUnmounted(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
})

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-[474px]',
  lg: 'max-w-xl',
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown="onKeydown"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40"
          aria-hidden="true"
          @click="onBackdropClick"
        />

        <!-- Panel -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
          appear
        >
          <div
            v-if="open"
            ref="panelRef"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'modal-title' : undefined"
            :aria-describedby="description ? 'modal-description' : undefined"
            :class="['relative w-full bg-grey-light rounded-md shadow-overlay flex flex-col', sizeClasses[size], panelClass]"
          >
            <!-- Icon slot (result/confirm modals) -->
            <div v-if="slots.icon" class="flex justify-center pt-6 px-6">
              <slot name="icon" />
            </div>

            <!-- Header -->
            <div v-if="slots.header || title" class="flex items-start justify-between gap-4 px-6 pt-6">
              <slot name="header">
                <div>
                  <h2 v-if="title" id="modal-title" class="text-lg font-medium text-black-normal">
                    {{ title }}
                  </h2>
                  <p v-if="description" id="modal-description" class="mt-1 text-sm text-grey-dark-active">
                    {{ description }}
                  </p>
                </div>
              </slot>

              <button
                v-if="closable"
                type="button"
                class="shrink-0 -mt-1 -me-1 flex items-center justify-center size-8 rounded-sm text-grey-dark-active hover:bg-grey-normal hover:text-black-normal transition-colors"
                :aria-label="closeLabel"
                @click="close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div :class="['flex-1 px-6 py-6', bodyClass]">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="slots.footer" :class="['px-6 pb-6', footerClass]">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
