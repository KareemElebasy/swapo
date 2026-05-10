<script setup lang="ts">
interface Props {
  role: 'buyer' | 'seller'
}

const props = defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()

interface NavItem {
  to: string
  labelKey: string
  exact?: boolean
}

const buyerNav: NavItem[] = [
  { to: '/buyer', labelKey: 'profile.nav.overview', exact: true },
  { to: '/buyer/orders', labelKey: 'profile.nav.orders' },
  { to: '/buyer/favorites', labelKey: 'profile.nav.favorites' },
  { to: '/buyer/addresses', labelKey: 'profile.nav.addresses' },
  { to: '/buyer/reviews', labelKey: 'profile.nav.reviews' },
  { to: '/buyer/settings', labelKey: 'profile.nav.settings' },
]

const sellerNav: NavItem[] = [
  { to: '/seller', labelKey: 'profile.nav.overview', exact: true },
  { to: '/seller/ads', labelKey: 'profile.nav.ads' },
  { to: '/seller/wallet', labelKey: 'profile.nav.wallet' },
  { to: '/seller/messages', labelKey: 'profile.nav.messages' },
  { to: '/seller/subscriptions', labelKey: 'profile.nav.subscriptions' },
  { to: '/seller/promotions', labelKey: 'profile.nav.promotions' },
  { to: '/seller/settings', labelKey: 'profile.nav.settings' },
]

const navItems = computed(() =>
  props.role === 'seller' ? sellerNav : buyerNav,
)
</script>

<template>
  <aside class="w-56 shrink-0">
    <nav class="flex flex-col gap-0.5">
      <ProfileNavItem
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :label="t(item.labelKey)"
        :exact="item.exact"
      >
        <template #icon>
          <slot :name="`icon-${item.to.split('/').pop()}`" />
        </template>
      </ProfileNavItem>

      <!-- Separator before logout -->
      <hr class="my-2 border-grey-normal-hover" />

      <button
        type="button"
        class="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-status-canceled-text hover:bg-status-canceled-bg transition-colors w-full text-start"
      >
        <span class="shrink-0 flex items-center justify-center size-5" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 16H3a1 1 0 01-1-1V3a1 1 0 011-1h4M12 13l4-4-4-4M16 9H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="rtl:[transform:scaleX(-1)] rtl:origin-center" />
          </svg>
        </span>
        {{ t('profile.nav.logout') }}
      </button>
    </nav>
  </aside>
</template>
