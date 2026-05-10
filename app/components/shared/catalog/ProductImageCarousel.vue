<script setup lang="ts">
import type { ProductMedia } from '~/types/product'

interface Props {
  images: ProductMedia[]
  activeIndex?: number
  ratio?: '1/1' | '4/3' | '16/9' | '3/4'
  contain?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeIndex: 0,
  ratio: '1/1',
  contain: true,
})

const emit = defineEmits<{
  'update:activeIndex': [index: number]
}>()

const { t, locale } = useI18n()
const isRtl = computed(() => getDirection(locale.value) === 'rtl')

const current = ref(props.activeIndex)

watch(
  () => props.activeIndex,
  (val) => { current.value = val },
)

const total = computed(() => props.images.length)
const hasSingle = computed(() => total.value <= 1)

function goTo(index: number) {
  const clamped = Math.max(0, Math.min(index, total.value - 1))
  current.value = clamped
  emit('update:activeIndex', clamped)
}

function prev() {
  goTo(current.value - 1)
}

function next() {
  goTo(current.value + 1)
}

const trackStyle = computed(() => {
  const offset = current.value * 100
  return {
    transform: `translateX(${isRtl.value ? offset : -offset}%)`,
    transition: 'transform 300ms ease',
  }
})

const paddingTop = computed(() => {
  const ratioMap: Record<string, string> = {
    '1/1': '100%',
    '4/3': '75%',
    '16/9': '56.25%',
    '3/4': '133.33%',
  }
  return ratioMap[props.ratio] ?? '100%'
})

function altText(img: ProductMedia, index: number) {
  return img.alt ?? t('carousel.slideOf', { n: index + 1, total: total.value })
}
</script>

<template>
  <div class="relative select-none">
    <!-- Image track -->
    <div
      class="overflow-hidden rounded-sm bg-grey-normal"
      :style="{ paddingTop }"
    >
      <div
        class="absolute inset-0 flex"
        :style="trackStyle"
      >
        <div
          v-for="(img, index) in images"
          :key="img.id"
          class="w-full shrink-0 h-full"
          :aria-hidden="index !== current"
        >
          <img
            :src="img.url"
            :alt="altText(img, index)"
            :class="[
              'w-full h-full',
              contain ? 'object-contain' : 'object-cover',
            ]"
            loading="lazy"
            draggable="false"
          />
        </div>
      </div>
    </div>

    <!-- Controls slot or default arrows -->
    <slot name="controls">
      <template v-if="!hasSingle">
        <!-- Previous -->
        <button
          type="button"
          class="absolute start-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-xl bg-grey-light/80 text-black-normal hover:bg-grey-light transition-colors shadow-sm"
          :aria-label="t('common.previous')"
          :disabled="current === 0"
          @click="isRtl ? next() : prev()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="rtl:rotate-180"
            aria-hidden="true"
          >
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <!-- Next -->
        <button
          type="button"
          class="absolute end-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-xl bg-grey-light/80 text-black-normal hover:bg-grey-light transition-colors shadow-sm"
          :aria-label="t('common.next')"
          :disabled="current === total - 1"
          @click="isRtl ? prev() : next()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="rtl:rotate-180"
            aria-hidden="true"
          >
            <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </template>
    </slot>

    <!-- Badge slot (e.g. promotion label) -->
    <div v-if="$slots.badge" class="absolute top-2 start-2">
      <slot name="badge" />
    </div>

    <!-- Dot indicators -->
    <div
      v-if="!hasSingle"
      class="flex justify-center gap-1.5 mt-2"
      role="tablist"
      :aria-label="t('carousel.slideOf', { n: current + 1, total })"
    >
      <button
        v-for="(_, index) in images"
        :key="index"
        type="button"
        role="tab"
        :aria-selected="index === current"
        :aria-label="t('carousel.goToSlide', { n: index + 1 })"
        :class="[
          'rounded-xl transition-all duration-200',
          index === current
            ? 'bg-blue-normal w-4 h-1.5'
            : 'bg-grey-normal-hover w-1.5 h-1.5',
        ]"
        @click="goTo(index)"
      />
    </div>
  </div>
</template>
