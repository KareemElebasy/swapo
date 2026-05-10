<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items: BreadcrumbItem[]
  current?: string
  variant?: 'compact' | 'full'
  showHome?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'full',
  showHome: true,
})

const { t } = useI18n()
const localePath = useLocalePath()

const allItems = computed<BreadcrumbItem[]>(() => {
  if (!props.showHome) return props.items
  return [{ label: t('common.home'), to: localePath('/') }, ...props.items]
})

const visibleItems = computed(() => {
  if (props.variant === 'compact' && allItems.value.length > 3) {
    return [
      allItems.value[0],
      { label: '…', to: undefined },
      ...allItems.value.slice(-2),
    ]
  }
  return allItems.value
})
</script>

<template>
  <nav aria-label="breadcrumb">
    <ol class="flex flex-wrap items-center gap-1 text-sm">
      <li
        v-for="(item, index) in visibleItems"
        :key="index"
        class="flex items-center gap-1"
      >
        <!-- Separator — hidden for first item -->
        <span
          v-if="index > 0"
          class="flex items-center text-grey-dark shrink-0"
          aria-hidden="true"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="rtl:[transform:scaleX(-1)]"
          >
            <path d="M4.5 9l3-3-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>

        <slot name="item" :item="item" :index="index" :is-last="index === visibleItems.length - 1">
          <!-- Ellipsis -->
          <span v-if="item.label === '…'" class="text-grey-dark px-1">…</span>

          <!-- Last item (current page) -->
          <span
            v-else-if="index === visibleItems.length - 1"
            class="text-black-normal font-medium truncate max-w-[200px]"
            aria-current="page"
          >
            {{ current ?? item.label }}
          </span>

          <!-- Link -->
          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            class="text-grey-dark-active hover:text-blue-normal transition-colors truncate max-w-[160px]"
          >
            {{ item.label }}
          </NuxtLink>

          <!-- Non-linked item -->
          <span v-else class="text-grey-dark-active truncate max-w-[160px]">
            {{ item.label }}
          </span>
        </slot>
      </li>
    </ol>
  </nav>
</template>
