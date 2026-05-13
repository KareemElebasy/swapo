<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
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
        <NuxtLink
          :to="localePath('/seller')"
          :aria-label="t('nav.profile')"
          class="flex size-9 items-center justify-center overflow-hidden rounded-full border-2 border-green bg-surface"
        >
          <img
            v-if="authStore.user?.image"
            :src="authStore.user.image"
            :alt="authStore.user.full_name"
            class="size-full object-cover"
          />
          <svg
            v-else
            class="size-5 text-navy"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z" />
          </svg>
        </NuxtLink>
      </template>
    </SharedNavigationAppHeader>

    <main class="flex-1">
      <slot />
    </main>

    <SharedNavigationAppFooter />
  </div>
</template>
