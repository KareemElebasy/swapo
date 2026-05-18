<script setup lang="ts">
import type { ProductFilters, ApiProductListItem } from "~/types/api-product";
import type { Product } from "~/types/product";

definePageMeta({ layout: "public" });

interface ApiCategory {
  id: number;
  title: string;
  image: string;
}

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const productStore = useProductStore();
const cartStore = useCartStore();

useHead({ title: t("catalog.meta.productsTitle") });

// ── Filters state ─────────────────────────────────────────────────────────
const conditionFilter = ref<"" | "new" | "used">("");
const adTypeFilter = ref<"" | "direct" | "negotiation">("");
const priceFrom = ref<number | undefined>(undefined);
const priceTo = ref<number | undefined>(undefined);
const categoryId = ref<number | undefined>(undefined);
const sort = ref<ProductFilters["sort"]>("recent");
const rateFilter = ref<number | undefined>(undefined);
const filterOpen = ref(false);

// Categories for the filter panel
const { data: categoriesData } = await useApi<{ data: ApiCategory[] }>(
  "list/categories",
  {
    useGeneral: true,
  },
);
const categories = computed(() => categoriesData.value?.data ?? []);

// Build query params from filter state
const queryParams = computed<ProductFilters>(() => ({
  ...(conditionFilter.value ? { type: conditionFilter.value } : {}),
  ...(adTypeFilter.value ? { ad_type: adTypeFilter.value } : {}),
  ...(priceFrom.value !== undefined ? { price_from: priceFrom.value } : {}),
  ...(priceTo.value !== undefined ? { price_to: priceTo.value } : {}),
  ...(categoryId.value !== undefined ? { category_id: categoryId.value } : {}),
  ...(sort.value ? { sort: sort.value } : {}),
  ...(rateFilter.value !== undefined ? { rate: rateFilter.value } : {}),
}));

const hasActiveFilters = computed(
  () =>
    !!conditionFilter.value ||
    !!adTypeFilter.value ||
    priceFrom.value !== undefined ||
    priceTo.value !== undefined ||
    categoryId.value !== undefined ||
    rateFilter.value !== undefined,
);

// ── Initial fetch ─────────────────────────────────────────────────────────
await productStore.fetchProducts(queryParams.value);

// ── Watchers ─────────────────────────────────────────────────────────────
watch(
  queryParams,
  (params) => {
    productStore.fetchProducts(params);
  },
  { deep: true },
);

// ── Pagination ────────────────────────────────────────────────────────────
const currentPage = computed(() => productStore.pagination?.current_page ?? 1);
const lastPage = computed(() => productStore.pagination?.last_page ?? 1);

async function loadMore() {
  if (currentPage.value >= lastPage.value) return;
  await productStore.fetchProducts(
    { ...queryParams.value, page: currentPage.value + 1 },
    true,
  );
}

// ── Actions ───────────────────────────────────────────────────────────────
async function onFavorite(productId: number) {
  await productStore.toggleFavorite(productId);
}

async function onAddToCart(productId: number) {
  if (!!!authStore.token) {
    navigateTo(localePath("/auth/login"));
    return;
  }
  try {
    await cartStore.addToCart(productId, 1);
    cartStore.openCart();
  } catch {
    // error handled by store
  }
}

function onNegotiate(productId: number) {
  if (!!!authStore.token) {
    navigateTo(localePath("/auth/login"));
    return;
  }
  navigateTo(localePath(`/products/${productId}`));
}

function resetFilters() {
  conditionFilter.value = "";
  adTypeFilter.value = "";
  priceFrom.value = undefined;
  priceTo.value = undefined;
  categoryId.value = undefined;
  rateFilter.value = undefined;
  sort.value = "recent";
}

const sortOptions: { value: ProductFilters["sort"]; label: string }[] = [
  { value: "recent", label: t("catalog.sort.newest") },
  { value: "highest_price", label: t("catalog.sort.priceDesc") },
  { value: "lowest_price", label: t("catalog.sort.priceAsc") },
  { value: "highest_rate", label: t("catalog.sort.topRated") },
  { value: "most_ordered", label: t("catalog.sort.recommended") },
];

const skeletonCards = Array.from({ length: 8 }, (_, i) => i);

function toProduct(api: ApiProductListItem): Product {
  return {
    id: String(api.id),
    title: api.product_name,
    price: { amount: api.price, currency: "SAR" },
    priceType: api.ad_type === "direct" ? "fixed" : "negotiable",
    categoryId: "",
    sellerId: String(api.seller_data.id),
    media: api.cover
      ? [{ id: "0", type: "image", url: api.cover, isCover: true }]
      : [],
  };
}

const pairedProducts = computed(() =>
  productStore.products.map((api) => ({ api, adapted: toProduct(api) })),
);

const cartProductIds = computed<Set<number>>(() => {
  if (!cartStore.cart) return new Set();
  const ids = new Set<number>();
  for (const seller of cartStore.cart.sellers) {
    for (const item of seller.items) {
      ids.add(item.product_data.id);
    }
  }
  return ids;
});
</script>

<template>
  <main class="min-h-screen bg-grey-normal pb-12">
    <!-- Header -->
    <section class="border-b border-grey-normal-hover bg-white">
      <div class="container-app py-5">
        <p
          class="text-xs font-medium uppercase tracking-wide text-grey-dark-active"
        >
          {{ t("catalog.eyebrow") }}
        </p>
        <h1 class="mt-1 text-2xl font-bold text-black-normal">
          {{ t("catalog.page.title") }}
        </h1>
        <p class="mt-1 text-sm text-grey-darker">
          {{ t("catalog.page.description") }}
        </p>
      </div>
    </section>

    <div class="container-app mt-6">
      <div class="flex gap-6 lg:items-start">
        <!-- ─── Sidebar filter (desktop) ─────────────────────────────── -->
        <aside class="hidden w-64 shrink-0 lg:block">
          <div class="rounded-xl bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-semibold text-black-normal">
                {{ t("filters.title") }}
              </h2>
              <button
                v-if="hasActiveFilters"
                type="button"
                class="text-xs text-blue-normal underline underline-offset-2"
                @click="resetFilters"
              >
                {{ t("filters.reset") }}
              </button>
            </div>

            <!-- Condition -->
            <div class="mb-5">
              <p class="mb-2 text-sm font-medium text-black-normal">
                {{ t("catalog.filters.condition") }}
              </p>
              <div class="flex gap-2">
                <button
                  v-for="opt in [
                    { value: '', label: t('catalog.filters.all') },
                    { value: 'new', label: t('product.condition.new') },
                    { value: 'used', label: t('product.condition.used') },
                  ]"
                  :key="opt.value"
                  type="button"
                  class="rounded-lg border px-3 py-1 text-xs transition-colors"
                  :class="
                    conditionFilter === opt.value
                      ? 'border-blue-normal bg-blue-normal text-white'
                      : 'border-grey-normal-hover text-grey-darker hover:border-blue-normal'
                  "
                  @click="conditionFilter = opt.value as '' | 'new' | 'used'"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- Ad type -->
            <div class="mb-5">
              <p class="mb-2 text-sm font-medium text-black-normal">
                {{ t("catalog.filters.tradeState") }}
              </p>
              <div class="flex gap-2">
                <button
                  v-for="opt in [
                    { value: '', label: t('catalog.filters.all') },
                    { value: 'direct', label: t('catalog.filters.buyNow') },
                    {
                      value: 'negotiation',
                      label: t('catalog.filters.negotiate'),
                    },
                  ]"
                  :key="opt.value"
                  type="button"
                  class="rounded-lg border px-3 py-1 text-xs transition-colors"
                  :class="
                    adTypeFilter === opt.value
                      ? 'border-blue-normal bg-blue-normal text-white'
                      : 'border-grey-normal-hover text-grey-darker hover:border-blue-normal'
                  "
                  @click="
                    adTypeFilter = opt.value as '' | 'direct' | 'negotiation'
                  "
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- Categories -->
            <div v-if="categories.length" class="mb-5">
              <p class="mb-2 text-sm font-medium text-black-normal">
                {{ t("productDetail.info.category") }}
              </p>
              <div class="flex flex-col gap-1">
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-start text-sm transition-colors"
                  :class="
                    categoryId === undefined
                      ? 'bg-blue-light font-medium text-blue-normal'
                      : 'text-grey-darker hover:bg-grey-normal'
                  "
                  @click="categoryId = undefined"
                >
                  {{ t("catalog.filters.all") }}
                </button>
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-start text-sm transition-colors"
                  :class="
                    categoryId === cat.id
                      ? 'bg-blue-light font-medium text-blue-normal'
                      : 'text-grey-darker hover:bg-grey-normal'
                  "
                  @click="categoryId = cat.id"
                >
                  {{ cat.title }}
                </button>
              </div>
            </div>

            <!-- Price range -->
            <div class="mb-5">
              <p class="mb-2 text-sm font-medium text-black-normal">
                {{ t("catalog.filters.price") }}
              </p>
              <div class="flex gap-2">
                <BaseInput
                  v-model="priceFrom"
                  type="number"
                  :placeholder="t('filters.min')"
                  dir="ltr"
                  class="flex-1"
                />
                <BaseInput
                  v-model="priceTo"
                  type="number"
                  :placeholder="t('filters.max')"
                  dir="ltr"
                  class="flex-1"
                />
              </div>
            </div>

            <!-- Rating -->
            <div class="mb-5">
              <p class="mb-2 text-sm font-medium text-black-normal">
                {{ t("catalog.filters.rating") }}
              </p>
              <div class="flex gap-2">
                <button
                  v-for="star in [5, 4, 3, 2, 1]"
                  :key="star"
                  type="button"
                  class="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors"
                  :class="
                    rateFilter === star
                      ? 'border-blue-normal bg-blue-normal text-white'
                      : 'border-grey-normal-hover text-grey-darker hover:border-blue-normal'
                  "
                  @click="rateFilter = rateFilter === star ? undefined : star"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.2l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z"
                    />
                  </svg>
                  {{ star }}+
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- ─── Main content ─────────────────────────────────────────── -->
        <div class="min-w-0 flex-1">
          <!-- Toolbar: sort + mobile filter button -->
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <!-- Mobile filter toggle -->
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg border border-grey-normal-hover bg-white px-3 py-2 text-sm text-black-normal transition-colors hover:border-blue-normal lg:hidden"
                @click="filterOpen = true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6h18M7 12h10M11 18h2"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                {{ t("catalog.actions.filters") }}
                <span
                  v-if="hasActiveFilters"
                  class="flex size-4 items-center justify-center rounded-full bg-blue-normal text-[10px] text-white"
                >
                  •
                </span>
              </button>

              <!-- Result count -->
              <p
                v-if="productStore.pagination"
                class="text-sm text-grey-darker"
              >
                {{
                  t("catalog.results.count", {
                    count: productStore.pagination.total,
                  })
                }}
              </p>
            </div>

            <!-- Sort -->
            <select
              v-model="sort"
              class="rounded-lg border border-grey-normal-hover bg-white px-3 py-2 text-sm text-black-normal focus:border-blue-normal focus:outline-none"
            >
              <option
                v-for="opt in sortOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Error state -->
          <div
            v-if="productStore.error && !productStore.loading"
            class="flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center"
          >
            <p class="font-medium text-black-normal">
              {{ t("catalog.error.title") }}
            </p>
            <p class="text-sm text-grey-darker">
              {{ t("catalog.error.message") }}
            </p>
            <BaseButton
              variant="secondary"
              size="sm"
              @click="productStore.fetchProducts(queryParams)"
            >
              {{ t("common.confirm") }}
            </BaseButton>
          </div>

          <!-- Products grid -->
          <div
            v-else
            class="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          >
            <!-- Loading skeletons -->
            <template
              v-if="productStore.loading && !productStore.products.length"
            >
              <SharedCatalogProductCard
                v-for="i in skeletonCards"
                :key="i"
                loading
              />
            </template>

            <!-- Product cards -->
            <SharedCatalogProductCard
              v-for="pair in pairedProducts"
              :key="pair.api.id"
              :product="pair.adapted"
              :favorite="pair.api.is_favorite"
              :condition-label="pair.api.status_trans"
              :listing-label="pair.api.ad_type_trans"
              show-seller
              :seller-name="
                pair.api.seller_data.store_name ||
                pair.api.seller_data.full_name
              "
              @favorite="(p) => productStore.toggleFavorite(Number(p.id))"
            >
              <template
                v-if="
                  !pair.api.is_mine && pair.api.availability_status !== 'sold'
                "
                #actions
              >
                <button
                  v-if="pair.api.ad_type === 'negotiation'"
                  type="button"
                  class="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-normal py-2 text-sm font-medium text-blue-normal transition-colors hover:bg-blue-light"
                  @click="onNegotiate(pair.api.id)"
                >
                  {{
                    pair.api.is_negotiating
                      ? t("productDetail.actions.viewNegotiation")
                      : t("product.negotiate")
                  }}
                </button>
                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-normal py-2 text-sm font-medium text-white transition-colors hover:bg-blue-normal-hover"
                  :class="
                    cartProductIds.has(pair.api.id)
                      ? 'bg-green-normal! hover:bg-green-normal-hover!'
                      : ''
                  "
                  @click="onAddToCart(pair.api.id)"
                >
                  {{
                    cartProductIds.has(pair.api.id)
                      ? t("productDetail.actions.inCart")
                      : t("product.addToCart")
                  }}
                </button>
              </template>
            </SharedCatalogProductCard>
          </div>

          <!-- Empty state -->
          <div
            v-if="
              !productStore.loading &&
              !productStore.error &&
              !productStore.products.length
            "
            class="flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center"
          >
            <p class="font-medium text-black-normal">
              {{
                hasActiveFilters
                  ? t("catalog.empty.filteredTitle")
                  : t("catalog.empty.title")
              }}
            </p>
            <p class="text-sm text-grey-darker">
              {{
                hasActiveFilters
                  ? t("catalog.empty.filteredMessage")
                  : t("catalog.empty.message")
              }}
            </p>
            <BaseButton
              v-if="hasActiveFilters"
              variant="secondary"
              size="sm"
              @click="resetFilters"
            >
              {{ t("catalog.actions.resetFilters") }}
            </BaseButton>
          </div>

          <!-- Load more -->
          <div
            v-if="!productStore.loading && currentPage < lastPage"
            class="mt-6 flex justify-center"
          >
            <BaseButton variant="secondary" @click="loadMore">
              {{ t("common.next") }}
            </BaseButton>
          </div>

          <!-- Loading more indicator -->
          <div
            v-if="productStore.loading && productStore.products.length"
            class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          >
            <SharedCatalogProductCard
              v-for="i in 4"
              :key="`more-${i}`"
              loading
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Mobile filter sheet ─────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="filterOpen"
          class="fixed inset-0 z-50 bg-black/40 lg:hidden"
          aria-hidden="true"
          @click="filterOpen = false"
        />
      </Transition>
      <Transition name="sheet">
        <aside
          v-if="filterOpen"
          class="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white p-5 lg:hidden"
          role="dialog"
          :aria-label="t('filters.title')"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-semibold text-black-normal">
              {{ t("filters.title") }}
            </h2>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-full text-grey-darker hover:bg-grey-normal"
              :aria-label="t('common.close')"
              @click="filterOpen = false"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Condition -->
          <div class="mb-5">
            <p class="mb-2 text-sm font-medium text-black-normal">
              {{ t("catalog.filters.condition") }}
            </p>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="opt in [
                  { value: '', label: t('catalog.filters.all') },
                  { value: 'new', label: t('product.condition.new') },
                  { value: 'used', label: t('product.condition.used') },
                ]"
                :key="opt.value"
                type="button"
                class="rounded-lg border px-4 py-2 text-sm transition-colors"
                :class="
                  conditionFilter === opt.value
                    ? 'border-blue-normal bg-blue-normal text-white'
                    : 'border-grey-normal-hover text-grey-darker'
                "
                @click="conditionFilter = opt.value as '' | 'new' | 'used'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Ad type -->
          <div class="mb-5">
            <p class="mb-2 text-sm font-medium text-black-normal">
              {{ t("catalog.filters.tradeState") }}
            </p>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="opt in [
                  { value: '', label: t('catalog.filters.all') },
                  { value: 'direct', label: t('catalog.filters.buyNow') },
                  {
                    value: 'negotiation',
                    label: t('catalog.filters.negotiate'),
                  },
                ]"
                :key="opt.value"
                type="button"
                class="rounded-lg border px-4 py-2 text-sm transition-colors"
                :class="
                  adTypeFilter === opt.value
                    ? 'border-blue-normal bg-blue-normal text-white'
                    : 'border-grey-normal-hover text-grey-darker'
                "
                @click="
                  adTypeFilter = opt.value as '' | 'direct' | 'negotiation'
                "
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Price -->
          <div class="mb-5">
            <p class="mb-2 text-sm font-medium text-black-normal">
              {{ t("catalog.filters.price") }}
            </p>
            <div class="flex gap-2">
              <BaseInput
                v-model="priceFrom"
                type="number"
                :placeholder="t('filters.min')"
                dir="ltr"
                class="flex-1"
              />
              <BaseInput
                v-model="priceTo"
                type="number"
                :placeholder="t('filters.max')"
                dir="ltr"
                class="flex-1"
              />
            </div>
          </div>

          <!-- Rating -->
          <div class="mb-5">
            <p class="mb-2 text-sm font-medium text-black-normal">
              {{ t("catalog.filters.rating") }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                type="button"
                class="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                :class="
                  rateFilter === star
                    ? 'border-blue-normal bg-blue-normal text-white'
                    : 'border-grey-normal-hover text-grey-darker'
                "
                @click="rateFilter = rateFilter === star ? undefined : star"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.2l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z"
                  />
                </svg>
                {{ star }}+
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <BaseButton
              variant="secondary"
              class="flex-1"
              @click="resetFilters"
            >
              {{ t("filters.reset") }}
            </BaseButton>
            <BaseButton
              variant="primary"
              class="flex-1"
              @click="filterOpen = false"
            >
              {{ t("filters.apply") }}
            </BaseButton>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Cart drawer -->
    <SharedCartDrawer />
  </main>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.3s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
