<script setup lang="ts">
import type { ApiProductListItem } from '~/types/api-product'
import type { Product } from '~/types/product'

definePageMeta({ layout: 'public' })

function toProduct(api: ApiProductListItem): Product {
  return {
    id: String(api.id),
    title: api.product_name,
    price: { amount: api.price, currency: 'SAR' },
    priceType: api.ad_type === 'direct' ? 'fixed' : 'negotiable',
    categoryId: '',
    sellerId: String(api.seller_data.id),
    media: api.cover ? [{ id: '0', type: 'image', url: api.cover, isCover: true }] : [],
  }
}

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const authStore = useAuthStore()
const productStore = useProductStore()
const cartStore = useCartStore()
const negotiationStore = useNegotiationStore()

const productId = computed(() => {
  const val = route.params.productId
  return Array.isArray(val) ? val[0]! : (val ?? '')
})

// ── Fetch product ─────────────────────────────────────────────────────────
await productStore.fetchProductDetail(productId.value)

const product = computed(() => productStore.currentProduct)

useHead(() => ({
  title: product.value
    ? t('productDetail.meta.title', { product: product.value.product_name })
    : t('productDetail.meta.notFoundTitle'),
}))

if (import.meta.server && !product.value) {
  setResponseStatus(404)
}

// ── Gallery ───────────────────────────────────────────────────────────────
const activeMediaIndex = ref(0)
const allMedia = computed(() => {
  if (!product.value) return []
  const coverMedia = { id: 0, media_type: 'image', url: product.value.cover }
  const extras = product.value.media.filter(m => m.url !== product.value!.cover)
  return [coverMedia, ...extras]
})

watch(() => productId.value, () => {
  activeMediaIndex.value = 0
})

// ── Description toggle ────────────────────────────────────────────────────
const descExpanded = ref(false)
const hasLongDesc = computed(() => (product.value?.product_desc?.length ?? 0) > 200)

// ── Cart integration ─────────────────────────────────────────────────────
const cartQuantity = ref(1)
const cartLoading = ref(false)

const cartItemForProduct = computed(() => {
  if (!cartStore.cart || !product.value) return null
  for (const seller of cartStore.cart.sellers) {
    const item = seller.items.find(i => i.product_data.id === product.value!.id)
    if (item) return item
  }
  return null
})

onMounted(async () => {
  if (!!authStore.token) {
    await cartStore.fetchCart()
  }
})

async function addToCart() {
  if (!!!authStore.token) {
    navigateTo(localePath('/auth/login'))
    return
  }
  cartLoading.value = true
  try {
    await cartStore.addToCart(product.value!.id, cartQuantity.value)
    cartStore.openCart()
  } finally {
    cartLoading.value = false
  }
}

async function updateCartQty(delta: number) {
  if (!cartItemForProduct.value) return
  const newQty = cartItemForProduct.value.quantity + delta
  if (newQty <= 0) {
    cartLoading.value = true
    try {
      await cartStore.deleteCartItem(cartItemForProduct.value.cart_item_id)
    } finally {
      cartLoading.value = false
    }
    return
  }
  cartLoading.value = true
  try {
    await cartStore.updateCartItem(cartItemForProduct.value.cart_item_id, newQty)
  } finally {
    cartLoading.value = false
  }
}

// ── Negotiation drawer ────────────────────────────────────────────────────
function openNegotiationDrawer() {
  if (!!!authStore.token) {
    navigateTo(localePath('/auth/login'))
    return
  }
  if (!product.value) return
  if (product.value.is_negotiating) {
    negotiationStore.openChatDrawer(product.value)
  } else {
    negotiationStore.openNewOfferDrawer(product.value)
  }
}

// ── Favorite ─────────────────────────────────────────────────────────────
async function toggleFavorite() {
  if (!!!authStore.token) {
    navigateTo(localePath('/auth/login'))
    return
  }
  if (!product.value) return
  await productStore.toggleFavorite(product.value.id)
}

// ── Computed helpers ─────────────────────────────────────────────────────
const isSold = computed(() => product.value?.availability_status === 'sold')
const isDirect = computed(() => product.value?.ad_type === 'direct')
const isNegotiation = computed(() => product.value?.ad_type === 'negotiation')

const ratingStars = computed(() => Math.round(product.value?.average_rate ?? 0))

const breadcrumbs = computed(() => {
  const items: { label: string; to?: string }[] = [
    { label: t('catalog.breadcrumbs.products'), to: '/products' },
  ]
  if (product.value?.category_data) {
    items.push({
      label: product.value.category_data.title,
      to: `/categories/${product.value.category_data.id}`,
    })
  }
  items.push({ label: product.value?.product_name ?? '' })
  return items
})
</script>

<template>
  <main class="min-h-screen bg-white">
    <!-- Breadcrumbs -->
    <section class="border-b border-grey-normal bg-grey-light-active">
      <div class="container-app py-3">
        <SharedNavigationBreadcrumbs :items="breadcrumbs" variant="compact" />
      </div>
    </section>

    <!-- Loading -->
    <div v-if="productStore.detailLoading" class="container-app py-10">
      <div class="grid gap-8 lg:grid-cols-2">
        <BaseSkeleton height="h-[480px]" />
        <div class="flex flex-col gap-4">
          <BaseSkeleton variant="text" width="w-3/4" />
          <BaseSkeleton variant="text" />
          <BaseSkeleton height="h-16" width="w-48" />
          <BaseSkeleton height="h-12" />
          <BaseSkeleton height="h-12" />
        </div>
      </div>
    </div>

    <!-- Not found -->
    <SharedFeedbackEmptyState
      v-else-if="!product"
      :title="t('productDetail.notFound.title')"
      :message="t('productDetail.notFound.message')"
      :action-label="t('productDetail.actions.viewAllProducts')"
      :action-to="localePath('/products')"
      tone="warning"
    />

    <template v-else>
      <section class="container-app py-6 lg:py-10">
        <article class="grid gap-8 lg:grid-cols-[minmax(340px,0.9fr)_minmax(0,1fr)] lg:items-start">
          <!-- ── Gallery ─────────────────────────────────────────────── -->
          <div class="flex flex-col gap-4">
            <!-- Main image -->
            <div class="relative overflow-hidden rounded-2xl bg-grey-normal">
              <div class="relative aspect-square">
                <img
                  v-if="allMedia[activeMediaIndex]"
                  :src="allMedia[activeMediaIndex]!.url"
                  :alt="product.product_name"
                  class="size-full object-contain"
                />
                <!-- Sold overlay -->
                <div
                  v-if="isSold"
                  class="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40"
                >
                  <span class="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black-normal">
                    {{ t('productDetail.actions.soldOut') }}
                  </span>
                </div>
              </div>

              <!-- Favorite + Share buttons overlay -->
              <div class="absolute inset-e-3 top-3 flex flex-col gap-2">
                <button
                  type="button"
                  class="flex size-9 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur transition-colors hover:bg-white"
                  :class="product.is_favorite ? 'text-red-500' : 'text-grey-darker'"
                  :aria-pressed="product.is_favorite"
                  :aria-label="product.is_favorite ? t('product.removeFavorite') : t('product.addFavorite')"
                  @click="toggleFavorite"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="product.is_favorite ? 'currentColor' : 'none'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 20s-7-4-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5-7 9-7 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>

              <!-- Condition badge -->
              <div class="absolute inset-s-3 top-3">
                <span class="rounded-xl bg-brand-cyan-light px-3 py-1 text-xs font-medium text-blue-normal">
                  {{ product.status_trans }}
                </span>
              </div>
            </div>

            <!-- Thumbnails -->
            <div
              v-if="allMedia.length > 1"
              class="scrollbar-none flex gap-2 overflow-x-auto pb-1"
            >
              <button
                v-for="(media, index) in allMedia"
                :key="media.id"
                type="button"
                class="relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors sm:size-20"
                :class="index === activeMediaIndex
                  ? 'border-blue-normal'
                  : 'border-grey-normal hover:border-blue-light-active'"
                :aria-pressed="index === activeMediaIndex"
                @click="activeMediaIndex = index"
              >
                <img
                  :src="media.url"
                  :alt="product.product_name"
                  class="size-full object-cover"
                  loading="lazy"
                />
              </button>
            </div>
          </div>

          <!-- ── Product info ────────────────────────────────────────── -->
          <div class="flex flex-col gap-5">
            <!-- Name + ad type badge -->
            <div>
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <span class="rounded-xl bg-grey-normal px-2 py-0.5 text-xs text-grey-darker">
                  {{ product.ad_type_trans }}
                </span>
                <span
                  v-if="product.views"
                  class="text-xs text-grey-dark-active"
                >
                  {{ t('productDetail.info.views', { count: product.views }) }}
                </span>
              </div>
              <h1 class="text-xl font-bold leading-snug text-black-normal sm:text-2xl">
                {{ product.product_name }}
              </h1>

              <!-- Rating -->
              <div v-if="product.average_rate" class="mt-2 flex items-center gap-1.5">
                <span class="flex items-center gap-0.5 text-yellow-400">
                  <svg
                    v-for="i in 5"
                    :key="i"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    :fill="i <= ratingStars ? 'currentColor' : 'none'"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.2l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="text-sm text-grey-darker">
                  {{ t('productDetail.rating.value', { rating: product.average_rate.toFixed(1) }) }}
                </span>
              </div>
            </div>

            <!-- Price + CTA -->
            <div class="rounded-2xl bg-grey-normal p-4">
              <SharedMoneyAmount
                :amount="product.price"
                currency="SAR"
                :maximum-fraction-digits="0"
                weight="bold"
                class="text-2xl text-blue-normal sm:text-3xl"
              />

              <!-- Direct: cart flow -->
              <template v-if="isDirect && !isSold && !product.is_mine">
                <div v-if="!cartItemForProduct" class="mt-4 flex items-center gap-3">
                  <!-- Quantity selector -->
                  <div class="flex items-center gap-2 rounded-xl border border-grey-normal-hover bg-white px-3 py-2">
                    <button
                      type="button"
                      class="flex size-6 items-center justify-center text-grey-darker hover:text-black-normal disabled:opacity-40"
                      :disabled="cartQuantity <= 1"
                      @click="cartQuantity = Math.max(1, cartQuantity - 1)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                    </button>
                    <span class="w-8 text-center text-sm font-medium">{{ cartQuantity }}</span>
                    <button
                      type="button"
                      class="flex size-6 items-center justify-center text-grey-darker hover:text-black-normal disabled:opacity-40"
                      :disabled="cartQuantity >= product.quantity"
                      @click="cartQuantity = Math.min(product.quantity, cartQuantity + 1)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                    </button>
                  </div>
                  <BaseButton
                    variant="primary"
                    class="flex-1 bg-blue-normal! text-white! hover:bg-blue-normal-hover!"
                    :loading="cartLoading"
                    @click="addToCart"
                  >
                    {{ t('productDetail.actions.addToCart') }}
                  </BaseButton>
                </div>

                <!-- Already in cart: stepper -->
                <div v-else class="mt-4">
                  <p class="mb-2 text-xs text-green-dark">
                    {{ t('productDetail.actions.inCart') }}
                  </p>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 rounded-xl border border-green-normal bg-green-light px-3 py-2">
                      <button
                        type="button"
                        class="flex size-6 items-center justify-center text-green-dark hover:text-green-dark-active"
                        :disabled="cartLoading"
                        @click="updateCartQty(-1)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                      </button>
                      <span class="w-8 text-center text-sm font-medium text-green-dark">{{ cartItemForProduct.quantity }}</span>
                      <button
                        type="button"
                        class="flex size-6 items-center justify-center text-green-dark hover:text-green-dark-active disabled:opacity-40"
                        :disabled="cartLoading || cartItemForProduct.quantity >= product.quantity"
                        @click="updateCartQty(1)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                      </button>
                    </div>
                    <BaseButton variant="secondary" class="flex-1" @click="cartStore.openCart()">
                      {{ t('cart.actions.openCart') }}
                    </BaseButton>
                  </div>
                </div>
              </template>

              <!-- Negotiation flow -->
              <template v-else-if="isNegotiation && !isSold && !product.is_mine">
                <div class="mt-4 flex flex-col gap-3">
                  <BaseButton
                    variant="primary"
                    full-width
                    class="bg-blue-normal! text-white! hover:bg-blue-normal-hover!"
                    @click="openNegotiationDrawer"
                  >
                    {{ product.is_negotiating ? t('productDetail.actions.viewNegotiation') : t('productDetail.actions.startNegotiation') }}
                  </BaseButton>

                  <!-- Cart flow (also available for negotiation products) -->
                  <div v-if="!cartItemForProduct" class="flex items-center gap-3">
                    <div class="flex items-center gap-2 rounded-xl border border-grey-normal-hover bg-white px-3 py-2">
                      <button
                        type="button"
                        class="flex size-6 items-center justify-center text-grey-darker hover:text-black-normal disabled:opacity-40"
                        :disabled="cartQuantity <= 1"
                        @click="cartQuantity = Math.max(1, cartQuantity - 1)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                      </button>
                      <span class="w-8 text-center text-sm font-medium">{{ cartQuantity }}</span>
                      <button
                        type="button"
                        class="flex size-6 items-center justify-center text-grey-darker hover:text-black-normal disabled:opacity-40"
                        :disabled="cartQuantity >= product.quantity"
                        @click="cartQuantity = Math.min(product.quantity, cartQuantity + 1)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                      </button>
                    </div>
                    <BaseButton variant="secondary" class="flex-1" :loading="cartLoading" @click="addToCart">
                      {{ t('productDetail.actions.addToCart') }}
                    </BaseButton>
                  </div>
                  <div v-else class="flex items-center gap-3">
                    <div class="flex items-center gap-2 rounded-xl border border-green-normal bg-green-light px-3 py-2">
                      <button
                        type="button"
                        class="flex size-6 items-center justify-center text-green-dark hover:text-green-dark-active"
                        :disabled="cartLoading"
                        @click="updateCartQty(-1)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                      </button>
                      <span class="w-8 text-center text-sm font-medium text-green-dark">{{ cartItemForProduct.quantity }}</span>
                      <button
                        type="button"
                        class="flex size-6 items-center justify-center text-green-dark hover:text-green-dark-active disabled:opacity-40"
                        :disabled="cartLoading || cartItemForProduct.quantity >= product.quantity"
                        @click="updateCartQty(1)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
                      </button>
                    </div>
                    <BaseButton variant="secondary" class="flex-1" @click="cartStore.openCart()">
                      {{ t('cart.actions.openCart') }}
                    </BaseButton>
                  </div>
                </div>
              </template>

              <!-- Sold -->
              <div
                v-else-if="isSold"
                class="mt-4 rounded-xl bg-status-canceled-bg px-4 py-3 text-center text-sm text-status-canceled-text"
              >
                {{ t('productDetail.actions.soldOut') }}
              </div>

              <!-- Own product -->
              <div v-else-if="product.is_mine" class="mt-4 flex gap-2">
                <BaseButton variant="secondary" full-width>
                  {{ t('productDetail.actions.editProduct') }}
                </BaseButton>
              </div>

              <!-- Not authenticated -->
              <template v-else-if="!!!authStore.token">
                <BaseButton
                  variant="primary"
                  full-width
                  class="mt-4"
                  :to="localePath('/auth/login')"
                >
                  {{ isDirect ? t('productDetail.actions.signInToBuy') : t('productDetail.actions.signInToNegotiate') }}
                </BaseButton>
              </template>
            </div>

            <!-- Description -->
            <div class="border-t border-grey-normal pt-4">
              <h2 class="mb-2 text-base font-semibold text-black-normal">
                {{ t('productDetail.description.title') }}
              </h2>
              <p
                class="whitespace-pre-line text-sm leading-7 text-grey-darker"
                :class="hasLongDesc && !descExpanded ? 'line-clamp-3' : ''"
              >
                {{ product.product_desc || t('productDetail.description.empty') }}
              </p>
              <button
                v-if="hasLongDesc"
                type="button"
                class="mt-1 text-xs font-medium text-blue-normal underline underline-offset-2"
                @click="descExpanded = !descExpanded"
              >
                {{ descExpanded ? t('productDetail.description.showLess') : t('productDetail.description.readMore') }}
              </button>
            </div>

            <!-- Product attributes -->
            <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div class="rounded-xl bg-grey-normal px-3 py-3">
                <dt class="text-xs text-grey-dark-active">{{ t('productDetail.info.condition') }}</dt>
                <dd class="mt-1 text-sm font-medium text-black-normal">{{ product.status_trans }}</dd>
              </div>
              <div class="rounded-xl bg-grey-normal px-3 py-3">
                <dt class="text-xs text-grey-dark-active">{{ t('productDetail.info.weight') }}</dt>
                <dd class="mt-1 text-sm font-medium text-black-normal">{{ product.weight }} {{ product.weight_type_trans }}</dd>
              </div>
              <div v-if="product.category_data" class="rounded-xl bg-grey-normal px-3 py-3">
                <dt class="text-xs text-grey-dark-active">{{ t('productDetail.info.category') }}</dt>
                <dd class="mt-1 text-sm font-medium text-black-normal">{{ product.category_data.title }}</dd>
              </div>
            </dl>

            <!-- Seller card -->
            <div class="rounded-2xl border border-grey-normal-hover p-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="product.seller_data.image"
                  :src="product.seller_data.image"
                  :alt="product.seller_data.store_name"
                  class="size-12 rounded-full object-cover"
                />
                <div
                  v-else
                  class="flex size-12 items-center justify-center rounded-full bg-blue-light text-sm font-bold text-blue-normal"
                >
                  {{ product.seller_data.store_name.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="font-medium text-black-normal">{{ product.seller_data.store_name }}</h3>
                    <span
                      v-if="product.seller_data.is_verified"
                      class="inline-flex items-center gap-1 rounded-xl bg-brand-cyan-light px-2 py-0.5 text-xs text-blue-normal"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ t('productDetail.seller.verified') }}
                    </span>
                  </div>
                  <p class="mt-0.5 text-xs text-grey-darker">
                    {{ product.seller_data.address_data?.city_data?.name }}
                  </p>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-1">
                <span class="flex items-center gap-0.5 text-yellow-400">
                  <svg
                    v-for="i in 5"
                    :key="i"
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    :fill="i <= Math.round(product.seller_data.average_rate) ? 'currentColor' : 'none'"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.2l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="text-xs text-grey-darker">{{ product.seller_data.average_rate?.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </article>

        <!-- ── Reviews ──────────────────────────────────────────────────── -->
        <section class="mt-10 border-t border-grey-normal pt-8 lg:mt-14">
          <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h2 class="text-xl font-bold text-black-normal">{{ t('productDetail.reviews.title') }}</h2>
            <span class="text-sm text-grey-darker">
              {{ t('productDetail.reviews.count', { count: product.latest_reviews.length }) }}
            </span>
          </div>

          <div v-if="product.latest_reviews.length" class="grid gap-4 lg:grid-cols-2">
            <article
              v-for="review in product.latest_reviews"
              :key="review.id"
              class="rounded-xl border border-grey-normal-hover p-4"
            >
              <div class="flex items-start gap-3">
                <img
                  v-if="review.user.image"
                  :src="review.user.image"
                  :alt="review.user.full_name"
                  class="size-10 rounded-full object-cover"
                  loading="lazy"
                />
                <div
                  v-else
                  class="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-light text-sm font-semibold text-blue-normal"
                >
                  {{ review.user.full_name.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="font-medium text-black-normal">{{ review.user.full_name }}</span>
                    <time class="text-xs text-grey-dark-active" :datetime="review.created_at">
                      {{ new Date(review.created_at).toLocaleDateString() }}
                    </time>
                  </div>
                  <div class="mt-1 flex items-center gap-0.5 text-yellow-400">
                    <svg
                      v-for="i in 5"
                      :key="i"
                      width="13"
                      height="13"
                      viewBox="0 0 16 16"
                      :fill="i <= review.rate ? 'currentColor' : 'none'"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.2l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round" />
                    </svg>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-grey-darker">{{ review.comment }}</p>
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

        <!-- ── Similar products ─────────────────────────────────────────── -->
        <section
          v-if="product.similar_products.length"
          class="mt-10 border-t border-grey-normal pt-8 lg:mt-14"
        >
          <h2 class="mb-5 text-xl font-bold text-black-normal">
            {{ t('productDetail.related.title') }}
          </h2>
          <div class="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
            <SharedCatalogProductCard
              v-for="related in product.similar_products"
              :key="related.id"
              :product="toProduct(related)"
              :to="`/products/${related.id}`"
              :favorite="related.is_favorite"
              show-favorite
              :condition-label="related.status_trans"
              :listing-label="related.ad_type_trans"
              show-seller
              :seller-name="related.seller_data.store_name || related.seller_data.full_name"
              class="w-[min(70vw,220px)] shrink-0 snap-start"
              @favorite="(p) => productStore.toggleFavorite(Number(p.id))"
            />
          </div>
        </section>
      </section>

      <!-- Cart drawer -->
      <SharedCartDrawer />

      <!-- Negotiation drawer -->
      <SharedChatNegotiationDrawer />
    </template>
  </main>
</template>
