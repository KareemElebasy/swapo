<script setup lang="ts">
import type { DemoCartItem, DemoCartSellerGroup } from '~/composables/useDemoCart'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { conditionLabels } = useProductCatalog()
const {
  itemCount,
  loading,
  sellerGroups,
  serviceFee,
  serviceFeePerSeller,
  total,
  setLoaded,
  updateQuantity,
  removeItem,
} = useDemoCart()

const collapsedSellerIds = ref<string[]>([])
const summaryOpen = ref(true)
const activeItemId = ref<string | null>(null)
const liveMessage = ref('')
const deliveryBaseDate = useState<string>(
  'demo-cart-delivery-base-date',
  () => new Date().toISOString(),
)

let loadingTimer: number | undefined

const isEmpty = computed(() => !loading.value && itemCount.value === 0)

onMounted(() => {
  if (!loading.value) return

  loadingTimer = window.setTimeout(() => {
    setLoaded()
  }, 250)
})

onUnmounted(() => {
  if (loadingTimer) {
    window.clearTimeout(loadingTimer)
  }
})

function closeDrawer() {
  emit('update:open', false)
  emit('close')
}

function onOpenChange(value: boolean) {
  emit('update:open', value)
  if (!value) {
    emit('close')
  }
}

function isSellerCollapsed(sellerId: string) {
  return collapsedSellerIds.value.includes(sellerId)
}

function toggleSeller(sellerId: string) {
  if (isSellerCollapsed(sellerId)) {
    collapsedSellerIds.value = collapsedSellerIds.value.filter(
      (id) => id !== sellerId,
    )
    return
  }

  collapsedSellerIds.value = [...collapsedSellerIds.value, sellerId]
}

function setItemBusy(itemId: string) {
  activeItemId.value = itemId
  window.setTimeout(() => {
    if (activeItemId.value === itemId) {
      activeItemId.value = null
    }
  }, 180)
}

function changeQuantity(item: DemoCartItem, quantity: number) {
  updateQuantity(item.id, quantity)
  setItemBusy(item.id)
  liveMessage.value = t('cart.status.quantityUpdated', {
    product: item.product.title,
  })
}

function removeCartItem(item: DemoCartItem) {
  removeItem(item.id)
  setItemBusy(item.id)
  liveMessage.value = t('cart.status.removed', {
    product: item.product.title,
  })
}

function addDays(value: Date, days: number) {
  const next = new Date(value)
  next.setDate(next.getDate() + days)
  return next
}

function deliveryLabel(index: number) {
  const base = new Date(deliveryBaseDate.value)
  const start = addDays(base, 3 + index)
  const end = addDays(base, 5 + index)

  return t('cart.delivery.range', {
    start: formatDate(start, {
      locale: locale.value,
      month: 'long',
      day: 'numeric',
    }),
    end: formatDate(end, {
      locale: locale.value,
      month: 'long',
      day: 'numeric',
    }),
  })
}

function sellerToggleLabel(group: DemoCartSellerGroup) {
  return t('cart.actions.toggleSeller', {
    seller: group.seller.name,
  })
}

function productImage(item: DemoCartItem) {
  return item.product.media.find((media) => media.isCover)?.url
    ?? item.product.media[0]?.url
}
</script>

<template>
  <BaseDrawer
    :open="open"
    side="end"
    :title="t('cart.title')"
    :close-label="t('common.close')"
    header-class="!border-b-0 !px-4 !py-5 sm:!px-6"
    body-class="!px-4 !py-0 sm:!px-6"
    footer-class="!border-t-0 !px-4 !pb-4 !pt-4 sm:!px-6"
    panel-class="bg-white !w-full sm:!w-[560px] !max-w-full !rounded-s-lg"
    @update:open="onOpenChange"
  >
    <p class="sr-only" aria-live="polite">
      {{ liveMessage }}
    </p>

    <div
      v-if="loading"
      class="flex min-h-[520px] flex-col gap-5 py-2"
      role="status"
      :aria-label="t('cart.loading.title')"
    >
      <BaseSkeleton variant="text" width="w-2/5" />
      <div class="flex flex-col gap-4">
        <div
          v-for="index in 3"
          :key="index"
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

    <SharedFeedbackEmptyState
      v-else-if="isEmpty"
      :title="t('cart.empty.title')"
      :message="t('cart.empty.message')"
      :action-label="t('cart.actions.browseProducts')"
      action-to="/products"
      variant="modal"
      tone="brand"
      class="min-h-[520px]"
      @action="closeDrawer"
    />

    <div v-else class="flex min-h-[520px] flex-col gap-5 pb-5">
      <div class="flex flex-col gap-3">
        <section
          v-for="(group, groupIndex) in sellerGroups"
          :key="group.seller.id"
          class="border-t border-grey-normal pt-4 first:border-t-0 first:pt-0"
          :aria-labelledby="`cart-seller-${group.seller.id}`"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <img
                :src="group.seller.avatar"
                :alt="t('cart.seller.avatarAlt', { seller: group.seller.name })"
                class="size-12 shrink-0 rounded-full bg-grey-normal object-cover"
              />
              <div class="min-w-0 text-start">
                <div class="flex flex-wrap items-center gap-1">
                  <h3
                    :id="`cart-seller-${group.seller.id}`"
                    class="truncate text-sm font-medium text-black-normal-hover"
                  >
                    {{ group.seller.name }}
                  </h3>
                  <span class="text-xs font-light text-black-lighter">
                    ({{ t('cart.seller.itemCount', { count: group.itemCount }) }})
                  </span>
                </div>
                <p class="text-xs leading-5 text-black-lighter">
                  {{ deliveryLabel(groupIndex) }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex size-8 shrink-0 items-center justify-center rounded-sm text-grey-dark-active transition-colors hover:bg-grey-normal hover:text-black-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
              :aria-label="sellerToggleLabel(group)"
              :aria-expanded="!isSellerCollapsed(group.seller.id)"
              @click="toggleSeller(group.seller.id)"
            >
              <svg
                v-if="isSellerCollapsed(group.seller.id)"
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

          <div
            v-if="!isSellerCollapsed(group.seller.id)"
            class="mt-4 flex flex-col gap-4"
          >
            <article
              v-for="item in group.items"
              :key="item.id"
              :class="[
                'flex gap-3 rounded-sm bg-white transition-opacity',
                activeItemId === item.id ? 'opacity-60' : '',
              ]"
              :aria-busy="activeItemId === item.id || undefined"
            >
              <NuxtLink
                :to="localePath(`/products/${item.product.id}`)"
                class="relative h-[108px] w-[84px] shrink-0 overflow-hidden rounded-sm bg-grey-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
                @click="closeDrawer"
              >
                <img
                  v-if="productImage(item)"
                  :src="productImage(item)"
                  :alt="item.product.media[0]?.alt || item.product.title"
                  class="size-full object-contain"
                />
                <span
                  class="absolute end-1 top-1 rounded-full bg-brand-cyan-light px-2 py-0.5 text-[10px] leading-4 text-blue-normal"
                >
                  {{ conditionLabels[item.product.condition] }}
                </span>
              </NuxtLink>

              <div class="flex min-w-0 flex-1 flex-col gap-3">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 text-start">
                    <NuxtLink
                      :to="localePath(`/products/${item.product.id}`)"
                      class="line-clamp-2 text-sm font-medium leading-5 text-black-normal transition-colors hover:text-blue-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
                      @click="closeDrawer"
                    >
                      {{ item.product.title }}
                    </NuxtLink>
                    <SharedMoneyAmount
                      :amount="item.product.price.amount"
                      :currency="item.product.price.currency"
                      :maximum-fraction-digits="0"
                      size="sm"
                      weight="normal"
                      class="mt-1 text-grey-dark-hover"
                    />
                  </div>

                  <button
                    type="button"
                    class="flex size-8 shrink-0 items-center justify-center rounded-sm text-black-lighter transition-colors hover:bg-grey-normal hover:text-status-canceled-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
                    :aria-label="t('cart.actions.removeItem', { product: item.product.title })"
                    :disabled="activeItemId === item.id"
                    @click="removeCartItem(item)"
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

                <div class="flex items-center justify-between gap-3">
                  <span class="sr-only" aria-live="polite">
                    {{ item.quantity }}
                  </span>
                  <div
                    class="inline-flex h-8 shrink-0 items-center overflow-hidden rounded-sm border border-grey-normal bg-grey-normal"
                  >
                    <button
                      type="button"
                      class="flex size-8 items-center justify-center bg-white text-grey-dark-active transition-colors hover:text-black-normal disabled:cursor-not-allowed disabled:opacity-40"
                      :aria-label="t('cart.actions.decreaseQuantity', { product: item.product.title })"
                      :disabled="item.quantity <= 1 || activeItemId === item.id"
                      @click="changeQuantity(item, item.quantity - 1)"
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
                      :aria-label="t('cart.actions.increaseQuantity', { product: item.product.title })"
                      :disabled="activeItemId === item.id"
                      @click="changeQuantity(item, item.quantity + 1)"
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

            <dl class="flex flex-col gap-2 border-t border-grey-normal pt-3">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-sm text-black-light-active">
                  {{ t('cart.summary.serviceFee') }}
                </dt>
                <dd>
                  <SharedMoneyAmount
                    :amount="serviceFeePerSeller.amount"
                    :currency="serviceFeePerSeller.currency"
                    :maximum-fraction-digits="0"
                    size="sm"
                    weight="normal"
                    class="text-black-normal-hover"
                  />
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-sm font-medium text-black-normal-hover">
                  {{ t('cart.summary.sellerSubtotal') }}
                </dt>
                <dd>
                  <SharedMoneyAmount
                    :amount="group.subtotal.amount"
                    :currency="group.subtotal.currency"
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

      <section
        class="mt-auto border-t border-grey-normal pt-5"
        :aria-labelledby="'cart-order-summary-title'"
      >
        <h3
          id="cart-order-summary-title"
          class="mb-3 text-sm font-medium text-black-normal-hover"
        >
          {{ t('cart.summary.title') }}
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
              {{ t('cart.summary.totalProducts', { count: itemCount }) }}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              :class="['text-black-normal transition-transform', summaryOpen ? 'rotate-180' : '']"
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
                {{ t('cart.summary.serviceFee') }}
              </dt>
              <dd>
                <SharedMoneyAmount
                  :amount="serviceFee.amount"
                  :currency="serviceFee.currency"
                  :maximum-fraction-digits="0"
                  size="sm"
                  weight="normal"
                  class="text-black-normal-hover"
                />
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-sm font-medium text-black-normal-hover">
                {{ t('cart.summary.total') }}
              </dt>
              <dd>
                <SharedMoneyAmount
                  :amount="total.amount"
                  :currency="total.currency"
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
      <div v-if="!loading && !isEmpty" class="flex flex-col gap-4">
        <p
          class="rounded-sm bg-status-pending-bg px-3 py-1 text-center text-sm leading-5 text-black-light-active"
        >
          {{ t('cart.shippingNotice') }}
        </p>
        <BaseButton
          :to="localePath('/checkout')"
          full-width
          size="lg"
          class="bg-blue-normal! text-grey-light! hover:bg-blue-normal-hover!"
          @click="closeDrawer"
        >
          {{ t('cart.actions.completePurchase') }}
        </BaseButton>
      </div>
    </template>
  </BaseDrawer>
</template>
