<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SharedNavigationAppHeader mode="seller">
      <template #actions>
        <!-- Post ad CTA -->
        <BaseButton
          variant="primary"
          size="sm"
          :to="localePath('/seller/products/new')"
          class="hidden bg-blue-normal! text-grey-light! hover:bg-blue-normal-hover! sm:inline-flex"
        >
          {{ t("nav.postAd") }}
        </BaseButton>

        <!-- Notifications -->
        <BaseIconButton
          :ariaLabel="t('nav.notifications')"
          variant="ghost"
          size="sm"
          class="text-black-normal! hover:bg-grey-normal!"
        >
          <template #icon>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 2a5 5 0 015 5v2.5l1.5 2H2.5L4 9.5V7a5 5 0 015-5zM7 14a2 2 0 004 0"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
        </BaseIconButton>

        <!-- Profile avatar -->
        <BaseIconButton
          :ariaLabel="t('nav.profile')"
          :to="localePath('/seller')"
          variant="ghost"
          size="sm"
          class="text-black-normal! hover:bg-grey-normal!"
        >
          <template #icon>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="9"
                cy="6"
                r="3"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </template>
        </BaseIconButton>
      </template>
    </SharedNavigationAppHeader>

    <main class="flex-1">
      <slot />
    </main>

    <SharedNavigationAppFooter />
  </div>
</template>
