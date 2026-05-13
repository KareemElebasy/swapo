<script setup lang="ts">
import BuyerCartDrawer from "~/components/buyer/cart/CartDrawer.vue";

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const { itemCount } = useDemoCart();

const cartDrawerOpen = ref(false);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SharedNavigationAppHeader mode="buyer">
      <template #actions>
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

        <!-- Cart -->
        <div class="relative inline-flex">
          <BaseIconButton
            :ariaLabel="t('cart.actions.openCart')"
            variant="ghost"
            size="sm"
            class="text-black-normal! hover:bg-grey-normal!"
            @click="cartDrawerOpen = true"
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
                  d="M2 2h1.5l2 9h8l2-6H5.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="8" cy="14.5" r="1" fill="currentColor" />
                <circle cx="13" cy="14.5" r="1" fill="currentColor" />
              </svg>
            </template>
          </BaseIconButton>
          <span
            v-if="itemCount > 0"
            class="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-cyan px-1 text-[10px] font-bold leading-none text-blue-normal"
            :aria-label="t('cart.summary.totalProducts', { count: itemCount })"
          >
            {{ itemCount }}
          </span>
        </div>

        <!-- Profile avatar -->
        <NuxtLink
          :to="localePath('/profile')"
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

    <BuyerCartDrawer v-model:open="cartDrawerOpen" />

    <main class="flex-1">
      <slot />
    </main>

    <SharedNavigationAppFooter />
  </div>
</template>
