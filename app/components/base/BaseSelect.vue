<script setup lang="ts">
interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options?: SelectOption[]
  label?: string
  placeholder?: string
  error?: string
  helper?: string
  disabled?: boolean
  searchable?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  disabled: false,
  required: false,
  searchable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const slots = useSlots()
const selectId = computed(() => props.id ?? `select-${Math.random().toString(36).slice(2, 9)}`)

const selectClasses = computed(() => [
  'w-full h-12 bg-grey-normal rounded-sm border ps-3 pe-9 appearance-none transition-colors duration-150 text-black-normal cursor-pointer',
  'focus:outline-none focus:border-blue-light-active',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  props.error ? 'border-status-canceled-text' : 'border-transparent',
  !props.modelValue ? 'text-grey-dark' : '',
])
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <div v-if="label" class="flex items-center gap-1">
      <label :for="selectId" class="text-sm font-medium text-black-normal">
        {{ label }}
      </label>
      <span v-if="required" class="text-status-canceled-text text-xs" aria-hidden="true">*</span>
    </div>

    <div class="relative flex items-center">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="selectClasses"
        :aria-invalid="!!error || undefined"
        :aria-describedby="error || helper || slots.helper ? `${selectId}-hint` : undefined"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled :selected="!modelValue">
          {{ placeholder }}
        </option>

        <slot>
          <option
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            :selected="option.value === modelValue"
          >
            {{ option.label }}
          </option>
        </slot>
      </select>

      <!-- Chevron icon -->
      <span class="absolute end-3 flex items-center pointer-events-none text-grey-dark-active" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>

    <p
      v-if="error || helper || slots.helper"
      :id="`${selectId}-hint`"
      :class="['text-xs', error ? 'text-status-canceled-text' : 'text-grey-dark-active']"
    >
      <slot name="helper">{{ error || helper }}</slot>
    </p>
  </div>
</template>
