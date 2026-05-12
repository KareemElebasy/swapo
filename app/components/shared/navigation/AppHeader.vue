<script setup lang="ts">
type HeaderMode = 'public' | 'buyer' | 'seller'
type SearchVariant = 'icon' | 'bar' | 'none'

interface HeaderNavItem {
  label: string
  to: string
  children?: boolean
}

interface Props {
  mode?: HeaderMode
  navItems?: HeaderNavItem[]
  showPromo?: boolean
  promoText?: string
  promoTo?: string
  showSearch?: boolean
  searchVariant?: SearchVariant
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'public',
  navItems: undefined,
  showPromo: true,
  promoText: undefined,
  promoTo: '/seller/register',
  showSearch: undefined,
  searchVariant: 'icon',
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const mobileSearchOpen = ref(false)

const defaultNavItems = computed<HeaderNavItem[]>(() => {
  if (props.mode === 'seller') {
    return [
      { label: t('nav.sellerHome'), to: '/seller' },
      { label: t('nav.products'), to: '/seller/products' },
      { label: t('nav.orders'), to: '/seller/orders' },
      { label: t('nav.negotiations'), to: '/seller/negotiations' },
    ]
  }

  return [
    { label: t('common.home'), to: '/' },
    { label: t('nav.negotiations'), to: '/negotiations' },
    { label: t('nav.shop'), to: '/products', children: true },
  ]
})

const navItems = computed(() => props.navItems ?? defaultNavItems.value)
const shouldShowSearch = computed(() => props.showSearch ?? props.mode !== 'seller')
const promoLabel = computed(() => props.promoText ?? t('nav.sellerPromo'))

function isActive(to: string) {
  const localized = localePath(to)
  return route.path === localized || (to !== '/' && route.path.startsWith(`${localized}/`))
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-black/5 bg-white">
    <NuxtLink
      v-if="showPromo"
      :to="localePath(promoTo)"
      class="flex min-h-10 items-center justify-center overflow-hidden bg-blue-normal px-4 py-2 text-center text-sm font-medium text-brand-cyan transition-colors hover:bg-blue-normal-hover"
    >
      <span class="inline-flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="rtl:rotate-180"
          aria-hidden="true"
        >
          <path d="M8.75 3.5 5.25 7l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ promoLabel }}</span>
      </span>
    </NuxtLink>

    <div class="container-app">
      <div class="flex min-h-[72px] items-center justify-between gap-4 py-3">
        <div class="flex min-w-0 items-center gap-6">
          <NuxtLink :to="localePath('/')" class="shrink-0" :aria-label="t('common.brandName')">
            <img
              src="/images/auth/login/swapo-logo-header.svg"
              :alt="t('common.logoAlt')"
              class="h-[29px] w-[85px]"
            >
          </NuxtLink>

          <nav class="hidden items-center gap-4 lg:flex" :aria-label="t('nav.primary')">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="localePath(item.to)"
              :class="[
                'inline-flex h-10 items-center gap-1 border-b px-2 text-base font-medium transition-colors',
                isActive(item.to)
                  ? 'border-brand-cyan text-black-normal'
                  : 'border-transparent text-black-normal hover:border-blue-light-active hover:text-blue-normal',
              ]"
            >
              <svg
                v-if="item.children"
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M3.25 5 6.5 8.25 9.75 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>

        <div class="flex min-w-0 flex-1 items-center justify-end gap-2">
          <div
            v-if="shouldShowSearch && searchVariant === 'bar'"
            class="hidden w-full max-w-[420px] md:block"
          >
            <BaseSearchBar v-model="searchQuery" :placeholder="t('common.search')" />
          </div>

          <BaseIconButton
            v-if="shouldShowSearch && searchVariant === 'icon'"
            :ariaLabel="t('common.search')"
            variant="ghost"
            size="md"
            class="hidden text-black-normal! hover:bg-grey-normal! md:inline-flex"
            @click="mobileSearchOpen = !mobileSearchOpen"
          >
            <template #icon>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.5" />
                <path d="M13.25 13.25 16.5 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </template>
          </BaseIconButton>

          <SharedI18nLanguageToggle variant="compact" />

          <div class="hidden items-center gap-2 sm:flex">
            <slot name="actions" />
          </div>

          <button
            class="inline-flex size-10 items-center justify-center rounded-sm text-blue-normal transition-colors hover:bg-grey-normal lg:hidden"
            type="button"
            :aria-label="mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
            :aria-expanded="mobileMenuOpen"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                v-if="!mobileMenuOpen"
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                v-else
                d="M5 5l10 10M15 5 5 15"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="$slots.categoryNav" class="border-t border-grey-normal py-2">
        <slot name="categoryNav" />
      </div>

      <div
        v-if="shouldShowSearch && (mobileSearchOpen || searchVariant === 'bar')"
        class="pb-3 md:hidden"
      >
        <BaseSearchBar v-model="searchQuery" :placeholder="t('common.search')" />
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="border-t border-grey-normal bg-white lg:hidden">
      <div class="container-app flex flex-col gap-1 py-3">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="localePath(item.to)"
          :class="[
            'rounded-sm px-3 py-2 text-base font-medium transition-colors',
            isActive(item.to) ? 'bg-brand-cyan-light text-blue-normal' : 'text-black-normal hover:bg-grey-normal',
          ]"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </NuxtLink>

        <div class="mt-2 flex flex-col gap-2 sm:hidden">
          <slot name="actions" />
        </div>

        <slot name="mobile-menu" />
      </div>
    </div>
  </header>
</template>
