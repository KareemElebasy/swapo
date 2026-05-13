<script setup lang="ts">
import type { CatalogProduct } from "~/composables/useProductCatalog";

definePageMeta({
  layout: "public",
});

const route = useRoute();
const localePath = useLocalePath();
const { t, locale } = useI18n();

const {
  conditionLabels,
  listingLabel,
  getCategory,
  getProduct,
  getSeller,
  getReviews,
  getRelatedProducts,
} = useProductCatalog();

const activeMediaIndex = ref(0);
const descriptionExpanded = ref(false);
const loading = ref(false);
const loadingCards = Array.from({ length: 4 }, (_, index) => index);

const productId = computed(() => {
  const value = route.params.productId;
  return Array.isArray(value) ? value[0] : value;
});

const product = computed(() => getProduct(productId.value));
const seller = computed(() =>
  product.value ? getSeller(product.value.sellerId) : undefined,
);
const reviews = computed(() =>
  product.value ? getReviews(product.value.sellerId) : [],
);
const category = computed(() => getCategory(product.value?.categoryId));
const relatedProducts = computed(() => getRelatedProducts(productId.value, 5));
const media = computed(() => product.value?.media ?? []);

const isUnavailable = computed(() =>
  product.value?.status === "sold" || product.value?.status === "paused",
);

const priceTypeLabel = computed(() => {
  if (!product.value) return "";
  return product.value.priceType === "negotiable"
    ? t("product.priceType.negotiable")
    : t("product.priceType.fixed");
});

const actionLabel = computed(() => {
  if (isUnavailable.value) return t("productDetail.actions.unavailable");
  if (product.value?.priceType === "negotiable") {
    return t("productDetail.actions.signInToNegotiate");
  }

  return t("productDetail.actions.signInToBuy");
});

const productAttributes = computed(() => {
  if (!product.value) return [];

  return [
    {
      key: "condition",
      label: t("productDetail.meta.condition"),
      value: conditionLabels.value[product.value.condition],
    },
    {
      key: "listingType",
      label: t("productDetail.meta.listingType"),
      value: priceTypeLabel.value,
    },
    {
      key: "category",
      label: t("productDetail.meta.category"),
      value: category.value?.name ?? product.value.categoryId,
    },
    {
      key: "published",
      label: t("productDetail.meta.published"),
      value: formatDate(product.value.publishedAt, { locale: locale.value }),
    },
  ];
});

const breadcrumbs = computed(() => {
  const items: { label: string; to?: string }[] = [
    {
      label: t("catalog.breadcrumbs.products"),
      to: "/products",
    },
  ];

  if (category.value) {
    items.push({
      label: category.value.name,
      to: `/categories/${category.value.id}`,
    });
  }

  items.push({
    label: product.value?.title ?? t("productDetail.notFound.title"),
  });

  return items;
});

const hasLongDescription = computed(
  () => (product.value?.description?.length ?? 0) > 140,
);

const shownDescription = computed(() => {
  const description =
    product.value?.description ?? t("productDetail.description.empty");

  if (!hasLongDescription.value || descriptionExpanded.value) {
    return description;
  }

  return description;
});

const sellerMetrics = computed(() => {
  if (!seller.value) return [];

  return [
    {
      key: "rating",
      label: t("productDetail.seller.rating"),
      value: seller.value.rating.toFixed(1),
    },
    {
      key: "reviews",
      label: t("productDetail.seller.reviews"),
      value: t("productDetail.reviews.count", {
        count: seller.value.reviewCount,
      }),
    },
    {
      key: "activeProducts",
      label: t("productDetail.seller.activeProducts"),
      value: seller.value.activeProducts,
    },
  ];
});

watch(
  () => productId.value,
  () => {
    activeMediaIndex.value = 0;
    descriptionExpanded.value = false;
  },
);

if (import.meta.server && !product.value) {
  setResponseStatus(404);
}

useHead(() => ({
  title: product.value
    ? t("productDetail.meta.title", { product: product.value.title })
    : t("productDetail.meta.notFoundTitle"),
}));

function selectMedia(index: number) {
  activeMediaIndex.value = index;
}

function formattedReviewDate(value: string) {
  return formatDate(value, { locale: locale.value });
}

function ratingAriaLabel(rating: number) {
  return t("productDetail.rating.ariaLabel", { rating });
}

function handleFavorite() {
  return navigateTo(localePath("/auth/login"));
}

function productCardTo(relatedProduct: CatalogProduct) {
  return `/products/${relatedProduct.id}`;
}
</script>

<template>
  <main class="bg-white">
    <section class="border-b border-grey-normal bg-grey-light-active">
      <div class="container-app py-4">
        <SharedNavigationBreadcrumbs :items="breadcrumbs" variant="compact" />
      </div>
    </section>

    <section class="container-app py-6 lg:py-10">
      <div v-if="loading" class="grid gap-8 lg:grid-cols-2">
        <BaseSkeleton height="h-[520px]" />
        <div class="flex flex-col gap-4">
          <BaseSkeleton variant="text" width="w-3/4" />
          <BaseSkeleton variant="text" />
          <BaseSkeleton height="h-14" width="w-40" />
          <BaseSkeleton height="h-12" />
        </div>
      </div>

      <SharedFeedbackEmptyState
        v-else-if="!product"
        :title="t('productDetail.notFound.title')"
        :message="t('productDetail.notFound.message')"
        :action-label="t('productDetail.actions.viewAllProducts')"
        action-to="/products"
        tone="warning"
      />

      <template v-else>
        <article
          class="grid gap-8 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1fr)] lg:items-start"
        >
          <section
            class="min-w-0"
            :aria-labelledby="'product-detail-media-title'"
          >
            <h2 id="product-detail-media-title" class="sr-only">
              {{ t("productDetail.gallery.title") }}
            </h2>

            <div v-if="media.length" class="flex flex-col gap-4">
              <div class="relative">
                <SharedCatalogProductImageCarousel
                  v-model:activeIndex="activeMediaIndex"
                  :images="media"
                  ratio="1/1"
                  contain
                >
                  <template #badge>
                    <span
                      class="rounded-xl bg-brand-cyan-light px-3 py-1 text-xs font-medium text-blue-normal"
                    >
                      {{ conditionLabels[product.condition] }}
                    </span>
                  </template>
                </SharedCatalogProductImageCarousel>
              </div>

              <div
                v-if="media.length > 1"
                class="scrollbar-none flex gap-3 overflow-x-auto pb-1"
                role="list"
                :aria-label="t('productDetail.gallery.thumbnails')"
              >
                <button
                  v-for="(image, index) in media"
                  :key="image.id"
                  type="button"
                  :class="[
                    'relative size-20 shrink-0 overflow-hidden rounded-sm border bg-grey-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal sm:size-24',
                    index === activeMediaIndex
                      ? 'border-blue-normal'
                      : 'border-grey-normal-hover hover:border-blue-light-active',
                  ]"
                  :aria-pressed="index === activeMediaIndex"
                  :aria-label="
                    t('productDetail.gallery.thumbnailLabel', {
                      index: index + 1,
                    })
                  "
                  role="listitem"
                  @click="selectMedia(index)"
                >
                  <img
                    :src="image.url"
                    :alt="image.alt ?? product.title"
                    class="size-full object-contain"
                    loading="lazy"
                  />
                </button>
              </div>
            </div>

            <div
              v-else
              class="rounded-md border border-grey-normal-hover bg-grey-light-active"
            >
              <SharedFeedbackEmptyState
                :title="t('productDetail.gallery.emptyTitle')"
                :message="t('productDetail.gallery.emptyMessage')"
                variant="inline"
                tone="neutral"
              />
            </div>
          </section>

          <section class="flex min-w-0 flex-col gap-6 text-start">
            <div class="flex flex-col gap-3">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="rounded-xl bg-grey-normal px-3 py-1 text-xs font-medium text-grey-darker"
                  >
                    {{ listingLabel }}
                  </span>
                  <span
                    class="rounded-xl bg-blue-light px-3 py-1 text-xs font-medium text-blue-normal"
                  >
                    {{ priceTypeLabel }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <BaseIconButton
                    :ariaLabel="t('product.addFavorite')"
                    :to="localePath('/auth/login')"
                    variant="ghost"
                  >
                    <template #icon>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M10 16.5S4.2 13.2 4.2 8.9a3.2 3.2 0 0 1 5.8-1.8 3.2 3.2 0 0 1 5.8 1.8c0 4.3-5.8 7.6-5.8 7.6Z"
                          stroke="currentColor"
                          stroke-width="1.4"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </template>
                  </BaseIconButton>
                </div>
              </div>

              <h1
                class="text-2xl font-bold leading-tight text-black-normal-hover sm:text-3xl"
              >
                {{ product.title }}
              </h1>

              <div
                class="flex flex-wrap items-center gap-2 text-sm text-grey-darker"
                :aria-label="ratingAriaLabel(product.rating)"
              >
                <span class="flex items-center gap-0.5 text-blue-normal">
                  <svg
                    v-for="index in 5"
                    :key="index"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    :fill="index <= Math.round(product.rating) ? 'currentColor' : 'none'"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.2l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z"
                      stroke="currentColor"
                      stroke-width="1.2"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span>{{ t("productDetail.rating.value", { rating: product.rating }) }}</span>
              </div>
            </div>

            <section
              class="border-b border-grey-normal pb-5"
              :aria-labelledby="'product-description-title'"
            >
              <h2
                id="product-description-title"
                class="text-lg font-medium text-black-normal-hover"
              >
                {{ t("productDetail.description.title") }}
              </h2>
              <p
                :class="[
                  'mt-2 whitespace-pre-line text-base leading-7 text-grey-darker',
                  hasLongDescription && !descriptionExpanded
                    ? 'line-clamp-2'
                    : '',
                ]"
              >
                {{ shownDescription }}
              </p>
              <button
                v-if="hasLongDescription"
                type="button"
                class="mt-2 text-sm font-medium text-blue-normal underline underline-offset-2 transition-colors hover:text-blue-normal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
                @click="descriptionExpanded = !descriptionExpanded"
              >
                {{
                  descriptionExpanded
                    ? t("productDetail.description.showLess")
                    : t("productDetail.description.readMore")
                }}
              </button>
            </section>

            <div
              v-if="isUnavailable"
              class="rounded-md border border-status-pending-text/40 bg-status-pending-bg p-4 text-sm leading-6 text-black-normal"
              role="status"
            >
              {{ t("productDetail.unavailable.message") }}
            </div>

            <div class="flex flex-col gap-4">
              <div
                class="flex flex-wrap items-center justify-between gap-4 border-b border-grey-normal pb-5"
              >
                <SharedMoneyAmount
                  :amount="product.price.amount"
                  :currency="product.price.currency"
                  :maximum-fraction-digits="0"
                  size="lg"
                  weight="bold"
                  class="text-3xl text-blue-normal"
                />

                <BaseButton
                  :to="isUnavailable ? undefined : localePath('/auth/login')"
                  :disabled="isUnavailable"
                  size="lg"
                  class="min-w-[220px] bg-blue-normal! text-grey-light! hover:bg-blue-normal-hover!"
                >
                  <template #icon>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5.25 8.25h7.5M9 4.5V12"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                      <path
                        d="M4.5 15h9a1.5 1.5 0 0 0 1.5-1.5V7.8a1.5 1.5 0 0 0-.43-1.05L12.75 4.9A1.5 1.5 0 0 0 11.68 4.5H6.32a1.5 1.5 0 0 0-1.07.44L3.43 6.75A1.5 1.5 0 0 0 3 7.8v5.7A1.5 1.5 0 0 0 4.5 15Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </template>
                  {{ actionLabel }}
                </BaseButton>
              </div>

              <dl class="grid gap-3 sm:grid-cols-2">
                <div
                  v-for="attribute in productAttributes"
                  :key="attribute.key"
                  class="rounded-sm bg-grey-normal px-4 py-3"
                >
                  <dt class="text-xs font-medium text-grey-dark-active">
                    {{ attribute.label }}
                  </dt>
                  <dd class="mt-1 text-sm font-medium text-black-normal">
                    {{ attribute.value }}
                  </dd>
                </div>
              </dl>
            </div>

            <section
              v-if="seller"
              class="rounded-md border border-grey-normal-hover p-4"
              :aria-labelledby="'product-seller-title'"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="seller.avatar"
                  :alt="t('productDetail.seller.avatarAlt', { seller: seller.name })"
                  class="size-14 rounded-sm object-cover"
                  loading="lazy"
                />
                <div class="min-w-0 flex-1">
                  <h2
                    id="product-seller-title"
                    class="flex flex-wrap items-center gap-2 text-base font-medium text-black-normal-hover"
                  >
                    <span>{{ seller.name }}</span>
                    <span
                      v-if="seller.verified"
                      class="inline-flex items-center gap-1 rounded-xl bg-brand-cyan-light px-2 py-0.5 text-xs text-blue-normal"
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
                          d="m5.8 9.5-2-2 1-1 1 1 3.4-3.4 1 1-4.4 4.4Z"
                          fill="currentColor"
                        />
                        <path
                          d="M7 1.5 8.2 3l1.9-.2.5 1.8 1.6.9-.8 1.7.8 1.7-1.6.9-.5 1.8-1.9-.2L7 12.5l-1.2-1.5-1.9.2-.5-1.8-1.6-.9.8-1.7-.8-1.7 1.6-.9.5-1.8 1.9.2L7 1.5Z"
                          stroke="currentColor"
                          stroke-width="1.1"
                          stroke-linejoin="round"
                        />
                      </svg>
                      {{ t("productDetail.seller.verified") }}
                    </span>
                  </h2>
                  <p class="mt-1 text-sm text-grey-darker">
                    {{ seller.location }}
                  </p>
                </div>
              </div>

              <dl class="mt-4 grid gap-3 sm:grid-cols-3">
                <div
                  v-for="metric in sellerMetrics"
                  :key="metric.key"
                  class="rounded-sm bg-grey-light-active px-3 py-2"
                >
                  <dt class="text-xs text-grey-dark-active">
                    {{ metric.label }}
                  </dt>
                  <dd class="mt-1 text-sm font-medium text-black-normal">
                    {{ metric.value }}
                  </dd>
                </div>
              </dl>
            </section>
          </section>
        </article>

        <section
          class="mt-10 border-t border-grey-normal pt-8 lg:mt-12"
          :aria-labelledby="'product-reviews-title'"
        >
          <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="product-reviews-title"
                class="text-2xl font-medium text-black-normal-hover"
              >
                {{ t("productDetail.reviews.title") }}
              </h2>
              <p class="mt-1 text-sm text-grey-darker">
                {{ t("productDetail.reviews.summary", { rating: product.rating }) }}
              </p>
            </div>
            <span class="text-sm text-grey-darker">
              {{ t("productDetail.reviews.count", { count: reviews.length }) }}
            </span>
          </div>

          <div v-if="reviews.length" class="grid gap-4 lg:grid-cols-2">
            <article
              v-for="review in reviews"
              :key="review.id"
              class="rounded-md border border-grey-normal-hover p-4"
            >
              <div class="flex items-start gap-3">
                <img
                  :src="review.authorAvatar"
                  :alt="t('productDetail.reviews.authorAvatarAlt', { author: review.authorName })"
                  class="size-10 rounded-full object-cover"
                  loading="lazy"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="font-medium text-black-normal">
                      {{ review.authorName }}
                    </h3>
                    <time
                      class="text-xs text-grey-dark-active"
                      :datetime="review.createdAt"
                    >
                      {{ formattedReviewDate(review.createdAt) }}
                    </time>
                  </div>
                  <div
                    class="mt-1 flex items-center gap-0.5 text-blue-normal"
                    :aria-label="ratingAriaLabel(review.rating)"
                  >
                    <svg
                      v-for="index in 5"
                      :key="index"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      :fill="index <= Math.round(review.rating) ? 'currentColor' : 'none'"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.2l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <p class="mt-3 text-sm leading-6 text-grey-darker">
                    {{ review.comment }}
                  </p>
                </div>
              </div>
            </article>
          </div>

          <SharedFeedbackEmptyState
            v-else
            :title="t('productDetail.reviews.emptyTitle')"
            :message="t('productDetail.reviews.emptyMessage')"
            variant="inline"
            tone="neutral"
          />
        </section>

        <section
          class="mt-10 border-t border-grey-normal pt-8 lg:mt-12"
          :aria-labelledby="'related-products-title'"
        >
          <header class="mb-5 flex items-center justify-between gap-4">
            <h2
              id="related-products-title"
              class="min-w-0 text-2xl font-medium text-black-normal-hover"
            >
              {{ t("productDetail.related.title") }}
            </h2>
          </header>

          <div
            v-if="loading"
            class="scrollbar-none -mx-4 flex gap-6 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0"
          >
            <SharedCatalogProductCard
              v-for="card in loadingCards"
              :key="card"
              loading
              class="w-[min(82vw,326px)] shrink-0 md:w-[326px]"
            />
          </div>

          <div
            v-else-if="relatedProducts.length"
            class="scrollbar-none -mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0"
          >
            <SharedCatalogProductCard
              v-for="relatedProduct in relatedProducts"
              :key="relatedProduct.id"
              :product="relatedProduct"
              :to="productCardTo(relatedProduct)"
              :condition-label="conditionLabels[relatedProduct.condition]"
              :listing-label="listingLabel"
              show-favorite
              class="w-[min(82vw,326px)] shrink-0 snap-start md:w-[326px]"
              @favorite="handleFavorite"
            />
          </div>

          <SharedFeedbackEmptyState
            v-else
            :title="t('productDetail.related.emptyTitle')"
            :message="t('productDetail.related.emptyMessage')"
            variant="inline"
            tone="neutral"
          />
        </section>
      </template>
    </section>
  </main>
</template>
