<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg'
  shadow?: boolean
  border?: boolean
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  rounded: 'md',
  shadow: false,
  border: false,
  as: 'div',
})

const slots = useSlots()

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const roundedClasses: Record<string, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
}

const cardClasses = computed(() => [
  'bg-grey-light flex flex-col',
  roundedClasses[props.rounded],
  props.shadow ? 'shadow-overlay' : '',
  props.border ? 'border border-grey-normal-hover' : '',
])

const bodyPaddingClass = computed(() => paddingClasses[props.padding])
</script>

<template>
  <component :is="as" :class="cardClasses">
    <div v-if="slots.header" :class="['border-b border-grey-normal shrink-0', bodyPaddingClass]">
      <slot name="header" />
    </div>

    <div :class="['flex-1', bodyPaddingClass]">
      <slot />
    </div>

    <div v-if="slots.footer" :class="['border-t border-grey-normal shrink-0', bodyPaddingClass]">
      <slot name="footer" />
    </div>
  </component>
</template>
