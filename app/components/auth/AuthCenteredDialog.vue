<script setup lang="ts">
interface Props {
  title: string
  closeLabel: string
  closeIconSrc: string
  closeTo?: string
  bodyClass?: string
  panelClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  bodyClass: '',
  panelClass: '',
})

const emit = defineEmits<{
  close: []
}>()

const slots = useSlots()
const titleId = 'auth-centered-dialog-title'
const closeTag = computed(() => props.closeTo ? resolveComponent('NuxtLink') : 'button')
const closeAttrs = computed(() =>
  props.closeTo
    ? { to: props.closeTo }
    : { type: 'button' as const },
)

function closeDialog() {
  if (!props.closeTo) {
    emit('close')
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[rgba(9,9,9,0.42)] px-4 py-6 backdrop-blur-[6px]"
  >
    <section
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :class="[
        'flex max-h-[calc(100svh-48px)] w-full max-w-[600px] flex-col items-center gap-3 rounded-lg bg-white py-4 shadow-[0_24px_90px_rgba(9,9,9,0.18)]',
        panelClass,
      ]"
    >
      <header class="flex w-full items-center gap-3 px-5 py-2">
        <h1
          :id="titleId"
          class="min-w-0 flex-1 text-start text-xl font-bold leading-normal text-black-normal-hover"
        >
          {{ title }}
        </h1>

        <component
          :is="closeTag"
          v-bind="closeAttrs"
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-grey-normal transition-colors hover:bg-grey-normal-hover"
          :aria-label="closeLabel"
          @click="closeDialog"
        >
          <img
            class="size-[10px]"
            :src="closeIconSrc"
            alt=""
            aria-hidden="true"
          >
        </component>
      </header>

      <div :class="['min-h-0 w-full', bodyClass]">
        <slot />
      </div>

      <footer v-if="slots.footer" class="w-full pt-4">
        <div class="w-full px-5">
          <slot name="footer" />
        </div>
      </footer>
    </section>
  </div>
</template>
