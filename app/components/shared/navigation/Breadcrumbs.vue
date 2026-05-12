<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items?: BreadcrumbItem[]
  current?: string
  variant?: 'compact' | 'full'
  showHome?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'full',
  showHome: true,
  items: () => [],
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const generatedItems = computed<BreadcrumbItem[]>(() => {
  if (props.items.length) return props.items

  const normalizedPath = route.path.replace(/^\/en(?=\/|$)/, '') || '/'
  const segments = normalizedPath.split('/').filter(Boolean)

  return segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`
    const label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

    return {
      label,
      to: index === segments.length - 1 ? undefined : path,
    }
  })
})

const allItems = computed<BreadcrumbItem[]>(() => {
  if (!props.showHome) return generatedItems.value
  return [{ label: t('common.home'), to: '/' }, ...generatedItems.value]
})

const visibleItems = computed<BreadcrumbItem[]>(() => {
  const items = allItems.value

  if (props.variant === 'compact' && items.length > 3) {
    return [
      items[0],
      { label: '...', to: undefined },
      ...items.slice(-2),
    ].filter(Boolean) as BreadcrumbItem[]
  }

  return items
})

function itemTo(item: BreadcrumbItem) {
  if (!item.to) return undefined
  return item.to.startsWith('/') ? localePath(item.to) : item.to
}
</script>

<template>
  <nav aria-label="breadcrumb">
    <ol class="flex flex-wrap items-center gap-1 text-sm">
      <li
        v-for="(item, index) in visibleItems"
        :key="`${item.label}-${index}`"
        class="flex min-w-0 items-center gap-1"
      >
        <span
          v-if="index > 0"
          class="flex shrink-0 items-center text-grey-dark"
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
          <span v-if="item.label === '...'" class="px-1 text-grey-dark">...</span>

          <span
            v-else-if="index === visibleItems.length - 1"
            class="max-w-[200px] truncate font-medium text-black-normal"
            aria-current="page"
          >
            {{ current ?? item.label }}
          </span>

          <NuxtLink
            v-else-if="itemTo(item)"
            :to="itemTo(item)"
            class="max-w-[160px] truncate text-grey-dark-active transition-colors hover:text-blue-normal"
          >
            {{ item.label }}
          </NuxtLink>

          <span v-else class="max-w-[160px] truncate text-grey-dark-active">
            {{ item.label }}
          </span>
        </slot>
      </li>
    </ol>
  </nav>
</template>
