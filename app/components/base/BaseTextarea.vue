<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  required?: boolean
  optional?: boolean
  error?: string
  helper?: string
  rows?: number
  maxLength?: number
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  required: false,
  optional: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const slots = useSlots()
const textareaId = computed(() => props.id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`)
const charCount = computed(() => props.modelValue?.length ?? 0)

const textareaClasses = computed(() => [
  'w-full bg-grey-normal rounded-sm border py-3 px-3 transition-colors duration-150 text-black-normal placeholder:text-grey-dark resize-none',
  'focus:outline-none focus:border-blue-light-active',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  props.error ? 'border-status-canceled-text' : 'border-transparent',
])
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <div v-if="label" class="flex items-center gap-1">
      <label :for="textareaId" class="text-sm font-medium text-black-normal">
        {{ label }}
      </label>
      <span v-if="required" class="text-status-canceled-text text-xs" aria-hidden="true">*</span>
    </div>

    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxLength"
      :class="textareaClasses"
      :aria-invalid="!!error || undefined"
      :aria-describedby="error || helper || slots.helper ? `${textareaId}-hint` : undefined"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <div class="flex items-start justify-between gap-2">
      <p
        v-if="error || helper || slots.helper"
        :id="`${textareaId}-hint`"
        :class="['text-xs', error ? 'text-status-canceled-text' : 'text-grey-dark-active']"
      >
        <slot name="helper">{{ error || helper }}</slot>
      </p>
      <span
        v-if="maxLength"
        class="text-xs text-grey-dark-active ms-auto shrink-0 tabular-nums"
        aria-live="polite"
      >
        {{ charCount }}&nbsp;/&nbsp;{{ maxLength }}
      </span>
    </div>
  </div>
</template>
