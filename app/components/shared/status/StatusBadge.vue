<script setup lang="ts">
import type { AppStatus } from '~/types/status'

interface Props {
  status: AppStatus
  size?: 'sm' | 'md'
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  dot: false,
})

const { t } = useI18n()

const meta = computed(() => getStatusMeta(props.status))
const label = computed(() => t(meta.value.labelKey))
</script>

<template>
  <BaseBadge :tone="meta.tone" :size="size" :dot="dot">
    {{ label }}
  </BaseBadge>
</template>
