<script setup lang="ts">
import type { Category } from '~/types/product'

interface Props {
  categories: Category[]
  activeId?: string | null
  scrollable?: boolean
  divided?: boolean
  variant?: 'nav' | 'chips' | 'selector'
  showAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeId: null,
  scrollable: true,
  divided: false,
  variant: 'nav',
  showAll: false,
})

const emit = defineEmits<{
  select: [id: string | null]
}>()

const { t } = useI18n()

function select(id: string | null) {
  emit('select', id)
}

function isActive(id: string | null) {
  return props.activeId === id
}

const itemBaseClass = computed(() => {
  if (props.variant === 'chips') {
    return 'shrink-0 px-4 py-1.5 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal'
  }
  if (props.variant === 'selector') {
    return 'shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal'
  }
  // nav
  return 'shrink-0 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal'
})

function itemStateClass(active: boolean) {
  if (props.variant === 'chips') {
    return active
      ? 'bg-blue-normal text-green-normal'
      : 'bg-grey-normal text-grey-dark-active hover:bg-grey-normal-hover hover:text-black-normal'
  }
  if (props.variant === 'selector') {
    return active
      ? 'text-blue-normal bg-blue-light'
      : 'text-grey-dark-active hover:text-black-normal hover:bg-grey-normal'
  }
  // nav (line)
  return active
    ? 'border-blue-normal text-blue-normal'
    : 'border-transparent text-grey-dark-active hover:text-black-normal hover:border-grey-dark'
}

const containerClass = computed(() => [
  'flex gap-1',
  props.scrollable
    ? 'overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory pb-1'
    : 'flex-wrap',
  props.variant === 'nav' && !props.scrollable ? 'border-b border-grey-normal-hover' : '',
  props.variant === 'nav' && props.scrollable ? 'border-b border-grey-normal-hover' : '',
])
</script>

<template>
  <nav :class="containerClass" aria-label="category navigation">
    <!-- All button -->
    <button
      v-if="showAll"
      type="button"
      :class="[itemBaseClass, itemStateClass(isActive(null)), 'snap-start']"
      :aria-current="isActive(null) ? 'true' : undefined"
      @click="select(null)"
    >
      {{ t('category.all') }}
    </button>

    <!-- Divider after All -->
    <span
      v-if="showAll && divided && categories.length"
      class="shrink-0 self-stretch w-px bg-grey-normal-hover my-1"
      aria-hidden="true"
    />

    <template v-for="(category, index) in categories" :key="category.id">
      <slot name="item" :category="category" :active="isActive(category.id)" :select="() => select(category.id)">
        <button
          type="button"
          :class="[itemBaseClass, itemStateClass(isActive(category.id)), 'snap-start']"
          :aria-current="isActive(category.id) ? 'true' : undefined"
          @click="select(category.id)"
        >
          {{ category.name }}
        </button>
      </slot>

      <span
        v-if="divided && index < categories.length - 1"
        class="shrink-0 self-stretch w-px bg-grey-normal-hover my-1"
        aria-hidden="true"
      />
    </template>
  </nav>
</template>
