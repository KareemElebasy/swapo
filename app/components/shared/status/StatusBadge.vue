<script setup lang="ts">
import type { AppStatus, StatusTone } from '~/types/status'

interface Props {
  status?: AppStatus | string
  label?: string
  tone?: StatusTone
  size?: 'sm' | 'md'
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  dot: false,
})

const { t } = useI18n()

const meta = computed(() => props.status ? getStatusMeta(props.status) : getStatusMeta('default'))
const tone = computed(() => props.tone ?? meta.value.tone)
const label = computed(() => props.label ?? t(meta.value.labelKey))
</script>

<template>
  <BaseBadge :tone="tone" :size="size" :dot="dot">
    {{ label }}
  </BaseBadge>
</template>
