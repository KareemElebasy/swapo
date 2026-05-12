<script setup lang="ts">
interface Props {
  to: string
  label: string
  exact?: boolean
  badge?: string | number
  showChevron?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  exact: false,
  showChevron: true,
})

const route = useRoute()
const localePath = useLocalePath()

const localizedTo = computed(() => localePath(props.to))
const isActive = computed(() => {
  if (props.exact) return route.path === localizedTo.value
  return route.path === localizedTo.value || route.path.startsWith(`${localizedTo.value}/`)
})
</script>

<template>
  <NuxtLink
    :to="localizedTo"
    :class="[
      'flex min-h-[50px] items-center justify-between gap-3 rounded-xs p-3 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal',
      isActive
        ? 'bg-brand-cyan-light text-brand-cyan'
        : 'text-black-normal hover:bg-grey-normal',
    ]"
  >
    <span
      v-if="showChevron"
      class="flex size-4 shrink-0 items-center justify-center text-grey-dark-active"
      aria-hidden="true"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="ltr:rotate-180"
      >
        <path d="M10 4 6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>

    <span class="flex min-w-0 flex-1 items-center justify-end gap-2">
      <span class="min-w-0 flex-1 truncate text-end">{{ label }}</span>

      <span class="flex size-5 shrink-0 items-center justify-center text-current" aria-hidden="true">
        <slot name="icon" />
      </span>
    </span>

    <span
      v-if="badge !== undefined"
      class="ms-1 inline-flex min-w-5 items-center justify-center rounded-xl bg-blue-light px-1.5 text-xs text-blue-normal"
    >
      {{ badge }}
    </span>

    <slot name="end" />
  </NuxtLink>
</template>
