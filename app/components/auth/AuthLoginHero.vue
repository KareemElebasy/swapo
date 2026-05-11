<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="relative h-[770px] w-full max-w-[601px] shrink-0 overflow-hidden rounded-[48px] bg-[#001566] px-4 pb-[88px]">
    <div class="absolute inset-0" dir="ltr">
      <img
        class="pointer-events-none absolute top-[176px] start-[90px] h-[865px] w-[1223px] max-w-none"
        src="/images/auth/login/pattern-v.svg"
        alt=""
        aria-hidden="true"
      >
      <img
        class="pointer-events-none absolute top-[175px] start-[90px] h-[1223px] w-[868px] max-w-none -rotate-90 scale-y-[-1]"
        src="/images/auth/login/pattern-v-rotated.svg"
        alt=""
        aria-hidden="true"
      >

      <div class="absolute top-0 start-[14%] h-[532px] w-[576px] max-w-[96%]">
        <img
          class="pointer-events-none absolute top-[-63px] end-0 h-[423px] w-[281px] max-w-none rotate-[13deg] object-cover"
          src="/images/auth/login/pants-hanger.png"
          alt=""
          aria-hidden="true"
        >

        <img
          class="pointer-events-none absolute top-[445px] start-0 h-[52px] w-[78px] max-w-none rotate-[35deg] object-cover"
          src="/images/auth/login/sunglasses.png"
          alt=""
          aria-hidden="true"
        >

        <div class="absolute top-[149px] start-1/2 h-[337px] w-[245px] -translate-x-1/2 overflow-hidden rounded-xl border border-[#37C5F3] bg-gradient-to-b from-[rgba(150,242,252,0.4)] to-[rgba(89,144,150,0.4)]">
          <img
            class="pointer-events-none absolute bottom-[-1px] start-1/2 h-[321px] w-[481px] max-w-none -translate-x-1/2 object-cover mix-blend-hard-light"
            src="/images/auth/login/phone-person.png"
            :alt="t('auth.loginPage.hero.visualAlt')"
          >

          <img
            class="pointer-events-none absolute top-4 start-4 h-4 w-12"
            src="/images/auth/login/swapo-card-mark.svg"
            alt=""
            aria-hidden="true"
          >
        </div>
      </div>
    </div>

    <div class="relative z-10 flex h-full flex-col items-center justify-end gap-4 text-center">
      <h1 class="flex flex-wrap items-center justify-center gap-1 text-[34px] font-bold leading-10">
        <span class="text-white">{{ t('auth.loginPage.hero.titleStart') }}</span>
        <span class="text-[#37C5F3]">{{ t('auth.loginPage.hero.titleAccent') }}</span>
      </h1>

      <p class="w-full max-w-[327px] text-base font-light leading-[26px] text-grey-light-active">
        {{ t('auth.loginPage.hero.description') }}
      </p>
    </div>
  </section>
</template>
