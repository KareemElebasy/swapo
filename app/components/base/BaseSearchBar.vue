<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  showFilter?: boolean
  clearable?: boolean
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  showFilter: false,
  clearable: true,
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
  filter: []
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onSearch() {
  emit('search', props.modelValue ?? '')
}

function onClear() {
  emit('update:modelValue', '')
  emit('clear')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') onSearch()
}
</script>

<template>
  <div
    class="flex items-center gap-2 h-[46px] bg-grey-normal rounded-sm border border-transparent transition-colors duration-150 px-3 focus-within:border-blue-light-active"
    :class="disabled ? 'opacity-50 pointer-events-none' : ''"
  >
    <!-- Filter button at logical start -->
    <button
      v-if="showFilter"
      type="button"
      class="shrink-0 flex items-center justify-center text-grey-dark-active hover:text-blue-normal transition-colors"
      :aria-label="$t ? $t('common.filter') : 'Filter'"
      @click="emit('filter')"
    >
      <slot name="leading">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </slot>
    </button>

    <!-- Text input takes all remaining space -->
    <input
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      dir="auto"
      class="flex-1 min-w-0 bg-transparent border-none outline-none text-black-normal placeholder:text-grey-dark text-base"
      @input="onInput"
      @keydown="onKeydown"
    />

    <!-- Clear button when value exists -->
    <button
      v-if="clearable && modelValue"
      type="button"
      class="shrink-0 flex items-center justify-center text-grey-dark-active hover:text-black-normal transition-colors"
      :aria-label="$t ? $t('common.clear') : 'Clear'"
      @click="onClear"
    >
      <slot name="clear-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </slot>
    </button>

    <!-- Loading spinner or search icon at logical end -->
    <span class="shrink-0 flex items-center justify-center text-grey-dark-active">
      <slot name="trailing">
        <span v-if="loading" class="animate-spin">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="12" />
          </svg>
        </span>
        <button
          v-else
          type="button"
          class="flex items-center justify-center hover:text-blue-normal transition-colors"
          :aria-label="$t ? $t('common.search') : 'Search'"
          @click="onSearch"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5" />
            <path d="M12.5 12.5L15.5 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </slot>
    </span>
  </div>
</template>
