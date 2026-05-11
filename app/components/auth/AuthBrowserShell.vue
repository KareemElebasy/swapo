<script setup lang="ts">
const { t } = useI18n();

const menuItems = [
  "finder",
  "file",
  "edit",
  "view",
  "go",
  "window",
  "help",
] as const;
</script>

<template>
  <div class="min-h-screen bg-grey-light-active">
    <header class="sticky top-0 z-30 w-full bg-white">
      <div
        class="flex h-14 items-center justify-between border-b border-black/5 px-4 md:px-10"
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
      class="flex min-h-[calc(100vh-136px)] items-center px-4 py-2 md:px-8 xl:px-[100px]"
    >
      <slot />
    </main>
  </div>
</template>
