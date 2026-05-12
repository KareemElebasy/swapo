<script setup lang="ts">
interface Props {
  open: boolean
  side?: 'bottom' | 'start' | 'end'
  title?: string
  closable?: boolean
  closeOnBackdrop?: boolean
  closeLabel?: string
  bodyClass?: string
  footerClass?: string
  panelClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  side: 'bottom',
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
}

watch(
  () => props.open,
  (val) => {
    if (!import.meta.client) return

    if (val) {
      document.body.style.overflow = 'hidden'
      nextTick(() => {
        panelRef.value?.focus()
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

const panelClasses = computed(() => {
  if (props.side === 'bottom') {
    return 'absolute bottom-0 inset-x-0 bg-grey-light rounded-t-md max-h-[90dvh] flex flex-col'
  }
  if (props.side === 'start') {
    return 'absolute start-0 top-0 bottom-0 bg-grey-light rounded-e-md w-80 max-w-[85vw] flex flex-col'
  }
  return 'absolute end-0 top-0 bottom-0 bg-grey-light rounded-s-md w-80 max-w-[85vw] flex flex-col'
})

const enterFromClass = computed(() => {
  if (props.side === 'bottom') return 'translate-y-full'
  if (props.side === 'start') return 'rtl:translate-x-full ltr:-translate-x-full'
  return 'rtl:-translate-x-full ltr:translate-x-full'
})

const leaveToClass = computed(() => enterFromClass.value)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50"
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
          enter-active-class="transition duration-300 ease-out"
          :enter-from-class="enterFromClass"
          enter-to-class="translate-x-0 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-x-0 translate-y-0"
          :leave-to-class="leaveToClass"
          appear
        >
          <div
            v-if="open"
            ref="panelRef"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? 'drawer-title' : undefined"
            :class="[panelClasses, panelClass]"
            tabindex="-1"
          >
            <!-- Handle (bottom drawer only) -->
            <div
              v-if="side === 'bottom'"
              class="flex justify-center pt-3 pb-1 shrink-0"
              aria-hidden="true"
            >
              <div class="w-10 h-1 rounded-xl bg-grey-normal-hover" />
            </div>

            <!-- Header -->
            <div
              v-if="slots.header || title"
              class="flex items-center justify-between gap-4 px-5 py-4 border-b border-grey-normal shrink-0"
            >
              <slot name="header">
                <h2 v-if="title" id="drawer-title" class="text-base font-medium text-black-normal">
                  {{ title }}
                </h2>
              </slot>

              <button
                v-if="closable"
                type="button"
                class="shrink-0 flex items-center justify-center size-8 rounded-sm text-grey-dark-active hover:bg-grey-normal hover:text-black-normal transition-colors"
                :aria-label="closeLabel"
                @click="close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div :class="['flex-1 overflow-y-auto px-5 py-4', bodyClass]">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="slots.footer" :class="['px-5 py-4 border-t border-grey-normal shrink-0', footerClass]">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
