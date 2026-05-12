<script setup lang="ts">
import type { FilterSortValue, FilterValue } from "~/types/filter";
import type { ProductPriceType } from "~/types/product";
import type { CatalogCondition } from "~/composables/useProductCatalog";

interface Props {
  categoryId?: string | null;
}

type ActiveFilterKey = "condition" | "price" | "rating" | "priceType" | "sort";

interface ActiveFilterChip {
  key: ActiveFilterKey;
  label: string;
}

const props = withDefaults(defineProps<Props>(), {
  categoryId: null,
});

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

const filterOpen = ref(false);
const searchInput = ref("");
const loading = ref(false);
const error = ref<Error | null>(null);

const loadingCards = Array.from({ length: 6 }, (_, index) => index);
const filterQueryKeys = [
  "sort",
  "condition",
  "minPrice",
  "maxPrice",
  "rating",
  "priceType",
] as const;

const category = computed(() => getCategory(props.categoryId));
const categoryMissing = computed(
  () => Boolean(props.categoryId) && !category.value,
);
const activeCategoryId = computed(() => props.categoryId ?? null);

watch(
  () => route.query.q,
  (value) => {
    searchInput.value = readQueryString(value);
  },
  { immediate: true },
);

const normalizedQuery = computed(() => ({
  q: readQueryString(route.query.q).trim(),
  sort: readQueryString(route.query.sort) || "recommended",
  condition: readCondition(route.query.condition),
  minPrice: readQueryNumber(route.query.minPrice),
  maxPrice: readQueryNumber(route.query.maxPrice),
  rating: readQueryNumber(route.query.rating),
  priceType: readPriceType(route.query.priceType),
}));

const hasSearch = computed(() => normalizedQuery.value.q.length > 0);

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

const visibleProducts = computed(() => {
  if (categoryMissing.value || error.value) return [];

  return filterProducts(products.value, {
    query: normalizedQuery.value.q,
    categoryId: props.categoryId,
    condition: normalizedQuery.value.condition,
    minPrice: normalizedQuery.value.minPrice,
    maxPrice: normalizedQuery.value.maxPrice,
    rating: normalizedQuery.value.rating,
    priceType: normalizedQuery.value.priceType,
    sort: normalizedQuery.value.sort,
  });
});

const breadcrumbs = computed(() => {
  if (props.categoryId) {
    return [
      { label: t("catalog.breadcrumbs.products"), to: "/products" },
      {
        label: category.value?.name ?? t("catalog.category.notFoundTitle"),
      },
    ];
  }

  return [{ label: t("catalog.breadcrumbs.products") }];
});

const pageTitle = computed(() => {
  if (categoryMissing.value) return t("catalog.category.notFoundTitle");
  if (category.value) return category.value.name;
  if (hasSearch.value) {
    return t("catalog.search.resultsTitle", {
      query: normalizedQuery.value.q,
    });
  }

  return t("catalog.page.title");
});

const pageDescription = computed(() => {
  if (categoryMissing.value) return t("catalog.category.notFoundMessage");
  if (category.value) {
    return t("catalog.category.description", {
      category: category.value.name,
    });
  }
  if (hasSearch.value) {
    return t("catalog.search.resultsDescription", {
      count: visibleProducts.value.length,
    });
  }

  return t("catalog.page.description");
});

const resultsSummary = computed(() => {
  if (hasSearch.value) {
    return t("catalog.results.searchCount", {
      count: visibleProducts.value.length,
      query: normalizedQuery.value.q,
    });
  }

  return t("catalog.results.count", {
    count: visibleProducts.value.length,
  });
});

const activeFilterChips = computed<ActiveFilterChip[]>(() => {
  const chips: ActiveFilterChip[] = [];
  const { condition, minPrice, maxPrice, rating, priceType, sort } =
    normalizedQuery.value;

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

const emptyTitle = computed(() =>
  hasSearch.value || activeFilterChips.value.length
    ? t("catalog.empty.filteredTitle")
    : t("catalog.empty.title"),
);

const emptyMessage = computed(() =>
  hasSearch.value || activeFilterChips.value.length
    ? t("catalog.empty.filteredMessage")
    : t("catalog.empty.message"),
);

const emptyActionLabel = computed(() => {
  if (activeFilterChips.value.length) return t("catalog.actions.resetFilters");
  if (hasSearch.value) return t("catalog.actions.clearSearch");
  if (props.categoryId) return t("catalog.actions.viewAllProducts");
  return undefined;
});

useHead(() => ({
  title: category.value
    ? t("catalog.meta.categoryTitle", { category: category.value.name })
    : t("catalog.meta.productsTitle"),
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

function clearFilterChip(key: ActiveFilterKey) {
  if (key === "price") {
    pushQuery({ minPrice: null, maxPrice: null });
    return;
  }

  pushQuery({ [key]: null });
}

function handleEmptyAction() {
  if (activeFilterChips.value.length) {
    resetFilters();
    return;
  }

  if (hasSearch.value) {
    clearSearch();
    return;
  }

  router.push(localePath("/products"));
}

function selectCategory(categoryId: string | null) {
  const query = cleanCurrentQuery();
  const path = categoryId
    ? localePath(`/categories/${categoryId}`)
    : localePath("/products");

  router.push({ path, query });
}

function handleFavorite() {
  router.push(localePath("/auth/login"));
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
              {{ t("catalog.eyebrow") }}
            </p>
            <h1
              class="text-3xl font-bold leading-tight text-black-normal-hover sm:text-[40px]"
            >
              {{ pageTitle }}
            </h1>
            <p class="max-w-2xl text-base leading-7 text-grey-darker">
              {{ pageDescription }}
            </p>
          </div>

          <form
            class="w-full"
            role="search"
            :aria-label="t('catalog.search.formLabel')"
            @submit.prevent="submitSearch()"
          >
            <BaseSearchBar
              v-model="searchInput"
              show-filter
              :placeholder="t('catalog.search.placeholder')"
              @search="submitSearch"
              @clear="clearSearch"
              @filter="filterOpen = true"
            />
          </form>
        </div>
      </div>
    </section>

    <section class="container-app py-6 lg:py-8">
      <div class="flex flex-col gap-4">
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
            class="md:hidden"
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
            {{ t("catalog.actions.filters") }}
          </BaseButton>
        </div>

        <div
          v-if="activeFilterChips.length"
          class="flex flex-wrap items-center gap-2"
          :aria-label="t('catalog.activeFiltersLabel')"
        >
          <button
            v-for="chip in activeFilterChips"
            :key="chip.key"
            type="button"
            class="inline-flex min-h-8 items-center gap-1 rounded-xs bg-grey-normal px-3 py-1 text-sm text-blue-normal transition-colors hover:bg-blue-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
            :aria-label="
              t('catalog.actions.clearFilter', { filter: chip.label })
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

        <div class="grid items-start gap-6 md:grid-cols-[334px_minmax(0,1fr)]">
          <SharedFiltersFilterSortSheet
            v-model:open="filterOpen"
            :model-value="filterSortValue"
            :sections="filterSections"
            :sort-options="sortOptions"
            :title="t('filters.title')"
            :loading="loading"
            @apply="applyFilters"
            @reset="resetFilters"
          />

          <section aria-labelledby="catalog-results-title">
            <h2 id="catalog-results-title" class="sr-only">
              {{ t("catalog.results.title") }}
            </h2>

            <div
              v-if="loading"
              class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3"
            >
              <SharedCatalogProductCard
                v-for="card in loadingCards"
                :key="card"
                loading
              />
            </div>

            <SharedFeedbackEmptyState
              v-else-if="categoryMissing"
              :title="t('catalog.category.notFoundTitle')"
              :message="t('catalog.category.notFoundMessage')"
              :action-label="t('catalog.actions.viewAllProducts')"
              action-to="/products"
              tone="warning"
            />

            <SharedFeedbackEmptyState
              v-else-if="error"
              :title="t('catalog.error.title')"
              :message="t('catalog.error.message')"
              tone="danger"
            />

            <div
              v-else-if="visibleProducts.length"
              class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3"
            >
              <SharedCatalogProductCard
                v-for="product in visibleProducts"
                :key="product.id"
                :product="product"
                :to="`/products/${product.id}`"
                :condition-label="conditionLabels[product.condition]"
                :listing-label="listingLabel"
                show-favorite
                @favorite="handleFavorite"
              />
            </div>

            <SharedFeedbackEmptyState
              v-else
              :title="emptyTitle"
              :message="emptyMessage"
              :action-label="emptyActionLabel"
              tone="brand"
              @action="handleEmptyAction"
            />
          </section>
        </div>
      </div>
    </section>
  </main>
</template>
