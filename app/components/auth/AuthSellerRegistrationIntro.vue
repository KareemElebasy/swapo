<script setup lang="ts">
import closeIcon from '~/assets/images/auth/seller/close-intro.svg'
import registerIntroIllustration from '~/assets/images/auth/seller/register-intro.svg'

interface IntroChip {
  key: string
  labelKey: string
  iconKey: string
  classes: string
  iconClasses?: string
}

const { t } = useI18n()
const localePath = useLocalePath()

const benefitKeys = [
  'seller.registrationIntro.benefits.uploadProducts',
  'seller.registrationIntro.benefits.directContact',
  'seller.registrationIntro.benefits.manageSales',
  'seller.registrationIntro.benefits.highlightProduct',
] as const

const chips: IntroChip[] = [
  {
    key: 'commission',
    labelKey: 'seller.registrationIntro.chips.lowCommission',
    iconKey: 'seller.registrationIntro.chips.lowCommissionIcon',
    classes: 'end-[calc(50%+46px)] top-[32px] -rotate-[15deg] bg-[#c4c4c4] text-[#222]',
    iconClasses: 'text-white rotate-[15deg]',
  },
  {
    key: 'buyers',
    labelKey: 'seller.registrationIntro.chips.moreBuyers',
    iconKey: 'seller.registrationIntro.chips.moreBuyersIcon',
    classes: 'start-[calc(50%+48px)] top-[4px] rotate-[11.35deg] bg-[#ffc9c9] text-[#2a2a2a]',
  },
  {
    key: 'easy',
    labelKey: 'seller.registrationIntro.chips.easy',
    iconKey: 'seller.registrationIntro.chips.easyIcon',
    classes: 'start-[calc(50%+62px)] top-[56px] -rotate-[12.22deg] bg-[#ffecc9] text-[#725100]',
  },
  {
    key: 'fast',
    labelKey: 'seller.registrationIntro.chips.fastUpload',
    iconKey: 'seller.registrationIntro.chips.fastUploadIcon',
    classes: 'start-[calc(50%+54px)] top-[102px] rotate-[15deg] bg-[#c9ffda] text-[#004e39]',
  },
  {
    key: 'pricing',
    labelKey: 'seller.registrationIntro.chips.yourPrices',
    iconKey: 'seller.registrationIntro.chips.yourPricesIcon',
    classes: 'end-[calc(50%+40px)] top-[94px] bg-black text-white',
  },
]
</script>

<template>
  <AuthCenteredDialog
    :title="t('seller.registrationIntro.title')"
    :close-label="t('common.close')"
    :close-to="localePath('/')"
    :close-icon-src="closeIcon"
    body-class="px-5"
  >
    <div class="relative flex w-full flex-col items-center justify-center gap-5">
      <p class="w-full text-start text-sm leading-6 text-grey-darker">
        {{ t('seller.registrationIntro.subtitle') }}
      </p>

      <div class="relative h-[172px] w-full max-w-[390px] shrink-0 overflow-visible">
        <div class="absolute inset-0 flex items-center justify-center">
          <img
            class="h-[144px] w-[106px]"
            :src="registerIntroIllustration"
            :alt="t('seller.registrationIntro.illustrationAlt')"
          >
        </div>

        <span
          v-for="chip in chips"
          :key="chip.key"
          :class="[
            'absolute inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium leading-normal shadow-sm',
            chip.classes,
          ]"
        >
          <span>{{ t(chip.labelKey) }}</span>
          <span :class="chip.iconClasses" aria-hidden="true">
            {{ t(chip.iconKey) }}
          </span>
        </span>
      </div>

      <div class="flex w-full flex-col justify-center rounded-lg border border-[#D8F1FA] bg-[#EBF9FE] px-4 py-3 text-start text-sm">
        <p class="leading-6 text-black-normal-hover">
          {{ t('seller.registrationIntro.description') }}
        </p>

        <ul class="mt-2 flex flex-col gap-1 leading-6 text-black-normal">
          <li v-for="key in benefitKeys" :key="key">
            {{ t(key) }}
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <BaseButton
        :to="localePath('/auth/seller-registration')"
        size="lg"
        full-width
        class="h-12 rounded-lg! bg-blue-normal! text-base! font-semibold! text-grey-light! hover:bg-blue-normal-hover! active:bg-blue-normal-active!"
      >
        {{ t('seller.registrationIntro.action') }}
      </BaseButton>
    </template>
  </AuthCenteredDialog>
</template>
