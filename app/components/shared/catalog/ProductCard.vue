<script setup lang="ts">
import type { Product, ProductMedia } from "~/types/product";

type ProductCardVariant = "grid" | "compact" | "sellerManage" | "boost";

interface ProductMetric {
  label: string;
  value: string | number;
}

interface Props {
  product?: Product;
  variant?: ProductCardVariant;
  to?: string;
  favorite?: boolean;
  showFavorite?: boolean;
  showSeller?: boolean;
  showStatus?: boolean;
  showPriceType?: boolean;
  conditionLabel?: string;
  listingLabel?: string;
  sellerName?: string;
  sellerTo?: string;
  metrics?: ProductMetric[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "grid",
  favorite: false,
  showFavorite: undefined,
  showSeller: false,
  showStatus: false,
  showPriceType: true,
  conditionLabel: undefined,
  listingLabel: undefined,
  sellerName: undefined,
  sellerTo: undefined,
  metrics: () => [],
  loading: false,
});

const emit = defineEmits<{
  favorite: [product: Product];
}>();

const { t } = useI18n();
const localePath = useLocalePath();

const coverImage = computed<ProductMedia | undefined>(
  () =>
    props.product?.media.find((item) => item.isCover) ??
    props.product?.media[0],
);

const resolvedTo = computed(() => {
  if (!props.product) return undefined;
  if (props.to) return localePath(props.to);

  const base =
    props.variant === "sellerManage" || props.variant === "boost"
      ? "/seller/products"
      : "/products";

  return localePath(`${base}/${props.product.id}`);
});

const shouldShowFavorite = computed(
  () =>
    props.showFavorite ?? !["sellerManage", "boost"].includes(props.variant),
);

const imageClasses = computed(() => [
  "relative overflow-hidden bg-grey-light-active",
  props.variant === "compact"
    ? "h-full min-h-[132px] rounded-sm"
    : "h-[260px] rounded-t-md",
]);

const cardClasses = computed(() => [
  "group relative overflow-hidden rounded-md bg-white transition-colors",
  props.variant === "compact"
    ? "grid grid-cols-[132px_minmax(0,1fr)] gap-3 border border-grey-normal-hover p-3"
    : "flex flex-col",
  props.variant === "sellerManage" ? "border border-grey-normal-hover" : "",
]);

const priceTypeLabel = computed(() => {
  if (!props.product) return "";
  return props.product.priceType === "negotiable"
    ? t("product.priceType.negotiable")
    : t("product.priceType.fixed");
});

const defaultConditionLabel = computed(
  () => props.conditionLabel ?? t("product.condition.new"),
);
const defaultListingLabel = computed(
  () => props.listingLabel ?? t("product.listingType.ad"),
);

function onFavorite() {
  if (props.product) emit("favorite", props.product);
}
</script>

<template>
  <article :class="cardClasses">
    <template v-if="loading">
      <BaseSkeleton
        :height="variant === 'compact' ? 'h-full min-h-[132px]' : 'h-[260px]'"
      />
      <div class="flex flex-col gap-2 p-3">
        <BaseSkeleton variant="text" />
        <BaseSkeleton variant="text" width="w-1/2" />
        <BaseSkeleton height="h-6" width="w-20" />
      </div>
    </template>

    <template v-else-if="product">
      <div :class="imageClasses">
        <NuxtLink
          v-if="resolvedTo"
          :to="resolvedTo"
          class="block size-full"
          :aria-label="product.title"
        >
          <slot name="image" :product="product" :image="coverImage">
            <img
              v-if="coverImage"
              :src="coverImage.url"
              :alt="coverImage.alt ?? product.title"
              class="size-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div
              v-else
              class="flex size-full items-center justify-center text-grey-dark-active"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="7"
                  y="9"
                  width="26"
                  height="22"
                  rx="3"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="m10 27 7-7 5 5 3-3 5 5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="25.5"
                  cy="16.5"
                  r="2.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </div>
          </slot>
        </NuxtLink>

        <div v-else class="size-full">
          <slot name="image" :product="product" :image="coverImage" />
        </div>

        <button
          v-if="shouldShowFavorite"
          type="button"
          class="absolute left-2 top-2 flex size-10 items-center justify-center rounded-full bg-white/70 text-blue-light-active backdrop-blur transition-colors hover:text-brand-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
          :class="favorite ? 'text-brand-cyan' : ''"
          :aria-pressed="favorite"
          :aria-label="
            favorite ? t('product.removeFavorite') : t('product.addFavorite')
          "
          @click.stop.prevent="onFavorite"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            :fill="favorite ? 'currentColor' : 'none'"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 20s-7-4-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5-7 9-7 9Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div class="absolute right-2 top-2 flex flex-col items-end gap-1">
          <slot name="badges" :product="product">
            <span
              class="rounded-xl bg-brand-cyan-light px-2 py-0.5 text-xs leading-4 text-blue-normal"
            >
              {{ defaultConditionLabel }}
            </span>
          </slot>
        </div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col items-end gap-2 p-3 text-end">
        <NuxtLink
          v-if="resolvedTo"
          :to="resolvedTo"
          class="w-full text-sm leading-4 text-black-normal transition-colors hover:text-blue-normal"
        >
          <span class="line-clamp-2">{{ product.title }}</span>
        </NuxtLink>
        <h3 v-else class="w-full text-sm leading-4 text-black-normal">
          <span class="line-clamp-2">{{ product.title }}</span>
        </h3>

        <div
          class="flex w-full flex-wrap items-center justify-end gap-2 text-sm text-grey-dark-hover"
        >
          <span v-if="showPriceType">{{ priceTypeLabel }}</span>

          <NuxtLink
            v-if="showSeller && sellerName && sellerTo"
            :to="localePath(sellerTo)"
            class="hover:text-blue-normal"
          >
            {{ sellerName }}
          </NuxtLink>
          <span v-else-if="showSeller && sellerName">{{ sellerName }}</span>
        </div>

        <div class="flex w-full items-end justify-between gap-3">
          <SharedStatusBadge
            v-if="showStatus && product.status"
            :status="product.status"
            size="sm"
          />

          <div class="ms-auto flex flex-col items-end gap-1">
            <SharedMoneyAmount
              :amount="product.price.amount"
              :currency="product.price.currency"
              :maximum-fraction-digits="0"
              weight="bold"
              class="text-blue-normal"
            />
            <span
              class="rounded-xl bg-grey-normal px-2 py-0.5 text-xs leading-4 text-grey-darker"
            >
              {{ defaultListingLabel }}
            </span>
          </div>
        </div>

        <dl
          v-if="metrics.length"
          class="grid w-full grid-cols-2 gap-2 pt-1 text-xs text-grey-darker"
        >
          <div
            v-for="metric in metrics"
            :key="metric.label"
            class="rounded-xs bg-grey-normal px-2 py-1"
          >
            <dt class="truncate">{{ metric.label }}</dt>
            <dd class="font-medium text-black-normal">{{ metric.value }}</dd>
          </div>
        </dl>

        <div v-if="$slots.actions" class="w-full pt-1">
          <slot name="actions" :product="product" />
        </div>
      </div>
    </template>

    <div
      v-else
      class="flex min-h-[220px] items-center justify-center p-4 text-sm text-grey-dark-active"
    >
      {{ t("common.empty") }}
    </div>
  </article>
</template>
