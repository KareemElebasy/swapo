<script setup lang="ts">
import arrowIcon from '~/assets/images/auth/seller/arrow-left.svg'
import closeIcon from '~/assets/images/auth/seller/close-form.svg'

type FieldKey = 'storeName' | 'nationalId' | 'bankName' | 'iban'

interface SellerRegistrationField {
  key: FieldKey
  labelKey: string
  required?: boolean
  optional?: boolean
  autocomplete: string
  inputmode?: 'text' | 'numeric'
  dir: 'auto' | 'ltr'
}

const { locale, t } = useI18n()
const localePath = useLocalePath()

const form = reactive<Record<FieldKey, string>>({
  storeName: t('seller.registration.form.defaults.storeName'),
  nationalId: t('seller.registration.form.defaults.nationalId'),
  bankName: t('seller.registration.form.defaults.bankName'),
  iban: t('seller.registration.form.defaults.iban'),
})

const fields: SellerRegistrationField[] = [
  {
    key: 'storeName',
    labelKey: 'seller.registration.form.storeName',
    optional: true,
    autocomplete: 'organization',
    dir: 'auto',
  },
  {
    key: 'nationalId',
    labelKey: 'seller.registration.form.nationalId',
    optional: true,
    autocomplete: 'off',
    inputmode: 'numeric',
    dir: 'auto',
  },
  {
    key: 'bankName',
    labelKey: 'seller.registration.form.bankName',
    required: true,
    autocomplete: 'off',
    dir: 'auto',
  },
  {
    key: 'iban',
    labelKey: 'seller.registration.form.iban',
    required: true,
    autocomplete: 'off',
    inputmode: 'text',
    dir: 'auto',
  },
]

const arrowClass = computed(() => locale.value === 'ar' ? '' : 'rotate-180')

function submitRegistration() {
  // This screen currently mirrors the Figma confirmation state.
}
</script>

<template>
  <AuthCenteredDialog
    :title="t('seller.registration.title')"
    :close-label="t('common.close')"
    :close-to="localePath('/auth/lock')"
    :close-icon-src="closeIcon"
    body-class="overflow-y-auto px-4"
  >
    <form class="flex w-full flex-col gap-4" @submit.prevent="submitRegistration">
      <section class="flex w-full flex-col gap-2">
        <div class="flex w-full flex-col gap-0.5 text-end">
          <div class="flex w-full items-center justify-end gap-0.5 text-sm font-medium leading-5 text-black-normal-hover">
            <span>{{ t('seller.registration.form.pickupLocation') }}</span>
            <span class="text-[#b51b1b]" aria-hidden="true">*</span>
          </div>

          <p class="text-sm leading-normal text-grey-darker">
            {{ t('seller.registration.form.pickupHelper') }}
          </p>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-end rounded-md bg-grey-normal p-3 text-end transition-colors hover:bg-grey-normal-hover"
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
        <span class="flex w-full items-center justify-end gap-0.5 text-end">
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
          class="h-12 w-full rounded-md border-[0.5px] border-grey-normal-hover bg-white ps-4 pe-4 text-end text-sm leading-5 text-black-normal-hover outline-none transition-colors focus:border-blue-light-active"
        >
      </label>

      <BaseButton
        type="submit"
        size="lg"
        full-width
        class="mt-0 h-12 rounded-sm! bg-blue-normal! text-base! font-normal! text-grey-light! hover:bg-blue-normal-hover! active:bg-blue-normal-active!"
      >
        {{ t('seller.registration.form.submit') }}
      </BaseButton>
    </form>
  </AuthCenteredDialog>
</template>
