<script setup lang="ts">
interface Props {
  to: string
  label: string
  exact?: boolean
}

withDefaults(defineProps<Props>(), {
  exact: false,
})

const route = useRoute()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath(to)"
    :class="[
      'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors',
      $route.path === localePath(to) || (!exact && $route.path.startsWith(localePath(to) + '/'))
        ? 'bg-blue-light text-blue-normal'
        : 'text-grey-darker hover:bg-grey-normal hover:text-black-normal',
    ]"
  >
    <span class="shrink-0 flex items-center justify-center size-5 text-current" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="flex-1 truncate">{{ label }}</span>
    <slot name="end" />
  </NuxtLink>
</template>
