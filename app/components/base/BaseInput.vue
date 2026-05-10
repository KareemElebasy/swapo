<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  required?: boolean
  optional?: boolean
  error?: string
  helper?: string
  disabled?: boolean
  dir?: 'ltr' | 'rtl' | 'auto'
  startIcon?: boolean
  endIcon?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  optional: false,
  disabled: false,
  dir: 'auto',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const slots = useSlots()
const inputId = computed(() => props.id ?? `input-${Math.random().toString(36).slice(2, 9)}`)

const hasPrefix = computed(() => !!slots.prefix || props.startIcon)
const hasSuffix = computed(() => !!slots.suffix || props.endIcon)

const inputClasses = computed(() => [
  'w-full h-12 bg-grey-normal rounded-sm border transition-colors duration-150 text-black-normal placeholder:text-grey-dark',
  'focus:outline-none focus:border-blue-light-active',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  props.error ? 'border-status-canceled-text' : 'border-transparent',
  hasPrefix.value ? 'ps-10' : 'ps-3',
  hasSuffix.value ? 'pe-10' : 'pe-3',
])
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <div v-if="label" class="flex items-center gap-1">
      <label :for="inputId" class="text-sm font-medium text-black-normal">
        {{ label }}
      </label>
      <span v-if="required" class="text-status-canceled-text text-xs" aria-hidden="true">*</span>
      <span v-else-if="optional" class="text-grey-dark-active text-xs">
        <slot name="optional-label">
          <!-- parent provides optional label text via slot or translate in page -->
        </slot>
      </span>
    </div>

    <div class="relative flex items-center">
      <span
        v-if="hasPrefix"
        class="absolute start-3 flex items-center text-grey-dark-active pointer-events-none"
        aria-hidden="true"
      >
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :dir="dir"
        :class="inputClasses"
        :aria-invalid="!!error || undefined"
        :aria-describedby="error || helper ? `${inputId}-hint` : undefined"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <span
        v-if="hasSuffix"
        class="absolute end-3 flex items-center text-grey-dark-active"
        aria-hidden="true"
      >
        <slot name="suffix" />
      </span>
    </div>

    <p
      v-if="error || helper || slots.helper"
      :id="`${inputId}-hint`"
      :class="['text-xs', error ? 'text-status-canceled-text' : 'text-grey-dark-active']"
    >
      <slot name="helper">{{ error || helper }}</slot>
    </p>
  </div>
</template>
