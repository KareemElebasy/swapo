<script setup lang="ts">
type ProfileRole = 'buyer' | 'seller'

interface ProfileNavItemConfig {
  to: string
  labelKey?: string
  label?: string
  icon?: string
  exact?: boolean
  badge?: string | number
}

interface ProfileNavSection {
  labelKey?: string
  label?: string
  items: ProfileNavItemConfig[]
}

interface Props {
  role: ProfileRole
  sections?: ProfileNavSection[]
  showLogout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sections: undefined,
  showLogout: true,
})

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()

const defaultSections: Record<ProfileRole, ProfileNavSection[]> = {
  buyer: [
    {
      items: [
        { to: '/orders', labelKey: 'profile.nav.orders', icon: 'orders' },
        { to: '/negotiations', labelKey: 'profile.nav.negotiations', icon: 'negotiations' },
        { to: '/favorites', labelKey: 'profile.nav.favorites', icon: 'favorites' },
        { to: '/profile', labelKey: 'profile.nav.profile', icon: 'user', exact: true },
        { to: '/profile/addresses', labelKey: 'profile.nav.addresses', icon: 'addresses' },
        { to: '/profile/phone', labelKey: 'profile.nav.phone', icon: 'phone' },
        { to: '/profile/policy', labelKey: 'profile.nav.policy', icon: 'policy' },
        { to: '/profile/support', labelKey: 'profile.nav.support', icon: 'support' },
      ],
    },
  ],
  seller: [
    {
      labelKey: 'profile.sections.account',
      items: [
        { to: '/seller/profile', labelKey: 'profile.nav.profile', icon: 'user', exact: true },
        { to: '/seller/orders', labelKey: 'profile.nav.incomingOrders', icon: 'orders' },
        { to: '/seller/negotiations', labelKey: 'profile.nav.negotiations', icon: 'negotiations' },
        { to: '/seller/products', labelKey: 'profile.nav.products', icon: 'products' },
        { to: '/seller/wallet', labelKey: 'profile.nav.wallet', icon: 'wallet' },
      ],
    },
    {
      labelKey: 'profile.sections.management',
      items: [
        { to: '/seller/drafts', labelKey: 'profile.nav.drafts', icon: 'drafts' },
        { to: '/seller/subscriptions', labelKey: 'profile.nav.subscriptions', icon: 'subscriptions' },
        { to: '/seller/auto-replies', labelKey: 'profile.nav.autoReplies', icon: 'autoReplies' },
        { to: '/seller/business-location', labelKey: 'profile.nav.businessLocation', icon: 'location' },
        { to: '/seller/data', labelKey: 'profile.nav.sellerData', icon: 'data' },
      ],
    },
  ],
}

const navSections = computed(() => props.sections ?? defaultSections[props.role])

function labelFor(item: ProfileNavItemConfig) {
  return item.label ?? (item.labelKey ? t(item.labelKey) : '')
}

function sectionLabel(section: ProfileNavSection) {
  return section.label ?? (section.labelKey ? t(section.labelKey) : '')
}
</script>

<template>
  <aside class="w-full max-w-[318px] shrink-0 rounded-sm bg-grey-light-active p-2">
    <nav class="flex flex-col gap-2" :aria-label="t('profile.navLabel')">
      <section
        v-for="(section, sectionIndex) in navSections"
        :key="section.labelKey ?? section.label ?? sectionIndex"
        :class="sectionIndex > 0 ? 'border-t border-blue-light pt-2' : ''"
      >
        <p
          v-if="sectionLabel(section)"
          class="px-4 pb-1 text-end text-xs font-medium leading-5 text-grey-dark-hover"
        >
          {{ sectionLabel(section) }}
        </p>

        <div class="flex flex-col">
          <ProfileNavItem
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :label="labelFor(item)"
            :exact="item.exact"
            :badge="item.badge"
          >
            <template #icon>
              <ProfileNavIcon :name="item.icon" />
            </template>
          </ProfileNavItem>
        </div>
      </section>

      <button
        v-if="showLogout"
        type="button"
        class="flex min-h-[50px] items-center justify-end gap-2 rounded-xs p-3 text-base text-black-normal transition-colors hover:bg-grey-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
        @click="emit('logout')"
      >
        <span class="min-w-0 flex-1 truncate text-end">{{ t('profile.nav.logout') }}</span>
        <span class="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
          <ProfileNavIcon name="logout" />
        </span>
      </button>
    </nav>
  </aside>
</template>
