<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F8F8_46%,#EEF7F5_100%)]">
    <header class="sticky top-0 z-30 w-full bg-white/95 backdrop-blur">
      <div
        class="mx-auto flex h-14 w-full max-w-[1512px] items-center justify-between border-b border-black/5 px-4 md:px-10"
      >
        <NuxtLink
          to="/"
          class="block h-5 w-[59px]"
          :aria-label="t('common.brandName')"
        >
          <img
            class="h-full w-full"
            src="/images/auth/login/swapo-logo-header.svg"
            :alt="t('common.logoAlt')"
          />
        </NuxtLink>

        <SharedI18nLanguageToggle variant="softPill" />
      </div>
    </header>

    <main
      class="flex min-h-[calc(100svh-56px)] items-center px-4 py-8 md:px-8 lg:py-10 xl:px-[100px]"
    >
      <slot />
    </main>
  </div>
</template>
