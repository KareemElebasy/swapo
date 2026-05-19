<script setup lang="ts">
import type { ApiOrderListItem, ApiOrdersResponse } from '~/types/api-order'
import { apiFetch } from '~/composables/useApi'

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'seller'],
})

const { t, locale } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}

useHead({ title: t('profile.sellerOrdersPage.metaTitle') })

const orders = ref<ApiOrderListItem[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)
const filter = ref<'recent' | 'all'>('recent')

function buildUrl(page = 1) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  if (filter.value === 'recent') {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    params.set('start_date', weekAgo.toISOString().split('T')[0] ?? '')
    params.set('end_date', now.toISOString().split('T')[0] ?? '')
  }
  return `seller-order?${params.toString()}`
}

async function fetchOrders() {
  loading.value = true
  orders.value = []
  currentPage.value = 1
  try {
    const res = await apiFetch<ApiOrdersResponse>(buildUrl(1))
    orders.value = res?.data ?? []
    lastPage.value = res?.meta?.last_page ?? 1
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || currentPage.value >= lastPage.value) return
  loadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const res = await apiFetch<ApiOrdersResponse>(buildUrl(nextPage))
    orders.value.push(...(res?.data ?? []))
    currentPage.value = nextPage
    lastPage.value = res?.meta?.last_page ?? lastPage.value
  } finally {
    loadingMore.value = false
  }
}

onMounted(fetchOrders)
watch(filter, fetchOrders)

function formatOrderDate(ts: number) {
  return formatDate(ts * 1000, { locale: locale.value })
}

function visibleImages(products: ApiOrderListItem['products_data']) {
  return products.slice(0, 3)
}

function extraCount(products: ApiOrderListItem['products_data']) {
  return Math.max(0, products.length - 3)
}
</script>

<template>
  <SharedProfileShell role="seller" @logout="handleLogout">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between gap-4">
      <h1 class="text-2xl font-bold leading-normal text-black-normal">
        {{ t('profile.sellerOrdersPage.title') }}
      </h1>

      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-black-normal transition-colors hover:bg-surface"
        @click="filter = filter === 'recent' ? 'all' : 'recent'"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 4h10M4 7h6M6 10h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        {{ filter === 'recent' ? t('profile.ordersPage.filters.recent') : t('profile.ordersPage.filters.all') }}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" class="transition-transform" :class="{ 'rotate-180': filter === 'all' }">
          <path d="m3 4.5 3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="n in 4"
        :key="n"
        class="h-28 animate-pulse rounded-xl bg-surface"
      />
    </div>

    <!-- Empty state -->
    <SharedFeedbackEmptyState
      v-else-if="orders.length === 0"
      :title="t('profile.sellerOrdersPage.empty.title')"
      :message="t('profile.sellerOrdersPage.empty.message')"
    />

    <!-- Orders list -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="order in orders"
        :key="order.id"
        :to="localePath(`/seller/orders/${order.id}`)"
        class="block rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-sm"
      >
        <!-- Row 1: date + code -->
        <div class="mb-2 flex items-center justify-between gap-3">
          <span class="text-xs text-grey-dark-hover">{{ formatOrderDate(order.created_at) }}</span>
          <span class="text-xs font-medium text-grey-darker">
            {{ t('profile.ordersPage.orderNumber', { id: order.code }) }}
          </span>
        </div>

        <!-- Row 2: status badge -->
        <div class="mb-3">
          <SharedStatusBadge
            :status="mapApiOrderStatus(order.status)"
            :label="order.status_trans"
            size="sm"
          />
        </div>

        <!-- Row 3: products + price -->
        <div class="flex items-end justify-between gap-3">
          <div class="flex items-center gap-1.5">
            <div class="flex items-center -space-x-2 rtl:space-x-reverse rtl:-space-x-2">
              <img
                v-for="(prod, idx) in visibleImages(order.products_data)"
                :key="idx"
                :src="prod.cover"
                :alt="prod.product_name"
                class="size-10 rounded-lg border-2 border-white object-cover"
              />
            </div>
            <span
              v-if="extraCount(order.products_data) > 0"
              class="text-xs font-medium text-grey-darker"
            >
              {{ t('profile.ordersPage.moreProducts', { count: extraCount(order.products_data) }) }}
            </span>
            <div v-else-if="order.products_data.length === 1" class="min-w-0">
              <p class="truncate text-sm font-medium text-black-normal">
                {{ order.products_data[0]?.product_name }}
              </p>
            </div>
          </div>

          <div class="shrink-0 text-end">
            <SharedMoneyAmount
              :amount="order.total_price"
              size="md"
              weight="bold"
              class="text-navy"
            />
            <p class="mt-0.5 text-xs text-grey-dark-hover">
              {{ t('profile.ordersPage.productsCount', { count: order.products_data.length }) }}
            </p>
          </div>
        </div>
      </NuxtLink>

      <!-- Load more -->
      <div v-if="currentPage < lastPage" class="pt-2 text-center">
        <BaseButton
          variant="secondary"
          :loading="loadingMore"
          @click="loadMore"
        >
          {{ t('profile.sellerOrdersPage.loadMore') }}
        </BaseButton>
      </div>
    </div>
  </SharedProfileShell>
</template>
