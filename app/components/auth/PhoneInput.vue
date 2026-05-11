<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { locale, t } = useI18n()

const inputId = computed(() => props.id ?? 'auth-phone-input')
const inputAlignmentClass = computed(() => locale.value === 'ar' ? 'text-end' : 'text-start')

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, '')

  if (digits.startsWith('966')) {
    digits = digits.slice(3)
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  return digits.slice(0, 9)
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const nextValue = normalizePhone(target.value)

  target.value = nextValue
  emit('update:modelValue', nextValue)
}
</script>

<template>
  <div class="flex w-full flex-col gap-1.5">
    <label
      :for="inputId"
      class="sr-only"
    >
      {{ label ?? t('auth.loginPage.form.phoneLabel') }}
    </label>

    <div
      :class="[
        'flex h-14 w-full items-center justify-between gap-4 rounded-lg border bg-white p-4 transition-colors focus-within:border-blue-normal focus-within:ring-2 focus-within:ring-blue-light',
        error ? 'border-status-canceled-text' : 'border-grey-normal-hover',
        disabled ? 'opacity-60' : '',
      ]"
      dir="ltr"
    >
      <div class="flex shrink-0 items-center gap-2" dir="ltr">
        <span class="flex items-center gap-1">
          <span class="relative h-5 w-7 overflow-hidden rounded-[3px] bg-[#249F58]" aria-hidden="true">
            <img
              class="absolute inset-[26%_24%_24%_22%] h-auto w-auto"
              src="/images/auth/login/saudi-flag-symbol.svg"
              alt=""
            >
          </span>

          <span class="text-sm text-black-normal">
            {{ t('auth.loginPage.form.countryCode') }}
          </span>
        </span>

        <span class="h-6 w-px bg-grey-normal-hover" aria-hidden="true" />
      </div>

      <input
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'h-full min-w-0 flex-1 bg-transparent text-sm text-black-normal placeholder:text-grey-normal-active focus:outline-none',
          inputAlignmentClass,
        ]"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        dir="ltr"
        :aria-invalid="!!error || undefined"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        @input="handleInput"
      >
    </div>

    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="text-xs text-status-canceled-text"
    >
      {{ error }}
    </p>
  </div>
</template>
