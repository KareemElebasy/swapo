<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'seller'],
})

type SellerSection =
  | 'orders'
  | 'purchases'
  | 'addresses'
  | 'wallet'
  | 'drafts'
  | 'subscriptions'
  | 'auto-replies'
  | 'business-location'
  | 'settings'
  | 'about'
  | 'policy'
  | 'support'

interface SectionMeta {
  titleKey: string
  descriptionKey: string
}

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const authStore = useAuthStore()
const { t } = useI18n()

const sections: Record<SellerSection, SectionMeta> = {
  orders: {
    titleKey: 'profile.nav.incomingOrders',
    descriptionKey: 'profile.sellerTabPages.descriptions.orders',
  },
  purchases: {
    titleKey: 'profile.nav.purchases',
    descriptionKey: 'profile.sellerTabPages.descriptions.purchases',
  },
  addresses: {
    titleKey: 'profile.nav.addresses',
    descriptionKey: 'profile.sellerTabPages.descriptions.addresses',
  },
  wallet: {
    titleKey: 'profile.nav.wallet',
    descriptionKey: 'profile.sellerTabPages.descriptions.wallet',
  },
  drafts: {
    titleKey: 'profile.nav.drafts',
    descriptionKey: 'profile.sellerTabPages.descriptions.drafts',
  },
  subscriptions: {
    titleKey: 'profile.nav.subscriptions',
    descriptionKey: 'profile.sellerTabPages.descriptions.subscriptions',
  },
  'auto-replies': {
    titleKey: 'profile.nav.autoReplies',
    descriptionKey: 'profile.sellerTabPages.descriptions.autoReplies',
  },
  'business-location': {
    titleKey: 'profile.nav.businessLocation',
    descriptionKey: 'profile.sellerTabPages.descriptions.businessLocation',
  },
  settings: {
    titleKey: 'profile.nav.settings',
    descriptionKey: 'profile.sellerTabPages.descriptions.settings',
  },
  about: {
    titleKey: 'profile.nav.about',
    descriptionKey: 'profile.sellerTabPages.descriptions.about',
  },
  policy: {
    titleKey: 'profile.nav.policy',
    descriptionKey: 'profile.sellerTabPages.descriptions.policy',
  },
  support: {
    titleKey: 'profile.nav.support',
    descriptionKey: 'profile.sellerTabPages.descriptions.support',
  },
}

const currentSection = computed(() => {
  const key = String(route.params.section ?? '') as SellerSection
  return sections[key] ?? sections.orders
})

const currentTitle = computed(() => t(currentSection.value.titleKey))

useHead(() => ({
  title: `Swapo | ${currentTitle.value}`,
}))

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}
</script>

<template>
  <SharedProfileShell role="seller" @logout="handleLogout">
    <section class="rounded-sm border border-blue-light bg-white p-6">
      <h2 class="text-xl font-bold text-black-normal">
        {{ currentTitle }}
      </h2>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-grey-darker">
        {{ t(currentSection.descriptionKey) }}
      </p>
    </section>
  </SharedProfileShell>
</template>
