<script setup lang="ts">
import type { ProductFilters, ApiProductListItem } from "~/types/api-product";
import type { Product } from "~/types/product";
import { apiFetch } from "~/composables/useApi";

definePageMeta({ layout: "public" });

interface ApiCategory {
  id: number;
  title: string;
  image: string;
}

interface ApiSubCategory {
  id: number;
  title: string;
}

const { t } = useI18n();
const productStore = useProductStore();

useHead({ title: t("catalog.meta.productsTitle") });

// ── Accordion state ────────────────────────────────────────────────────────
const openSections = ref({
  condition: true,
  price: true,
  rating: true,
  tradeState: true,
  categories: true,
});

function toggleSection(key: keyof typeof openSections.value) {
  openSections.value[key] = !openSections.value[key];
}

// ── Filters state ─────────────────────────────────────────────────────────
const conditionFilter = ref<"" | "new" | "used">("");
const adTypeFilter = ref<"" | "direct" | "negotiation">("");
const priceFrom = ref<number | undefined>(undefined);
const priceTo = ref<number | undefined>(undefined);
const categoryId = ref<number | undefined>(undefined);
const subCategoryId = ref<number | undefined>(undefined);
const sort = ref<ProductFilters["sort"]>("recent");
const rateFilter = ref<number | undefined>(undefined);
const filterOpen = ref(false);

// ── Categories ─────────────────────────────────────────────────────────────
const { data: categoriesData } = await useApi<{ data: ApiCategory[] }>(
  "list/categories",
  { useGeneral: true },
);
const categories = computed(() => categoriesData.value?.data ?? []);

// ── Sub-categories ─────────────────────────────────────────────────────────
const subCategories = ref<ApiSubCategory[]>([]);
const loadingSubCats = ref(false);

async function fetchSubCategories(catId: number) {
  loadingSubCats.value = true;
  try {
    const res = await apiFetch<{ data: ApiSubCategory[] }>(
      "list/sub-categories",
      { useGeneral: true, query: { category_id: catId } },
    );
    subCategories.value = res.data ?? [];
  } finally {
    loadingSubCats.value = false;
  }
}

watch(categoryId, (val) => {
  subCategoryId.value = undefined;
  subCategories.value = [];
  if (val !== undefined) fetchSubCategories(val);
});

// ── Query params ───────────────────────────────────────────────────────────
const queryParams = computed<ProductFilters>(() => ({
  ...(conditionFilter.value ? { type: conditionFilter.value } : {}),
  ...(adTypeFilter.value ? { ad_type: adTypeFilter.value } : {}),
  ...(priceFrom.value !== undefined ? { price_from: priceFrom.value } : {}),
  ...(priceTo.value !== undefined ? { price_to: priceTo.value } : {}),
  ...(categoryId.value !== undefined ? { category_id: categoryId.value } : {}),
  ...(subCategoryId.value !== undefined
    ? { sub_category_id: subCategoryId.value }
    : {}),
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

// ── Active filter chips ────────────────────────────────────────────────────
const activeChips = computed(() => {
  const chips: { key: string; label: string; remove: () => void }[] = [];

  if (conditionFilter.value === "new")
    chips.push({
      key: "cond",
      label: t("product.condition.new"),
      remove: () => {
        conditionFilter.value = "";
      },
    });
  else if (conditionFilter.value === "used")
    chips.push({
      key: "cond",
      label: t("product.condition.used"),
      remove: () => {
        conditionFilter.value = "";
      },
    });

  if (adTypeFilter.value === "direct")
    chips.push({
      key: "ad",
      label: t("catalog.filters.buyNow"),
      remove: () => {
        adTypeFilter.value = "";
      },
    });
  else if (adTypeFilter.value === "negotiation")
    chips.push({
      key: "ad",
      label: t("catalog.filters.negotiate"),
      remove: () => {
        adTypeFilter.value = "";
      },
    });

  if (rateFilter.value !== undefined)
    chips.push({
      key: "rate",
      label: t("catalog.chips.rating", { rating: rateFilter.value }),
      remove: () => {
        rateFilter.value = undefined;
      },
    });

  if (priceFrom.value !== undefined && priceTo.value !== undefined)
    chips.push({
      key: "price",
      label: t("catalog.chips.priceRange", {
        min: priceFrom.value,
        max: priceTo.value,
      }),
      remove: () => {
        priceFrom.value = undefined;
        priceTo.value = undefined;
      },
    });
  else if (priceFrom.value !== undefined)
    chips.push({
      key: "priceFrom",
      label: t("catalog.chips.minPrice", { min: priceFrom.value }),
      remove: () => {
        priceFrom.value = undefined;
      },
    });
  else if (priceTo.value !== undefined)
    chips.push({
      key: "priceTo",
      label: t("catalog.chips.maxPrice", { max: priceTo.value }),
      remove: () => {
        priceTo.value = undefined;
      },
    });

  return chips;
});

// ── Initial fetch ─────────────────────────────────────────────────────────
await productStore.fetchProducts(queryParams.value);

// ── Watchers ─────────────────────────────────────────────────────────────
watch(queryParams, (params) => productStore.fetchProducts(params), {
  deep: true,
});

// ── Infinity scroll ────────────────────────────────────────────────────────
const sentinel = ref<HTMLElement | null>(null);
const currentPage = computed(() => productStore.pagination?.current_page ?? 1);
const lastPage = computed(() => productStore.pagination?.last_page ?? 1);

async function loadMore() {
  if (productStore.loading || currentPage.value >= lastPage.value) return;
  await productStore.fetchProducts(
    { ...queryParams.value, page: currentPage.value + 1 },
    true,
  );
}

onMounted(() => {
  if (!sentinel.value) return;
  const obs = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { rootMargin: "300px" },
  );
  obs.observe(sentinel.value);
  onUnmounted(() => obs.disconnect());
});

// ── Sort + Reset ───────────────────────────────────────────────────────────
function resetFilters() {
  conditionFilter.value = "";
  adTypeFilter.value = "";
  priceFrom.value = undefined;
  priceTo.value = undefined;
  categoryId.value = undefined;
  subCategoryId.value = undefined;
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

// Price range bounds from API
const apiMinPrice = computed(() => productStore.priceRange.min);
const apiMaxPrice = computed(() => productStore.priceRange.max);

// Range bar visual width helpers
const rangeBarStyle = computed(() => {
  const total = apiMaxPrice.value - apiMinPrice.value || 1;
  const left =
    priceFrom.value !== undefined
      ? ((priceFrom.value - apiMinPrice.value) / total) * 100
      : 0;
  const right =
    priceTo.value !== undefined
      ? ((apiMaxPrice.value - priceTo.value) / total) * 100
      : 0;
  return { left: `${left}%`, right: `${right}%` };
});
</script>

<template>
  <main class="min-h-screen bg-grey-normal pb-16">
    <!-- Header -->
    <section class="border-b border-grey-normal-hover bg-white">
      <div class="container-app py-5">
        <p class="text-xs font-medium uppercase tracking-wide text-grey-dark-active">
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
        <!-- ─── Desktop sidebar ─────────────────────────────────────────── -->
        <aside class="hidden w-64 shrink-0 lg:block">
          <div class="rounded-xl bg-white shadow-sm">
            <!-- Sidebar header -->
            <div class="flex items-center justify-between border-b border-grey-normal-hover px-5 py-4">
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

            <!-- ── Categories ─────────────────────────────────────────── -->
            <div v-if="categories.length" class="border-b border-grey-normal-hover">
              <button
                type="button"
                class="flex w-full items-center justify-between px-5 py-3"
                @click="toggleSection('categories')"
              >
                <span class="text-sm font-semibold text-black-normal">
                  {{ t("productDetail.info.category") }}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="shrink-0 text-grey-darker transition-transform duration-200"
                  :class="{ 'rotate-180': openSections.categories }"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div v-show="openSections.categories" class="px-5 pb-4">
                <div class="flex flex-col gap-0.5">
                  <button
                    type="button"
                    class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition-colors"
                    :class="
                      categoryId === undefined
                        ? 'bg-blue-light font-medium text-blue-normal'
                        : 'text-grey-darker hover:bg-grey-normal'
                    "
                    @click="categoryId = undefined"
                  >
                    <span
                      v-if="categoryId === undefined"
                      class="ms-auto flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-normal"
                    >
                      <svg width="8" height="8" viewBox="0 0 10 8" fill="white" aria-hidden="true">
                        <path d="M1 4l3 3 5-6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                      </svg>
                    </span>
                    {{ t("catalog.filters.all") }}
                  </button>
                  <button
                    v-for="cat in categories"
                    :key="cat.id"
                    type="button"
                    class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition-colors"
                    :class="
                      categoryId === cat.id
                        ? 'bg-blue-light font-medium text-blue-normal'
                        : 'text-grey-darker hover:bg-grey-normal'
                    "
                    @click="categoryId = cat.id"
                  >
                    <span
                      v-if="categoryId === cat.id"
                      class="ms-auto flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-normal"
                    >
                      <svg width="8" height="8" viewBox="0 0 10 8" fill="white" aria-hidden="true">
                        <path d="M1 4l3 3 5-6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                      </svg>
                    </span>
                    {{ cat.title }}
                  </button>
                </div>
              </div>
            </div>

            <!-- ── Condition ──────────────────────────────────────────── -->
            <div class="border-b border-grey-normal-hover">
              <button
                type="button"
                class="flex w-full items-center justify-between px-5 py-3"
                @click="toggleSection('condition')"
              >
                <span class="text-sm font-semibold text-black-normal">
                  {{ t("catalog.filters.condition") }}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="shrink-0 text-grey-darker transition-transform duration-200"
                  :class="{ 'rotate-180': openSections.condition }"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div v-show="openSections.condition" class="flex flex-col gap-0.5 px-5 pb-4">
                <button
                  v-for="opt in [
                    { value: '', label: t('catalog.filters.all') },
                    { value: 'new', label: t('product.condition.new') },
                    { value: 'used', label: t('product.condition.used') },
                  ]"
                  :key="opt.value"
                  type="button"
                  class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                  :class="
                    conditionFilter === opt.value
                      ? 'bg-blue-light font-medium text-blue-normal'
                      : 'text-grey-darker hover:bg-grey-normal'
                  "
                  @click="conditionFilter = opt.value as '' | 'new' | 'used'"
                >
                  {{ opt.label }}
                  <span
                    v-if="conditionFilter === opt.value"
                    class="flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-normal"
                  >
                    <svg width="8" height="8" viewBox="0 0 10 8" fill="white" aria-hidden="true">
                      <path d="M1 4l3 3 5-6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            <!-- ── Price ──────────────────────────────────────────────── -->
            <div class="border-b border-grey-normal-hover">
              <button
                type="button"
                class="flex w-full items-center justify-between px-5 py-3"
                @click="toggleSection('price')"
              >
                <span class="text-sm font-semibold text-black-normal">
                  {{ t("catalog.filters.price") }}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="shrink-0 text-grey-darker transition-transform duration-200"
                  :class="{ 'rotate-180': openSections.price }"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div v-show="openSections.price" class="px-5 pb-4">
                <div class="mb-3 flex gap-2">
                  <div class="flex-1">
                    <p class="mb-1 text-xs text-grey-darker">{{ t("filters.min") }}</p>
                    <BaseInput
                      v-model="priceFrom"
                      type="number"
                      :placeholder="String(apiMinPrice)"
                      dir="ltr"
                    />
                  </div>
                  <div class="flex-1">
                    <p class="mb-1 text-xs text-grey-darker">{{ t("filters.max") }}</p>
                    <BaseInput
                      v-model="priceTo"
                      type="number"
                      :placeholder="String(apiMaxPrice)"
                      dir="ltr"
                    />
                  </div>
                </div>
                <!-- Visual range track -->
                <div class="relative mx-1 h-1.5 rounded-full bg-grey-normal-hover">
                  <div
                    class="absolute inset-y-0 rounded-full bg-blue-normal"
                    :style="rangeBarStyle"
                  />
                  <div
                    class="absolute -top-1.5 size-4 -translate-x-1/2 rounded-full border-2 border-blue-normal bg-white shadow-sm"
                    :style="{ left: rangeBarStyle.left }"
                  />
                  <div
                    class="absolute -top-1.5 size-4 translate-x-1/2 rounded-full border-2 border-blue-normal bg-white shadow-sm"
                    :style="{ right: rangeBarStyle.right }"
                  />
                </div>
                <div class="mt-2 flex justify-between text-xs text-grey-darker">
                  <span dir="ltr">{{ apiMinPrice }}</span>
                  <span dir="ltr">{{ apiMaxPrice }}</span>
                </div>
              </div>
            </div>

            <!-- ── Rating ─────────────────────────────────────────────── -->
            <div class="border-b border-grey-normal-hover">
              <button
                type="button"
                class="flex w-full items-center justify-between px-5 py-3"
                @click="toggleSection('rating')"
              >
                <span class="text-sm font-semibold text-black-normal">
                  {{ t("catalog.filters.rating") }}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="shrink-0 text-grey-darker transition-transform duration-200"
                  :class="{ 'rotate-180': openSections.rating }"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div v-show="openSections.rating" class="flex flex-col gap-0.5 px-5 pb-4">
                <button
                  v-for="star in [5, 4, 3, 2, 1]"
                  :key="star"
                  type="button"
                  class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                  :class="
                    rateFilter === star
                      ? 'bg-blue-light font-medium text-blue-normal'
                      : 'text-grey-darker hover:bg-grey-normal'
                  "
                  @click="rateFilter = rateFilter === star ? undefined : star"
                >
                  <span class="flex items-center gap-1.5">
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
                  </span>
                  <span
                    v-if="rateFilter === star"
                    class="flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-normal"
                  >
                    <svg width="8" height="8" viewBox="0 0 10 8" fill="white" aria-hidden="true">
                      <path d="M1 4l3 3 5-6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            <!-- ── Listing type ────────────────────────────────────────── -->
            <div>
              <button
                type="button"
                class="flex w-full items-center justify-between px-5 py-3"
                @click="toggleSection('tradeState')"
              >
                <span class="text-sm font-semibold text-black-normal">
                  {{ t("catalog.filters.tradeState") }}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="shrink-0 text-grey-darker transition-transform duration-200"
                  :class="{ 'rotate-180': openSections.tradeState }"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div v-show="openSections.tradeState" class="flex flex-col gap-0.5 px-5 pb-4">
                <button
                  v-for="opt in [
                    { value: '', label: t('catalog.filters.all') },
                    { value: 'direct', label: t('catalog.filters.buyNow') },
                    { value: 'negotiation', label: t('catalog.filters.negotiate') },
                  ]"
                  :key="opt.value"
                  type="button"
                  class="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                  :class="
                    adTypeFilter === opt.value
                      ? 'bg-blue-light font-medium text-blue-normal'
                      : 'text-grey-darker hover:bg-grey-normal'
                  "
                  @click="adTypeFilter = opt.value as '' | 'direct' | 'negotiation'"
                >
                  {{ opt.label }}
                  <span
                    v-if="adTypeFilter === opt.value"
                    class="flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-normal"
                  >
                    <svg width="8" height="8" viewBox="0 0 10 8" fill="white" aria-hidden="true">
                      <path d="M1 4l3 3 5-6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- ─── Main content ───────────────────────────────────────────── -->
        <div class="min-w-0 flex-1">
          <!-- Toolbar -->
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
              <p v-if="productStore.pagination" class="text-sm text-grey-darker">
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

          <!-- Sub-categories horizontal scroll -->
          <div
            v-if="categoryId !== undefined && (subCategories.length || loadingSubCats)"
            class="mb-3 overflow-x-auto"
          >
            <div class="flex gap-2 pb-1" style="width: max-content">
              <button
                type="button"
                class="rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                :class="
                  subCategoryId === undefined
                    ? 'border-blue-normal bg-blue-normal text-white'
                    : 'border-grey-normal-hover bg-white text-grey-darker hover:border-blue-normal'
                "
                @click="subCategoryId = undefined"
              >
                {{ t("catalog.filters.all") }}
              </button>
              <template v-if="loadingSubCats">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="h-8 w-20 animate-pulse rounded-full bg-grey-normal"
                />
              </template>
              <button
                v-for="sub in subCategories"
                v-else
                :key="sub.id"
                type="button"
                class="rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                :class="
                  subCategoryId === sub.id
                    ? 'border-blue-normal bg-blue-normal text-white'
                    : 'border-grey-normal-hover bg-white text-grey-darker hover:border-blue-normal'
                "
                @click="subCategoryId = sub.id"
              >
                {{ sub.title }}
              </button>
            </div>
          </div>

          <!-- Active filter chips -->
          <div
            v-if="activeChips.length"
            class="mb-4 flex flex-wrap items-center gap-2"
          >
            <button
              v-for="chip in activeChips"
              :key="chip.key"
              type="button"
              class="flex items-center gap-1.5 rounded-full border border-blue-normal bg-blue-light px-3 py-1 text-xs font-medium text-blue-normal transition-colors hover:bg-blue-normal hover:text-white"
              @click="chip.remove()"
            >
              {{ chip.label }}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              class="text-xs text-grey-darker underline underline-offset-2 hover:text-black-normal"
              @click="resetFilters"
            >
              {{ t("filters.reset") }}
            </button>
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
            <!-- Initial loading skeletons -->
            <template v-if="productStore.loading && !productStore.products.length">
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
              :to="`/products/${pair.api.id}`"
              :favorite="pair.api.is_favorite"
              show-favorite
              :condition-label="pair.api.status_trans"
              :listing-label="pair.api.ad_type_trans"
              @favorite="(p) => productStore.toggleFavorite(Number(p.id))"
            />
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

          <!-- Load-more skeletons (append loading) -->
          <div
            v-if="productStore.loading && productStore.products.length"
            class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          >
            <SharedCatalogProductCard
              v-for="i in 4"
              :key="`more-${i}`"
              loading
            />
          </div>

          <!-- Infinity scroll sentinel -->
          <div ref="sentinel" class="h-1" aria-hidden="true" />
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
          class="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white lg:hidden"
          role="dialog"
          :aria-label="t('filters.title')"
        >
          <!-- Sheet header -->
          <div class="sticky top-0 flex items-center justify-between border-b border-grey-normal-hover bg-white px-5 py-4">
            <h2 class="font-semibold text-black-normal">
              {{ t("filters.title") }}
            </h2>
            <button
              type="button"
              class="flex size-8 items-center justify-center rounded-full text-grey-darker hover:bg-grey-normal"
              :aria-label="t('common.close')"
              @click="filterOpen = false"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- ── Mobile: Condition ──────────────────────────────────────── -->
          <div class="border-b border-grey-normal-hover">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-3.5"
              @click="toggleSection('condition')"
            >
              <span class="font-semibold text-black-normal">
                {{ t("catalog.filters.condition") }}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="shrink-0 text-grey-darker transition-transform duration-200"
                :class="{ 'rotate-180': openSections.condition }"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div v-show="openSections.condition" class="flex flex-wrap gap-2 px-5 pb-4">
              <button
                v-for="opt in [
                  { value: '', label: t('catalog.filters.all') },
                  { value: 'new', label: t('product.condition.new') },
                  { value: 'used', label: t('product.condition.used') },
                ]"
                :key="opt.value"
                type="button"
                class="rounded-xl border px-4 py-2 text-sm transition-colors"
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

          <!-- ── Mobile: Price ──────────────────────────────────────────── -->
          <div class="border-b border-grey-normal-hover">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-3.5"
              @click="toggleSection('price')"
            >
              <span class="font-semibold text-black-normal">
                {{ t("catalog.filters.price") }}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="shrink-0 text-grey-darker transition-transform duration-200"
                :class="{ 'rotate-180': openSections.price }"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div v-show="openSections.price" class="px-5 pb-5">
              <div class="flex gap-3">
                <div class="flex-1">
                  <p class="mb-1.5 text-sm text-grey-darker">{{ t("filters.min") }}</p>
                  <BaseInput
                    v-model="priceFrom"
                    type="number"
                    :placeholder="String(apiMinPrice)"
                    dir="ltr"
                  />
                </div>
                <div class="flex-1">
                  <p class="mb-1.5 text-sm text-grey-darker">{{ t("filters.max") }}</p>
                  <BaseInput
                    v-model="priceTo"
                    type="number"
                    :placeholder="String(apiMaxPrice)"
                    dir="ltr"
                  />
                </div>
              </div>
              <div class="relative mx-1 mt-4 h-1.5 rounded-full bg-grey-normal-hover">
                <div
                  class="absolute inset-y-0 rounded-full bg-blue-normal"
                  :style="rangeBarStyle"
                />
                <div
                  class="absolute -top-1.5 size-4 -translate-x-1/2 rounded-full border-2 border-blue-normal bg-white shadow-sm"
                  :style="{ left: rangeBarStyle.left }"
                />
                <div
                  class="absolute -top-1.5 size-4 translate-x-1/2 rounded-full border-2 border-blue-normal bg-white shadow-sm"
                  :style="{ right: rangeBarStyle.right }"
                />
              </div>
              <div class="mt-2 flex justify-between text-xs text-grey-darker">
                <span dir="ltr">{{ apiMinPrice }}</span>
                <span dir="ltr">{{ apiMaxPrice }}</span>
              </div>
            </div>
          </div>

          <!-- ── Mobile: Rating ─────────────────────────────────────────── -->
          <div class="border-b border-grey-normal-hover">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-3.5"
              @click="toggleSection('rating')"
            >
              <span class="font-semibold text-black-normal">
                {{ t("catalog.filters.rating") }}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="shrink-0 text-grey-darker transition-transform duration-200"
                :class="{ 'rotate-180': openSections.rating }"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div v-show="openSections.rating" class="flex flex-wrap gap-2 px-5 pb-4">
              <button
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                type="button"
                class="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm transition-colors"
                :class="
                  rateFilter === star
                    ? 'border-blue-normal bg-blue-normal text-white'
                    : 'border-grey-normal-hover text-grey-darker'
                "
                @click="rateFilter = rateFilter === star ? undefined : star"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.2l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z" />
                </svg>
                {{ star }}+
              </button>
            </div>
          </div>

          <!-- ── Mobile: Listing type ───────────────────────────────────── -->
          <div class="border-b border-grey-normal-hover">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-3.5"
              @click="toggleSection('tradeState')"
            >
              <span class="font-semibold text-black-normal">
                {{ t("catalog.filters.tradeState") }}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="shrink-0 text-grey-darker transition-transform duration-200"
                :class="{ 'rotate-180': openSections.tradeState }"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div v-show="openSections.tradeState" class="flex flex-wrap gap-2 px-5 pb-4">
              <button
                v-for="opt in [
                  { value: '', label: t('catalog.filters.all') },
                  { value: 'direct', label: t('catalog.filters.buyNow') },
                  { value: 'negotiation', label: t('catalog.filters.negotiate') },
                ]"
                :key="opt.value"
                type="button"
                class="rounded-xl border px-4 py-2 text-sm transition-colors"
                :class="
                  adTypeFilter === opt.value
                    ? 'border-blue-normal bg-blue-normal text-white'
                    : 'border-grey-normal-hover text-grey-darker'
                "
                @click="adTypeFilter = opt.value as '' | 'direct' | 'negotiation'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- ── Mobile: Categories ─────────────────────────────────────── -->
          <div v-if="categories.length" class="border-b border-grey-normal-hover">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-3.5"
              @click="toggleSection('categories')"
            >
              <span class="font-semibold text-black-normal">
                {{ t("productDetail.info.category") }}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="shrink-0 text-grey-darker transition-transform duration-200"
                :class="{ 'rotate-180': openSections.categories }"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div v-show="openSections.categories" class="flex flex-col gap-0.5 px-5 pb-4">
              <button
                type="button"
                class="rounded-lg px-3 py-2 text-start text-sm transition-colors"
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
                class="rounded-lg px-3 py-2 text-start text-sm transition-colors"
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

          <!-- Sheet actions -->
          <div class="sticky bottom-0 flex gap-3 border-t border-grey-normal-hover bg-white px-5 py-4">
            <BaseButton variant="secondary" class="flex-1" @click="resetFilters">
              {{ t("filters.reset") }}
            </BaseButton>
            <BaseButton variant="primary" class="flex-1" @click="filterOpen = false">
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
