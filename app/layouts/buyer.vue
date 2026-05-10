<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader mode="buyer">
      <template #actions>
        <!-- Notifications -->
        <BaseIconButton
          :ariaLabel="t('nav.notifications')"
          variant="primary"
          size="sm"
        >
          <template #icon>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-green-normal">
              <path d="M9 2a5 5 0 015 5v2.5l1.5 2H2.5L4 9.5V7a5 5 0 015-5zM7 14a2 2 0 004 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </template>
        </BaseIconButton>

        <!-- Cart -->
        <BaseIconButton
          :ariaLabel="t('nav.cart')"
          :to="localePath('/buyer/cart')"
          variant="primary"
          size="sm"
        >
          <template #icon>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-green-normal">
              <path d="M2 2h1.5l2 9h8l2-6H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="8" cy="14.5" r="1" fill="currentColor" />
              <circle cx="13" cy="14.5" r="1" fill="currentColor" />
            </svg>
          </template>
        </BaseIconButton>

        <!-- Profile avatar -->
        <BaseIconButton
          :ariaLabel="t('nav.profile')"
          :to="localePath('/buyer')"
          variant="primary"
          size="sm"
        >
          <template #icon>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-green-normal">
              <circle cx="9" cy="6" r="3" stroke="currentColor" stroke-width="1.5" />
              <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </template>
        </BaseIconButton>
      </template>
    </AppHeader>

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
