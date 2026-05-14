<script setup lang="ts">
import BuyerCartDrawer from "~/components/buyer/cart/CartDrawer.vue";

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const { itemCount } = useDemoCart();

const cartDrawerOpen = ref(false);

const initials = computed(() => {
  const u = authStore.user;
  if (!u) return "";
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  return (f + l).toUpperCase() || (u.full_name?.[0]?.toUpperCase() ?? "");
});
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
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2a5 5 0 0 1 5 5v2.5l1.5 2H2.5L4 9.5V7a5 5 0 0 1 5-5ZM7 14a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2h1.5l2 9h8l2-6H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="8" cy="14.5" r="1" fill="currentColor"/>
                <circle cx="13" cy="14.5" r="1" fill="currentColor"/>
              </svg>
            </template>
          </BaseIconButton>
          <span
            v-if="itemCount > 0"
            class="absolute -inset-e-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-cyan px-1 text-[10px] font-bold leading-none text-blue-normal"
            :aria-label="t('cart.summary.totalProducts', { count: itemCount })"
          >{{ itemCount }}</span>
        </div>

        <!-- Search -->
        <BaseIconButton
          :ariaLabel="t('common.search')"
          variant="ghost"
          size="sm"
          class="text-black-normal! hover:bg-grey-normal!"
        >
          <template #icon>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 12 15.5 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
        </BaseIconButton>

        <!-- Favorites -->
        <BaseIconButton
          :ariaLabel="t('nav.favorites')"
          variant="ghost"
          size="sm"
          class="text-black-normal! hover:bg-grey-normal!"
          :to="localePath('/favorites')"
        >
          <template #icon>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 14.5S2.5 10.8 2.5 6.3A3.5 3.5 0 0 1 9 4.8a3.5 3.5 0 0 1 6.5 1.5C15.5 10.8 9 14.5 9 14.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>
        </BaseIconButton>

        <!-- Avatar -->
        <NuxtLink
          :to="localePath('/profile')"
          :aria-label="t('nav.profile')"
          class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-green bg-surface text-xs font-semibold text-navy"
        >
          <img
            v-if="authStore.user?.image"
            :src="authStore.user.image"
            :alt="authStore.user?.full_name"
            class="size-full object-cover"
          />
          <span v-else>{{ initials }}</span>
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
