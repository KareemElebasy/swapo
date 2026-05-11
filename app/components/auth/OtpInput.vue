<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";

interface Props {
  modelValue?: string;
  length?: number;
  disabled?: boolean;
  error?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  length: 4,
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  complete: [value: string];
}>();

const { t } = useI18n();
const inputRefs = ref<HTMLInputElement[]>([]);

const digits = computed(() =>
  Array.from(
    { length: props.length },
    (_, index) => props.modelValue[index] ?? "",
  ),
);

const inputId = computed(() => props.id ?? "auth-otp-input");

function setInputRef(
  element: Element | ComponentPublicInstance | null,
  index: number,
) {
  if (element instanceof HTMLInputElement) {
    inputRefs.value[index] = element;
  }
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, props.length);
}

function focusInput(index: number) {
  inputRefs.value[index]?.focus();
  inputRefs.value[index]?.select();
}

function updateDigits(nextDigits: string[]) {
  const nextValue = nextDigits.join("").slice(0, props.length);

  emit("update:modelValue", nextValue);

  if (nextValue.length === props.length) {
    emit("complete", nextValue);
  }
}

function applyValue(startIndex: number, value: string) {
  const cleanValue = normalizeDigits(value);

  if (!cleanValue) {
    const nextDigits = [...digits.value];
    nextDigits[startIndex] = "";
    updateDigits(nextDigits);
    return;
  }

  const nextDigits = [...digits.value];

  cleanValue.split("").forEach((digit, offset) => {
    const targetIndex = startIndex + offset;

    if (targetIndex < props.length) {
      nextDigits[targetIndex] = digit;
    }
  });

  updateDigits(nextDigits);
  focusInput(Math.min(startIndex + cleanValue.length, props.length - 1));
}

function handleInput(index: number, event: Event) {
  if (props.disabled) {
    return;
  }

  const target = event.target as HTMLInputElement;

  applyValue(index, target.value);
}

function handlePaste(index: number, event: ClipboardEvent) {
  if (props.disabled) {
    return;
  }

  event.preventDefault();
  applyValue(index, event.clipboardData?.getData("text") ?? "");
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (props.disabled) {
    return;
  }

  if (event.key === "Backspace" && !digits.value[index] && index > 0) {
    event.preventDefault();

    const nextDigits = [...digits.value];
    nextDigits[index - 1] = "";
    updateDigits(nextDigits);
    focusInput(index - 1);
  }

  if (event.key === "ArrowLeft" && index > 0) {
    event.preventDefault();
    focusInput(index - 1);
  }

  if (event.key === "ArrowRight" && index < props.length - 1) {
    event.preventDefault();
    focusInput(index + 1);
  }
}
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div
      class="flex h-[103px] w-full items-center justify-center gap-2"
      dir="ltr"
      role="group"
      :aria-label="t('auth.verifyPage.form.otpLabel')"
    >
      <input
        v-for="(_, index) in digits"
        :id="index === 0 ? inputId : undefined"
        :key="index"
        :ref="(element) => setInputRef(element, index)"
        :value="digits[index]"
        :disabled="disabled"
        class="size-16 rounded-2xl border-[0.5px] border-grey-normal-hover bg-white text-center text-2xl font-semibold leading-none text-black-normal caret-blue-normal outline-none transition-colors focus:border-blue-light-active focus:ring-2 focus:ring-blue-light sm:size-[72px]"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="one-time-code"
        maxlength="1"
        dir="ltr"
        :aria-label="t('auth.verifyPage.form.digitLabel', { index: index + 1 })"
        :aria-invalid="!!error || undefined"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        @input="handleInput(index, $event)"
        @paste="handlePaste(index, $event)"
        @keydown="handleKeydown(index, $event)"
      />
    </div>

    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="text-sm text-status-canceled-text"
    >
      {{ error }}
    </p>
  </div>
</template>
