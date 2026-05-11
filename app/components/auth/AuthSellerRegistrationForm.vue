<script setup lang="ts">
import arrowIcon from '~/assets/images/auth/seller/arrow-left.svg'
import closeIcon from '~/assets/images/auth/seller/close-form.svg'

type FieldKey = 'storeName' | 'nationalId' | 'bankName' | 'iban'

interface SellerRegistrationField {
  key: FieldKey
  labelKey: string
  placeholderKey: string
  required?: boolean
  optional?: boolean
  autocomplete: string
  inputmode?: 'text' | 'numeric'
  dir: 'auto' | 'ltr'
}

const { locale, t } = useI18n()
const localePath = useLocalePath()

const form = reactive<Record<FieldKey, string>>({
  storeName: '',
  nationalId: '',
  bankName: '',
  iban: '',
})

const fields: SellerRegistrationField[] = [
  {
    key: 'storeName',
    labelKey: 'seller.registration.form.storeName',
    placeholderKey: 'seller.registration.form.placeholders.storeName',
    optional: true,
    autocomplete: 'organization',
    dir: 'auto',
  },
  {
    key: 'nationalId',
    labelKey: 'seller.registration.form.nationalId',
    placeholderKey: 'seller.registration.form.placeholders.nationalId',
    optional: true,
    autocomplete: 'off',
    inputmode: 'numeric',
    dir: 'ltr',
  },
  {
    key: 'bankName',
    labelKey: 'seller.registration.form.bankName',
    placeholderKey: 'seller.registration.form.placeholders.bankName',
    required: true,
    autocomplete: 'off',
    dir: 'auto',
  },
  {
    key: 'iban',
    labelKey: 'seller.registration.form.iban',
    placeholderKey: 'seller.registration.form.placeholders.iban',
    required: true,
    autocomplete: 'off',
    inputmode: 'text',
    dir: 'ltr',
  },
]

const arrowClass = computed(() => locale.value === 'ar' ? '' : 'rotate-180')
const canSubmit = computed(
  () => form.bankName.trim().length > 0 && form.iban.trim().length > 0,
)

function submitRegistration() {
  if (!canSubmit.value) {
    return
  }

  // Hook this up to auth/seller-registration when location selection is wired.
}
</script>

<template>
  <AuthCenteredDialog
    :title="t('seller.registration.title')"
    :close-label="t('common.close')"
    :close-to="localePath('/auth/lock')"
    :close-icon-src="closeIcon"
    body-class="overflow-y-auto px-5"
  >
    <form class="flex w-full flex-col gap-4" @submit.prevent="submitRegistration">
      <p class="text-start text-sm leading-6 text-grey-darker">
        {{ t('seller.registration.subtitle') }}
      </p>

      <section class="flex w-full flex-col gap-2">
        <div class="flex w-full flex-col gap-0.5 text-start">
          <div class="flex w-full items-center gap-0.5 text-sm font-medium leading-5 text-black-normal-hover">
            <span>{{ t('seller.registration.form.pickupLocation') }}</span>
            <span class="text-[#b51b1b]" aria-hidden="true">*</span>
          </div>

          <p class="text-sm leading-normal text-grey-darker">
            {{ t('seller.registration.form.pickupHelper') }}
          </p>
        </div>

        <button
          type="button"
          class="flex w-full items-center rounded-lg border border-grey-normal-hover bg-grey-normal p-3 text-start transition-colors hover:bg-grey-normal-hover"
          :aria-label="t('seller.registration.form.changeLocation')"
        >
          <span class="min-w-0 flex-1 overflow-hidden text-ellipsis text-base leading-[21px] text-black-normal">
            {{ t('seller.registration.form.defaults.location') }}
          </span>

          <span class="flex size-10 shrink-0 items-center justify-center">
            <img
              :class="arrowClass"
              class="size-5 transition-transform"
              :src="arrowIcon"
              alt=""
              aria-hidden="true"
            >
          </span>
        </button>
      </section>

      <label
        v-for="field in fields"
        :key="field.key"
        class="flex w-full flex-col gap-2"
      >
        <span class="flex w-full items-center gap-1 text-start">
          <span class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium leading-5 text-black-normal-hover">
            {{ t(field.labelKey) }}
          </span>
          <span v-if="field.required" class="text-sm leading-5 text-[#b51b1b]" aria-hidden="true">*</span>
          <span v-if="field.optional" class="text-xs font-light leading-4 text-black-lighter">
            {{ t('common.optional') }}
          </span>
        </span>

        <input
          v-model="form[field.key]"
          :autocomplete="field.autocomplete"
          :inputmode="field.inputmode"
          :required="field.required"
          :dir="field.dir"
          :placeholder="t(field.placeholderKey)"
          class="h-12 w-full rounded-lg border border-grey-normal-hover bg-white ps-4 pe-4 text-start text-sm leading-5 text-black-normal-hover outline-none transition-colors placeholder:text-grey-normal-active focus:border-blue-normal focus:ring-2 focus:ring-blue-light"
        >
      </label>

      <BaseButton
        type="submit"
        size="lg"
        full-width
        :disabled="!canSubmit"
        class="mt-0 h-12 rounded-lg! bg-blue-normal! text-base! font-semibold! text-grey-light! hover:bg-blue-normal-hover! active:bg-blue-normal-active!"
      >
        {{ t('seller.registration.form.submit') }}
      </BaseButton>
    </form>
  </AuthCenteredDialog>
</template>
