<script setup lang="ts">
interface TabItem {
  value: string
  label: string
  disabled?: boolean
  badge?: string | number
}

interface Props {
  modelValue: string
  items: TabItem[]
  variant?: 'line' | 'pills' | 'segment'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'line',
  fullWidth: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const tablistRef = ref<HTMLElement | null>(null)

function select(value: string) {
  emit('update:modelValue', value)
}

function onKeydown(event: KeyboardEvent, index: number) {
  const isRtl = document.documentElement.dir === 'rtl'
  const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight'
  const backKey = isRtl ? 'ArrowRight' : 'ArrowLeft'
  const enabled = props.items.filter((t) => !t.disabled)

  if (event.key === forwardKey || event.key === 'ArrowDown') {
    event.preventDefault()
    const currentEnabledIdx = enabled.findIndex((t) => t.value === props.items[index]?.value)
    const next = enabled[(currentEnabledIdx + 1) % enabled.length]
    if (next) {
      select(next.value)
      nextTick(() => {
        const btn = tablistRef.value?.querySelector<HTMLElement>(`[data-value="${next.value}"]`)
        btn?.focus()
      })
    }
  }

  if (event.key === backKey || event.key === 'ArrowUp') {
    event.preventDefault()
    const currentEnabledIdx = enabled.findIndex((t) => t.value === props.items[index]?.value)
    const prev = enabled[(currentEnabledIdx - 1 + enabled.length) % enabled.length]
    if (prev) {
      select(prev.value)
      nextTick(() => {
        const btn = tablistRef.value?.querySelector<HTMLElement>(`[data-value="${prev.value}"]`)
        btn?.focus()
      })
    }
  }

  if (event.key === 'Home') {
    event.preventDefault()
    const first = props.items.find((t) => !t.disabled)
    if (first) select(first.value)
  }

  if (event.key === 'End') {
    event.preventDefault()
    const last = [...props.items].reverse().find((t) => !t.disabled)
    if (last) select(last.value)
  }
}

// --- Style maps ---

const listClasses = computed(() => {
  if (props.variant === 'segment') {
    return 'flex p-1 bg-grey-normal rounded-sm gap-1'
  }
  if (props.variant === 'pills') {
    return 'flex gap-2 flex-wrap'
  }
  return 'flex border-b border-grey-normal-hover'
})

function tabClasses(item: TabItem) {
  const isActive = item.value === props.modelValue
  const base = 'inline-flex items-center gap-2 font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal disabled:opacity-40 disabled:cursor-not-allowed'

  if (props.variant === 'segment') {
    return [
      base,
      'px-4 py-1.5 rounded-xs text-sm',
      props.fullWidth ? 'flex-1 justify-center' : '',
      isActive
        ? 'bg-grey-light text-blue-normal shadow-sm'
        : 'text-grey-dark-active hover:text-black-normal',
    ]
  }

  if (props.variant === 'pills') {
    return [
      base,
      'px-4 py-2 rounded-sm text-sm',
      props.fullWidth ? 'flex-1 justify-center' : '',
      isActive
        ? 'bg-blue-normal text-green-normal'
        : 'bg-grey-normal text-grey-dark-active hover:bg-grey-normal-hover hover:text-black-normal',
    ]
  }

  // line (default)
  return [
    base,
    'px-4 py-3 text-sm border-b-2 -mb-px',
    props.fullWidth ? 'flex-1 justify-center' : '',
    isActive
      ? 'border-blue-normal text-blue-normal'
      : 'border-transparent text-grey-dark-active hover:text-black-normal hover:border-grey-dark',
  ]
}
</script>

<template>
  <div>
    <!-- Tab list -->
    <div
      ref="tablistRef"
      role="tablist"
      :class="listClasses"
    >
      <button
        v-for="(item, index) in items"
        :key="item.value"
        role="tab"
        type="button"
        :data-value="item.value"
        :aria-selected="item.value === modelValue"
        :aria-controls="`tabpanel-${item.value}`"
        :tabindex="item.value === modelValue ? 0 : -1"
        :disabled="item.disabled || undefined"
        :class="tabClasses(item)"
        @click="!item.disabled && select(item.value)"
        @keydown="onKeydown($event, index)"
      >
        {{ item.label }}
        <span
          v-if="item.badge !== undefined"
          class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs rounded-xl bg-blue-light text-blue-normal"
        >
          {{ item.badge }}
        </span>
      </button>
    </div>

    <!-- Tab panels via scoped slot -->
    <div
      :id="`tabpanel-${modelValue}`"
      role="tabpanel"
      :aria-labelledby="modelValue"
      tabindex="0"
      class="focus-visible:outline-none"
    >
      <slot :active="modelValue" />
    </div>
  </div>
</template>
