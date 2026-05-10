<script setup lang="ts">
interface Props {
  variant?: 'text' | 'circle' | 'rect'
  lines?: number
  animate?: boolean
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'rect',
  lines: 1,
  animate: true,
  width: '',
  height: '',
})

const shapeClasses = computed(() => {
  if (props.variant === 'circle') return 'rounded-xl'
  if (props.variant === 'text') return 'rounded-xs'
  return 'rounded-sm'
})

const defaultSize = computed(() => {
  if (props.variant === 'circle') return { width: 'w-10', height: 'h-10' }
  if (props.variant === 'text') return { width: 'w-full', height: 'h-4' }
  return { width: 'w-full', height: 'h-24' }
})

function lineClasses(lineIndex: number) {
  const isLast = lineIndex === props.lines - 1
  return [
    'bg-grey-normal',
    props.animate ? 'animate-pulse' : '',
    shapeClasses.value,
    props.width || defaultSize.value.width,
    props.height || defaultSize.value.height,
    // Last line in a text block is shorter to look natural
    props.variant === 'text' && props.lines > 1 && isLast ? 'w-3/4' : '',
  ]
}
</script>

<template>
  <div
    role="presentation"
    aria-hidden="true"
    :class="['flex flex-col gap-2', lines === 1 ? 'contents' : '']"
  >
    <div
      v-for="i in lines"
      :key="i"
      :class="lineClasses(i - 1)"
    />
  </div>
</template>
