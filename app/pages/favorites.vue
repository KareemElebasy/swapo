<script setup lang="ts">
import { catalogCategoryIds } from "~/composables/useProductCatalog";
import type {
  CatalogCategoryId,
  CatalogCondition,
  CatalogProduct,
} from "~/composables/useProductCatalog";
import type { FilterSortValue, FilterValue } from "~/types/filter";
import type { ProductPriceType } from "~/types/product";

type ActiveFilterKey =
  | "category"
  | "condition"
  | "price"
  | "rating"
  | "priceType"
  | "sort";

interface ActiveFilterChip {
  key: ActiveFilterKey;
  label: string;
}

definePageMeta({
  layout: "public",
});

// Demo-only favorite ids until persisted buyer favorites are available.
const demoFavoriteProductIds = [
  "blue-denim-jacket",
  "red-flame-heels",
  "heart-winter-coat",
  "pink-heart-coat",
  "minimal-handbag",
  "wide-leg-pants",
  "sport-sneakers",
  "gold-statement-earrings",
] as const;

const route = useRoute();
const router = useRouter();
const localePath = useLocalePath();
const { t } = useI18n();

const {
  categories,
  products,
  conditionLabels,
  listingLabel,
  sortOptions,
  filterSections,
  getCategory,
  filterProducts,
} = useProductCatalog();

const favoriteIds = useState<string[]>("buyer-demo-favorite-product-ids", () => [
  ...demoFavoriteProductIds,
]);
const filterOpen = ref(false);
const searchInput = ref("");
const loading = ref(false);
const lastRemovedTitle = ref("");

const loadingCards = Array.from({ length: 8 }, (_, index) => index);
const filterQueryKeys = [
  "sort",
  "condition",
  "minPrice",
  "maxPrice",
  "rating",
  "priceType",
] as const;
const browsingQueryKeys = ["q", "category", ...filterQueryKeys] as const;

watch(
  () => route.query.q,
  (value) => {
    searchInput.value = readQueryString(value);
  },
  { immediate: true },
);

const normalizedQuery = computed(() => ({
  q: readQueryString(route.query.q).trim(),
  categoryId: readCategory(route.query.category),
  sort: readQueryString(route.query.sort) || "recommended",
  condition: readCondition(route.query.condition),
  minPrice: readQueryNumber(route.query.minPrice),
  maxPrice: readQueryNumber(route.query.maxPrice),
  rating: readQueryNumber(route.query.rating),
  priceType: readPriceType(route.query.priceType),
}));

const activeCategoryId = computed(() => normalizedQuery.value.categoryId);
const category = computed(() => getCategory(activeCategoryId.value));
const hasSearch = computed(() => normalizedQuery.value.q.length > 0);

const productById = computed(
  () => new Map(products.value.map((product) => [product.id, product])),
);

const favoriteProducts = computed<CatalogProduct[]>(() =>
  favoriteIds.value
    .map((productId) => productById.value.get(productId))
    .filter((product): product is CatalogProduct => Boolean(product)),
);

const filterSortValue = computed<FilterSortValue>(() => ({
  sort: normalizedQuery.value.sort,
  filters: {
    condition: normalizedQuery.value.condition ?? "all",
    price: {
      min: normalizedQuery.value.minPrice,
      max: normalizedQuery.value.maxPrice,
    },
    rating: normalizedQuery.value.rating,
    priceType: normalizedQuery.value.priceType ?? "all",
  },
}));

const visibleProducts = computed(() =>
  filterProducts(favoriteProducts.value, {
    query: normalizedQuery.value.q,
    categoryId: activeCategoryId.value,
    condition: normalizedQuery.value.condition,
    minPrice: normalizedQuery.value.minPrice,
    maxPrice: normalizedQuery.value.maxPrice,
    rating: normalizedQuery.value.rating,
    priceType: normalizedQuery.value.priceType,
    sort: normalizedQuery.value.sort,
  }),
);

const breadcrumbs = computed(() => [
  {
    label: t("favorites.breadcrumbs.current"),
  },
]);

const resultsSummary = computed(() => {
  if (visibleProducts.value.length === favoriteProducts.value.length) {
    return t("favorites.results.count", {
      count: visibleProducts.value.length,
    });
  }

  return t("favorites.results.filteredCount", {
    count: visibleProducts.value.length,
    total: favoriteProducts.value.length,
  });
});

const activeFilterChips = computed<ActiveFilterChip[]>(() => {
  const chips: ActiveFilterChip[] = [];
  const { condition, minPrice, maxPrice, rating, priceType, sort } =
    normalizedQuery.value;

  if (category.value) {
    chips.push({
      key: "category",
      label: category.value.name,
    });
  }

  if (condition && condition !== "all") {
    chips.push({
      key: "condition",
      label: conditionLabels.value[condition],
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    chips.push({
      key: "price",
      label: formatPriceChip(minPrice, maxPrice),
    });
  }

  if (rating !== undefined) {
    chips.push({
      key: "rating",
      label: t("catalog.chips.rating", { rating }),
    });
  }

  if (priceType && priceType !== "all") {
    chips.push({
      key: "priceType",
      label:
        priceType === "fixed"
          ? t("catalog.filters.buyNow")
          : t("catalog.filters.negotiate"),
    });
  }

  if (sort && sort !== "recommended") {
    chips.push({
      key: "sort",
      label:
        sortOptions.value.find((option) => option.value === sort)?.label ??
        String(sort),
    });
  }

  return chips;
});

const hasBrowsingState = computed(
  () => hasSearch.value || activeFilterChips.value.length > 0,
);

const emptyTitle = computed(() =>
  hasBrowsingState.value
    ? t("favorites.empty.filteredTitle")
    : t("favorites.empty.title"),
);

const emptyMessage = computed(() =>
  hasBrowsingState.value
    ? t("favorites.empty.filteredMessage")
    : t("favorites.empty.message"),
);

useHead(() => ({
  title: t("favorites.meta.title"),
}));

function readQueryString(value: unknown) {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : "";
  return typeof value === "string" ? value : "";
}

function readQueryNumber(value: unknown) {
  const raw = readQueryString(value);
  if (!raw) return undefined;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readCategory(value: unknown): CatalogCategoryId | null {
  const raw = readQueryString(value);

  if ((catalogCategoryIds as readonly string[]).includes(raw)) {
    return raw as CatalogCategoryId;
  }

  return null;
}

function readCondition(value: unknown): CatalogCondition | "all" | undefined {
  const raw = readQueryString(value);
  if (raw === "new" || raw === "used" || raw === "all") return raw;
  return undefined;
}

function readPriceType(value: unknown): ProductPriceType | "all" | undefined {
  const raw = readQueryString(value);
  if (raw === "fixed" || raw === "negotiable" || raw === "all") return raw;
  return undefined;
}

function numericFilter(value: FilterValue, side: "min" | "max") {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  const numeric = value[side];
  return Number.isFinite(numeric) ? numeric : undefined;
}

function cleanCurrentQuery() {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(route.query)) {
    const resolved = readQueryString(value);
    if (resolved) query[key] = resolved;
  }

  return query;
}

function pushQuery(updates: Record<string, string | number | null | undefined>) {
  const query = cleanCurrentQuery();

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      delete query[key];
    } else {
      query[key] = String(value);
    }
  }

  router.push({ path: route.path, query });
}

function submitSearch(value = searchInput.value) {
  pushQuery({ q: value.trim() || null });
}

function clearSearch() {
  searchInput.value = "";
  pushQuery({ q: null });
}

function selectCategory(categoryId: string | null) {
  pushQuery({ category: categoryId });
}

function applyFilters(value: FilterSortValue) {
  const price = value.filters.price;
  const condition = value.filters.condition;
  const priceType = value.filters.priceType;

  pushQuery({
    sort: value.sort && value.sort !== "recommended" ? value.sort : null,
    condition:
      typeof condition === "string" && condition !== "all" ? condition : null,
    minPrice: numericFilter(price, "min"),
    maxPrice: numericFilter(price, "max"),
    rating:
      typeof value.filters.rating === "number" ? value.filters.rating : null,
    priceType:
      typeof priceType === "string" && priceType !== "all" ? priceType : null,
  });
}

function resetFilters() {
  pushQuery(Object.fromEntries(filterQueryKeys.map((key) => [key, null])));
}

function resetBrowsingState() {
  searchInput.value = "";
  pushQuery(Object.fromEntries(browsingQueryKeys.map((key) => [key, null])));
}

function clearFilterChip(key: ActiveFilterKey) {
  if (key === "price") {
    pushQuery({ minPrice: null, maxPrice: null });
    return;
  }

  pushQuery({ [key]: null });
}

function removeFavorite(product: { id: string; title: string }) {
  favoriteIds.value = favoriteIds.value.filter(
    (productId) => productId !== product.id,
  );
  lastRemovedTitle.value = product.title;
}

function handleEmptyAction() {
  if (favoriteProducts.value.length === 0) {
    router.push(localePath("/products"));
    return;
  }

  resetBrowsingState();
}

function formatPriceChip(minPrice?: number, maxPrice?: number) {
  if (minPrice !== undefined && maxPrice !== undefined) {
    return t("catalog.chips.priceRange", { min: minPrice, max: maxPrice });
  }

  if (minPrice !== undefined) {
    return t("catalog.chips.minPrice", { min: minPrice });
  }

  return t("catalog.chips.maxPrice", { max: maxPrice });
}
</script>

<template>
  <main class="bg-white">
    <section class="border-b border-grey-normal bg-grey-light-active">
      <div class="container-app flex flex-col gap-5 py-6 lg:py-8">
        <SharedNavigationBreadcrumbs :items="breadcrumbs" variant="compact" />

        <div
          class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,430px)] lg:items-end"
        >
          <div class="flex min-w-0 flex-col gap-2 text-start">
            <p class="text-sm font-medium text-blue-normal">
              {{ t("favorites.eyebrow") }}
            </p>
            <h1
              class="text-3xl font-bold leading-tight text-black-normal-hover sm:text-[40px]"
            >
              {{ t("favorites.page.title") }}
            </h1>
            <p class="max-w-2xl text-base leading-7 text-grey-darker">
              {{ t("favorites.page.description") }}
            </p>
          </div>

          <form
            class="w-full"
            role="search"
            :aria-label="t('favorites.search.formLabel')"
            @submit.prevent="submitSearch()"
          >
            <BaseSearchBar
              v-model="searchInput"
              show-filter
              :placeholder="t('favorites.search.placeholder')"
              :loading="loading"
              @search="submitSearch"
              @clear="clearSearch"
              @filter="filterOpen = true"
            />
          </form>
        </div>
      </div>
    </section>

    <section class="container-app py-6 lg:py-8">
      <div class="flex flex-col gap-5">
        <SharedCatalogCategoryNav
          :categories="categories"
          :active-id="activeCategoryId"
          show-all
          variant="chips"
          @select="selectCategory"
        >
          <template #item="{ category: navCategory, active, select }">
            <button
              type="button"
              :class="[
                'shrink-0 rounded-xs border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal sm:text-base',
                active
                  ? 'border-brand-cyan bg-brand-cyan-light text-brand-cyan'
                  : 'border-grey-normal-hover bg-white text-black-normal hover:border-blue-light-active hover:text-blue-normal',
              ]"
              :aria-current="active ? 'true' : undefined"
              @click="select"
            >
              {{ navCategory.name }}
            </button>
          </template>
        </SharedCatalogCategoryNav>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm leading-6 text-grey-darker">
            {{ resultsSummary }}
          </p>

          <BaseButton
            variant="secondary"
            size="sm"
            @click="filterOpen = true"
          >
            <template #icon>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2.5 4h11M4.5 8h7M6.5 12h3"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </template>
            {{ t("favorites.actions.filters") }}
          </BaseButton>
        </div>

        <div
          v-if="activeFilterChips.length"
          class="flex flex-wrap items-center gap-2"
          :aria-label="t('favorites.activeFiltersLabel')"
        >
          <button
            v-for="chip in activeFilterChips"
            :key="chip.key"
            type="button"
            class="inline-flex min-h-8 items-center gap-1 rounded-xs bg-grey-normal px-3 py-1 text-sm text-blue-normal transition-colors hover:bg-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
            :aria-label="
              t('favorites.actions.clearFilter', { filter: chip.label })
            "
            @click="clearFilterChip(chip.key)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="m10.5 3.5-7 7M3.5 3.5l7 7"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>
            <span>{{ chip.label }}</span>
          </button>
        </div>

        <SharedFiltersFilterSortSheet
          v-model:open="filterOpen"
          :model-value="filterSortValue"
          :sections="filterSections"
          :sort-options="sortOptions"
          :title="t('favorites.filters.title')"
          :loading="loading"
          mode="drawer"
          @apply="applyFilters"
          @reset="resetFilters"
        />

        <section aria-labelledby="favorites-results-title">
          <h2 id="favorites-results-title" class="sr-only">
            {{ t("favorites.results.title") }}
          </h2>

          <div
            v-if="loading"
            class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <SharedCatalogProductCard
              v-for="card in loadingCards"
              :key="card"
              loading
            />
          </div>

          <div
            v-else-if="visibleProducts.length"
            class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <SharedCatalogProductCard
              v-for="product in visibleProducts"
              :key="product.id"
              :product="product"
              :to="`/products/${product.id}`"
              :favorite="true"
              :condition-label="conditionLabels[product.condition]"
              :listing-label="listingLabel"
              show-favorite
              @favorite="removeFavorite"
            />
          </div>

          <SharedFeedbackEmptyState
            v-else
            :title="emptyTitle"
            :message="emptyMessage"
            :action-label="
              favoriteProducts.length
                ? t('favorites.actions.resetBrowsing')
                : t('favorites.actions.browseProducts')
            "
            tone="brand"
            @action="handleEmptyAction"
          />
        </section>

        <p class="sr-only" aria-live="polite">
          {{
            lastRemovedTitle
              ? t("favorites.status.removed", { product: lastRemovedTitle })
              : ""
          }}
        </p>
      </div>
    </section>
  </main>
</template>
