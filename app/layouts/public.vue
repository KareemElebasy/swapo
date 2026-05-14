<script setup lang="ts">
import BuyerCartDrawer from "~/components/buyer/cart/CartDrawer.vue";

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const { itemCount } = useDemoCart();

const cartDrawerOpen = ref(false);

const isGuest = computed(() => !authStore.token);
const isSeller = computed(() => !!authStore.user?.is_seller);

const initials = computed(() => {
  const u = authStore.user;
  if (!u) return "";
  const f = u.first_name?.[0] ?? "";
  const l = u.last_name?.[0] ?? "";
  return (f + l).toUpperCase() || (u.full_name?.[0]?.toUpperCase() ?? "");
});

const profileTo = computed(() =>
  isSeller.value ? localePath("/seller/profile") : localePath("/profile"),
);

const extraNavItems = computed(() =>
  isSeller.value
    ? [{ label: t("nav.myAds"), to: "/seller/products", children: false }]
    : [],
);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SharedNavigationAppHeader mode="public" :extra-nav-items="extraNavItems">
      <template #actions>
        <!-- Seller: settings link -->
        <NuxtLink
          v-if="isSeller"
          :to="localePath('/seller/settings')"
          :aria-label="t('profile.nav.settings')"
          class="hidden items-center justify-center rounded-sm p-1.5 text-black-normal transition-colors hover:bg-grey-normal sm:inline-flex"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M9 11.25A2.25 2.25 0 1 0 9 6.75a2.25 2.25 0 0 0 0 4.5Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14.55 11.1a1.2 1.2 0 0 0 .24 1.32l.044.044a1.455 1.455 0 0 1-2.058 2.058l-.043-.044a1.2 1.2 0 0 0-1.32-.24 1.2 1.2 0 0 0-.727 1.097V15.5a1.455 1.455 0 1 1-2.91 0v-.058A1.2 1.2 0 0 0 7 14.35a1.2 1.2 0 0 0-1.32.24l-.044.044a1.455 1.455 0 0 1-2.058-2.058l.044-.043A1.2 1.2 0 0 0 3.862 11.1a1.2 1.2 0 0 0-1.097-.727H2.5a1.455 1.455 0 1 1 0-2.91h.058A1.2 1.2 0 0 0 3.65 6.7a1.2 1.2 0 0 0-.24-1.32l-.044-.044a1.455 1.455 0 0 1 2.058-2.058l.043.044A1.2 1.2 0 0 0 6.827 3.56h.046a1.2 1.2 0 0 0 .727-1.097V2.5a1.455 1.455 0 1 1 2.91 0v.058a1.2 1.2 0 0 0 .727 1.097 1.2 1.2 0 0 0 1.32-.24l.044-.044a1.455 1.455 0 0 1 2.058 2.058l-.044.043A1.2 1.2 0 0 0 14.374 6.8v.046a1.2 1.2 0 0 0 1.097.727H15.5a1.455 1.455 0 1 1 0 2.91h-.058a1.2 1.2 0 0 0-1.097.727h.005Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </NuxtLink>

        <!-- Seller: post-ad button -->
        <BaseButton
          v-if="isSeller"
          variant="primary"
          size="sm"
          :to="localePath('/seller/products/new')"
          class="hidden bg-blue-normal! text-grey-light! hover:bg-blue-normal-hover! sm:inline-flex"
        >
          <template #icon>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </template>
          {{ t("nav.postAd") }}
        </BaseButton>

        <!-- Notifications bell -->
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
            class="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-cyan px-1 text-[10px] font-bold leading-none text-blue-normal"
          >{{ itemCount }}</span>
        </div>

        <!-- Search icon -->
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

        <!-- Favorites / heart -->
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

        <!-- Avatar (authenticated) or login button -->
        <NuxtLink
          v-if="!isGuest"
          :to="profileTo"
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
        <BaseButton
          v-else
          variant="ghost"
          size="sm"
          :to="localePath('/auth/login')"
          class="border border-blue-light-active text-blue-normal! hover:bg-blue-light!"
        >
          {{ t("auth.login") }}
        </BaseButton>
      </template>
    </SharedNavigationAppHeader>

    <BuyerCartDrawer v-model:open="cartDrawerOpen" />

    <main class="flex-1">
      <slot />
    </main>

    <SharedNavigationAppFooter />
  </div>
</template>
