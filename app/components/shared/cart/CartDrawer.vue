<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();
const cartStore = useCartStore();

const updating = ref<number | null>(null);
const collapsedSellerIds = ref<number[]>([]);
const summaryOpen = ref(true);

const deliveryBase = new Date();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function deliveryLabel(index: number) {
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale.value === "ar" ? "ar-SA" : "en-US", {
      month: "long",
      day: "numeric",
    });
  return t("cart.delivery.range", {
    start: fmt(addDays(deliveryBase, 3 + index)),
    end: fmt(addDays(deliveryBase, 5 + index)),
  });
}

function isCollapsed(sellerId: number) {
  return collapsedSellerIds.value.includes(sellerId);
}

function toggleSeller(sellerId: number) {
  if (isCollapsed(sellerId)) {
    collapsedSellerIds.value = collapsedSellerIds.value.filter(
      (id) => id !== sellerId,
    );
  } else {
    collapsedSellerIds.value = [...collapsedSellerIds.value, sellerId];
  }
}

async function increment(
  cartItemId: number,
  currentQty: number,
  maxQty: number,
) {
  if (currentQty >= maxQty) return;
  updating.value = cartItemId;
  try {
    await cartStore.updateCartItem(cartItemId, currentQty + 1);
  } finally {
    updating.value = null;
  }
}

async function decrement(cartItemId: number, currentQty: number) {
  updating.value = cartItemId;
  try {
    if (currentQty <= 1) {
      await cartStore.deleteCartItem(cartItemId);
    } else {
      await cartStore.updateCartItem(cartItemId, currentQty - 1);
    }
  } finally {
    updating.value = null;
  }
}

async function removeItem(cartItemId: number) {
  updating.value = cartItemId;
  try {
    await cartStore.deleteCartItem(cartItemId);
  } finally {
    updating.value = null;
  }
}

function goToCheckout() {
  cartStore.closeCart();
  navigateTo(localePath("/checkout"));
}

watch(
  () => cartStore.open,
  (open) => {
    if (open && !cartStore.cart && !cartStore.loading) {
      cartStore.fetchCart();
    }
  },
);
</script>

<template>
  <BaseDrawer
    :open="cartStore.open"
    side="start"
    :title="t('cart.title')"
    :close-label="t('common.close')"
    header-class="!border-b-0 !px-4 !py-5 sm:!px-6"
    body-class="!px-4 !py-0 sm:!px-6"
    footer-class="!border-t-0 !px-4 !pb-5 !pt-3 sm:!px-6"
    panel-class="bg-white !w-full sm:!w-[480px] !max-w-full  my-8 sm:my-20"
    @update:open="(v) => !v && cartStore.closeCart()"
  >
    <!-- Loading -->
    <div
      v-if="cartStore.loading"
      class="flex min-h-130 flex-col gap-5 py-2"
      role="status"
      :aria-label="t('cart.loading.title')"
    >
      <BaseSkeleton variant="text" width="w-2/5" />
      <div class="flex flex-col gap-4">
        <div
          v-for="i in 3"
          :key="i"
          class="rounded-md border border-grey-normal p-4"
        >
          <div class="flex items-center gap-3">
            <BaseSkeleton variant="circle" width="w-12" height="h-12" />
            <div class="flex flex-1 flex-col gap-2">
              <BaseSkeleton variant="text" width="w-2/3" />
              <BaseSkeleton variant="text" width="w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <SharedFeedbackEmptyState
      v-else-if="!cartStore.cart || !cartStore.cart.sellers.length"
      :title="t('cart.empty.title')"
      :message="t('cart.empty.message')"
      :action-label="t('cart.actions.browseProducts')"
      action-to="/products"
      variant="modal"
      tone="brand"
      class="min-h-130"
      @action="cartStore.closeCart()"
    />

    <!-- Cart content -->
    <div v-else class="flex min-h-130 flex-col gap-5 pb-5">
      <div class="flex flex-col gap-3">
        <section
          v-for="(seller, sellerIndex) in cartStore.cart.sellers"
          :key="seller.seller_id"
          class="border-t border-grey-normal pt-4 first:border-t-0 first:pt-0"
          :aria-labelledby="`cart-seller-${seller.seller_id}`"
        >
          <!-- Seller header -->
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <img
                v-if="seller.store_image"
                :src="seller.store_image"
                :alt="t('cart.seller.avatarAlt', { seller: seller.store_name })"
                class="size-12 shrink-0 rounded-full bg-grey-normal object-cover"
              />
              <div
                v-else
                class="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-light text-sm font-bold text-blue-normal"
              >
                {{ seller.store_name.charAt(0) }}
              </div>
              <div class="min-w-0 text-start">
                <div class="flex flex-wrap items-center gap-1">
                  <h3
                    :id="`cart-seller-${seller.seller_id}`"
                    class="truncate text-sm font-medium text-black-normal-hover"
                  >
                    {{ seller.store_name }}
                  </h3>
                  <span class="text-xs font-light text-black-lighter">
                    ({{
                      t("cart.seller.itemCount", {
                        count: seller.total_quantity,
                      })
                    }})
                  </span>
                </div>
                <p class="text-xs leading-5 text-black-lighter">
                  {{ deliveryLabel(sellerIndex) }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex size-8 shrink-0 items-center justify-center rounded-sm text-grey-dark-active transition-colors hover:bg-grey-normal hover:text-black-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
              :aria-label="
                t('cart.actions.toggleSeller', { seller: seller.store_name })
              "
              :aria-expanded="!isCollapsed(seller.seller_id)"
              @click="toggleSeller(seller.seller_id)"
            >
              <svg
                v-if="isCollapsed(seller.seller_id)"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M9 4v10M4 9h10"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <svg
                v-else
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 9h10"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Items -->
          <div
            v-if="!isCollapsed(seller.seller_id)"
            class="mt-4 flex flex-col gap-4"
          >
            <article
              v-for="item in seller.items"
              :key="item.cart_item_id"
              :class="[
                'flex gap-3 rounded-sm bg-white transition-opacity',
                updating === item.cart_item_id ? 'opacity-60' : '',
              ]"
              :aria-busy="updating === item.cart_item_id || undefined"
            >
              <NuxtLink
                :to="localePath(`/products/${item.product_data.id}`)"
                class="relative h-27 w-21 shrink-0 overflow-hidden rounded-sm bg-grey-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
                @click="cartStore.closeCart()"
              >
                <img
                  v-if="item.product_data.cover"
                  :src="item.product_data.cover"
                  :alt="item.product_data.product_name"
                  class="size-full object-contain"
                  loading="lazy"
                />
                <span
                  class="absolute inset-e-1 top-1 rounded-full bg-brand-cyan-light px-2 py-0.5 text-[10px] leading-4 text-blue-normal"
                >
                  {{ item.product_data.status_trans }}
                </span>
              </NuxtLink>

              <div class="flex min-w-0 flex-1 flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 text-start">
                    <NuxtLink
                      :to="localePath(`/products/${item.product_data.id}`)"
                      class="line-clamp-2 text-sm font-medium leading-5 text-black-normal transition-colors hover:text-blue-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
                      @click="cartStore.closeCart()"
                    >
                      {{ item.product_data.product_name }}
                    </NuxtLink>
                    <SharedMoneyAmount
                      :amount="item.unit_price"
                      currency="SAR"
                      :maximum-fraction-digits="0"
                      size="sm"
                      weight="normal"
                      class="mt-1 text-grey-dark-hover"
                    />
                  </div>

                  <button
                    type="button"
                    class="flex size-8 shrink-0 items-center justify-center rounded-sm text-black-lighter transition-colors hover:bg-grey-normal hover:text-status-canceled-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
                    :aria-label="
                      t('cart.actions.removeItem', {
                        product: item.product_data.product_name,
                      })
                    "
                    :disabled="updating === item.cart_item_id"
                    @click="removeItem(item.cart_item_id)"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 5h10M7 5V3.75h4V5m-5.5 2v7m3.5-7v7m3.5-7v7M5 5l.5 10h7L13 5"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Quantity stepper -->
                <div class="flex items-center gap-3">
                  <div
                    class="inline-flex h-8 shrink-0 items-center overflow-hidden rounded-sm border border-grey-normal bg-grey-normal"
                  >
                    <button
                      type="button"
                      class="flex size-8 items-center justify-center bg-white text-grey-dark-active transition-colors hover:text-black-normal disabled:cursor-not-allowed disabled:opacity-40"
                      :aria-label="
                        t('cart.actions.decreaseQuantity', {
                          product: item.product_data.product_name,
                        })
                      "
                      :disabled="updating === item.cart_item_id"
                      @click="decrement(item.cart_item_id, item.quantity)"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 8h8"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                    <span
                      class="flex min-w-8 items-center justify-center px-2 text-sm text-black-normal-hover"
                    >
                      {{ item.quantity }}
                    </span>
                    <button
                      type="button"
                      class="flex size-8 items-center justify-center bg-white text-grey-dark-active transition-colors hover:text-black-normal disabled:cursor-not-allowed disabled:opacity-40"
                      :aria-label="
                        t('cart.actions.increaseQuantity', {
                          product: item.product_data.product_name,
                        })
                      "
                      :disabled="
                        updating === item.cart_item_id ||
                        item.quantity >= item.product_data.quantity
                      "
                      @click="
                        increment(
                          item.cart_item_id,
                          item.quantity,
                          item.product_data.quantity,
                        )
                      "
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 4v8M4 8h8"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <!-- Seller totals -->
            <dl class="flex flex-col gap-2 border-t border-grey-normal pt-3">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-sm text-black-light-active">
                  {{ t("cart.summary.serviceFee") }}
                </dt>
                <dd>
                  <SharedMoneyAmount
                    :amount="seller.service_fee"
                    currency="SAR"
                    :maximum-fraction-digits="0"
                    size="sm"
                    weight="normal"
                    class="text-black-normal-hover"
                  />
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-sm font-medium text-black-normal-hover">
                  {{ t("cart.summary.sellerSubtotal") }}
                </dt>
                <dd>
                  <SharedMoneyAmount
                    :amount="seller.total_price"
                    currency="SAR"
                    :maximum-fraction-digits="0"
                    size="md"
                    weight="bold"
                    class="text-brand-cyan-active"
                  />
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <!-- Order summary -->
      <section
        class="mt-auto border-t border-grey-normal pt-5"
        aria-labelledby="cart-order-summary-title"
      >
        <h3
          id="cart-order-summary-title"
          class="mb-3 text-sm font-medium text-black-normal-hover"
        >
          {{ t("cart.summary.title") }}
        </h3>
        <div class="rounded-md bg-grey-normal p-3">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-sm text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
            :aria-expanded="summaryOpen"
            :aria-label="t('cart.actions.toggleSummary')"
            @click="summaryOpen = !summaryOpen"
          >
            <span class="text-sm font-light text-black-light-active">
              {{
                t("cart.summary.totalProducts", { count: cartStore.totalItems })
              }}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              :class="[
                'text-black-normal transition-transform',
                summaryOpen ? 'rotate-180' : '',
              ]"
              aria-hidden="true"
            >
              <path
                d="m4 6 4 4 4-4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <dl v-if="summaryOpen" class="mt-3 flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-sm text-black-light-active">
                {{ t("cart.summary.serviceFee") }}
              </dt>
              <dd>
                <SharedMoneyAmount
                  :amount="cartStore.cart.service_fee"
                  currency="SAR"
                  :maximum-fraction-digits="0"
                  size="sm"
                  weight="normal"
                  class="text-black-normal-hover"
                />
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-sm font-medium text-black-normal-hover">
                {{ t("cart.summary.total") }}
              </dt>
              <dd>
                <SharedMoneyAmount
                  :amount="cartStore.totalPrice"
                  currency="SAR"
                  :maximum-fraction-digits="0"
                  size="md"
                  weight="bold"
                  class="text-brand-cyan-active"
                />
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>

    <template #footer>
      <div
        v-if="
          !cartStore.loading && cartStore.cart && cartStore.cart.sellers.length
        "
        class="flex flex-col gap-4"
      >
        <p
          class="rounded-sm bg-status-pending-bg px-3 py-1 text-center text-sm leading-5 text-black-light-active"
        >
          {{ t("cart.shippingNotice") }}
        </p>
        <BaseButton
          full-width
          size="lg"
          class="bg-blue-normal! text-grey-light! hover:bg-blue-normal-hover!"
          @click="goToCheckout"
        >
          {{ t("cart.actions.completePurchase") }}
        </BaseButton>
      </div>
    </template>
  </BaseDrawer>
</template>
