<script setup lang="ts">
import { useApi } from "~/composables/useApi";

type HeaderMode = "public" | "buyer" | "seller";
type SearchVariant = "icon" | "bar" | "none";

interface HeaderNavItem {
  label: string;
  to: string;
  children?: boolean;
}

interface Category {
  id: number;
  title: string;
  image: string;
}

interface Props {
  mode?: HeaderMode;
  navItems?: HeaderNavItem[];
  extraNavItems?: HeaderNavItem[];
  showPromo?: boolean;
  promoText?: string;
  promoTo?: string;
  showSearch?: boolean;
  searchVariant?: SearchVariant;
}

const props = withDefaults(defineProps<Props>(), {
  mode: "public",
  navItems: undefined,
  extraNavItems: undefined,
  showPromo: true,
  promoText: undefined,
  promoTo: "/seller/register",
  showSearch: undefined,
  searchVariant: "icon",
});

const { t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const authStore = useAuthStore();

const searchQuery = ref("");
const mobileMenuOpen = ref(false);
const mobileSearchOpen = ref(false);
const shopDropdownOpen = ref(false);
const mobileShopExpanded = ref(false);
let shopCloseTimer: ReturnType<typeof setTimeout> | null = null;

const showCategories = computed(() => props.mode !== "seller");

const { data: categoriesRes } = useApi<{ data: Category[] }>(
  "list/categories",
  {
    useGeneral: true,
  },
);
const categories = computed<Category[]>(() => categoriesRes.value?.data ?? []);

const defaultNavItems = computed<HeaderNavItem[]>(() => {
  if (props.mode === "seller") {
    return [
      { label: t("nav.sellerHome"), to: "/seller" },
      { label: t("nav.products"), to: "/seller/products" },
      { label: t("nav.orders"), to: "/seller/orders" },
      { label: t("nav.negotiations"), to: "/seller/negotiations" },
    ];
  }

  return [
    { label: t("common.home"), to: "/" },
    { label: t("nav.negotiations"), to: "/negotiations" },
    { label: t("nav.shop"), to: "/products", children: true },
  ];
});

const navItems = computed(() => {
  const base = props.navItems ?? defaultNavItems.value;
  return props.extraNavItems?.length ? [...base, ...props.extraNavItems] : base;
});

const shouldShowSearch = computed(
  () => props.showSearch ?? props.mode !== "seller",
);
const promoLabel = computed(() => props.promoText ?? t("nav.sellerPromo"));

function isActive(to: string) {
  const localized = localePath(to);
  return (
    route.path === localized ||
    (to !== "/" && route.path.startsWith(`${localized}/`))
  );
}

function openShopDropdown() {
  if (shopCloseTimer) {
    clearTimeout(shopCloseTimer);
    shopCloseTimer = null;
  }
  shopDropdownOpen.value = true;
}

function scheduleCloseShopDropdown() {
  shopCloseTimer = setTimeout(() => {
    shopDropdownOpen.value = false;
  }, 120);
}

watch(mobileMenuOpen, (open) => {
  if (!open) mobileShopExpanded.value = false;
});
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-black/5 bg-white">
    <!-- Promo Banner -->
    <NuxtLink
      v-if="showPromo && !authStore.user?.is_seller"
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
          <path
            d="M8.75 3.5 5.25 7l3.5 3.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ promoLabel }}</span>
      </span>
    </NuxtLink>

    <div class="container-app">
      <!-- Main Row -->
      <div class="flex min-h-18 items-center justify-between gap-4 py-3">
        <div class="flex min-w-0 items-center gap-6">
          <NuxtLink
            :to="localePath('/')"
            class="shrink-0"
            :aria-label="t('common.brandName')"
          >
            <img
              src="/images/auth/login/swapo-logo-header.svg"
              :alt="t('common.logoAlt')"
              class="h-7.25 w-21.25"
            />
          </NuxtLink>

          <nav
            class="hidden items-center gap-4 lg:flex"
            :aria-label="t('nav.primary')"
          >
            <template v-for="item in navItems" :key="item.to">
              <!-- Shop nav item with hover dropdown -->
              <div
                v-if="item.children"
                class="relative"
                @mouseenter="openShopDropdown"
                @mouseleave="scheduleCloseShopDropdown"
              >
                <NuxtLink
                  :to="localePath(item.to)"
                  :class="[
                    'inline-flex h-10 items-center gap-1 border-b px-2 text-base font-medium transition-colors',
                    isActive(item.to)
                      ? 'border-brand-cyan text-black-normal'
                      : 'border-transparent text-black-normal hover:border-blue-light-active hover:text-blue-normal',
                  ]"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    :class="[
                      'transition-transform duration-200',
                      shopDropdownOpen ? 'rotate-180' : '',
                    ]"
                  >
                    <path
                      d="M3.25 5 6.5 8.25 9.75 5"
                      stroke="currentColor"
                      stroke-width="1.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </div>

              <!-- Regular nav item -->
              <NuxtLink
                v-else
                :to="localePath(item.to)"
                :class="[
                  'inline-flex h-10 items-center gap-1 border-b px-2 text-base font-medium transition-colors',
                  isActive(item.to)
                    ? 'border-brand-cyan text-black-normal'
                    : 'border-transparent text-black-normal hover:border-blue-light-active hover:text-blue-normal',
                ]"
              >
                <span>{{ item.label }}</span>
              </NuxtLink>
            </template>
          </nav>
        </div>

        <div class="flex min-w-0 flex-1 items-center justify-end gap-2">
          <div
            v-if="shouldShowSearch && searchVariant === 'bar'"
            class="hidden w-full max-w-105 md:block"
          >
            <BaseSearchBar
              v-model="searchQuery"
              :placeholder="t('common.search')"
            />
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="5.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M13.25 13.25 16.5 16.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
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
            :aria-label="
              mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')
            "
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

      <!-- Category nav slot (backward compat) -->
      <div v-if="$slots.categoryNav" class="border-t border-grey-normal py-2">
        <slot name="categoryNav" />
      </div>

      <div
        v-if="shouldShowSearch && (mobileSearchOpen || searchVariant === 'bar')"
        class="pb-3 md:hidden"
      >
        <BaseSearchBar
          v-model="searchQuery"
          :placeholder="t('common.search')"
        />
      </div>
    </div>

    <!-- Shop Mega Dropdown (desktop hover) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="shopDropdownOpen && showCategories && categories.length"
        class="absolute inset-x-0 top-full z-40 hidden border-b border-grey-normal bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] lg:block"
        @mouseenter="openShopDropdown"
        @mouseleave="scheduleCloseShopDropdown"
      >
        <div class="container-app py-5">
          <div class="grid grid-cols-5 gap-3 xl:grid-cols-7">
            <NuxtLink
              v-for="cat in categories"
              :key="cat.id"
              :to="localePath(`/products?category=${cat.id}`)"
              class="group flex flex-col items-center gap-2 rounded-xl p-2.5 transition-colors hover:bg-surface"
              @click="shopDropdownOpen = false"
            >
              <div
                class="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-surface transition-colors group-hover:bg-grey-normal"
              >
                <img
                  :src="cat.image"
                  :alt="cat.title"
                  class="size-10 object-contain"
                  loading="lazy"
                />
              </div>
              <span
                class="line-clamp-1 text-center text-xs font-medium text-black-normal"
              >
                {{ cat.title }}
              </span>
            </NuxtLink>
          </div>

          <div class="mt-4 border-t border-grey-normal pt-3">
            <NuxtLink
              :to="localePath('/products')"
              class="inline-flex items-center gap-1 text-sm font-medium text-blue-normal transition-colors hover:text-blue-normal-hover"
              @click="shopDropdownOpen = false"
            >
              <span>{{ t("nav.allCategories") }}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                class="rtl:rotate-180"
              >
                <path
                  d="M5.25 3.5 8.75 7l-3.5 3.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Mobile Menu -->
    <div
      v-if="mobileMenuOpen"
      class="border-t border-grey-normal bg-white lg:hidden"
    >
      <div class="container-app flex flex-col gap-1 py-3">
        <template v-for="item in navItems" :key="item.to">
          <!-- Shop item: expandable categories -->
          <div v-if="item.children">
            <button
              type="button"
              :class="[
                'flex w-full items-center justify-between rounded-sm px-3 py-2 text-base font-medium transition-colors',
                isActive(item.to)
                  ? 'bg-brand-cyan-light text-blue-normal'
                  : 'text-black-normal hover:bg-grey-normal',
              ]"
              @click="mobileShopExpanded = !mobileShopExpanded"
            >
              <span>{{ item.label }}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                :class="[
                  'transition-transform duration-200',
                  mobileShopExpanded ? 'rotate-180' : '',
                ]"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="mobileShopExpanded && categories.length"
                class="px-2 pb-2 pt-1"
              >
                <div class="grid grid-cols-4 gap-1.5">
                  <NuxtLink
                    v-for="cat in categories"
                    :key="cat.id"
                    :to="localePath(`/products?category=${cat.id}`)"
                    class="flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors hover:bg-surface"
                    @click="
                      mobileMenuOpen = false;
                      mobileShopExpanded = false;
                    "
                  >
                    <div
                      class="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-surface"
                    >
                      <img
                        :src="cat.image"
                        :alt="cat.title"
                        class="size-8 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span
                      class="line-clamp-1 text-[11px] font-medium text-black-normal"
                    >
                      {{ cat.title }}
                    </span>
                  </NuxtLink>
                </div>

                <NuxtLink
                  :to="localePath('/products')"
                  class="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-blue-normal"
                  @click="mobileMenuOpen = false"
                >
                  {{ t("nav.allCategories") }}
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <!-- Regular nav item -->
          <NuxtLink
            v-else
            :to="localePath(item.to)"
            :class="[
              'rounded-sm px-3 py-2 text-base font-medium transition-colors',
              isActive(item.to)
                ? 'bg-brand-cyan-light text-blue-normal'
                : 'text-black-normal hover:bg-grey-normal',
            ]"
            @click="mobileMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </template>

        <div class="mt-2 flex flex-col gap-2 sm:hidden">
          <slot name="actions" />
        </div>

        <slot name="mobile-menu" />
      </div>
    </div>
  </header>
</template>
