<script setup lang="ts">
import type { AppStatus } from '~/types/status'

definePageMeta({
  layout: 'buyer',
  middleware: 'auth',
})

interface DemoOrder {
  id: string
  status: AppStatus
  createdAt: string
  total: number
  productIds: string[]
  extraCount?: number
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()
const { products } = useProductCatalog()

useHead({ title: t('profile.ordersPage.metaTitle') })

const productById = computed(
  () => new Map(products.value.map((product) => [product.id, product])),
)

const orders = computed<DemoOrder[]>(() => [
  {
    id: 'NNG5925555',
    status: 'pending',
    createdAt: '2024-06-20',
    total: 250,
    productIds: ['pink-heart-coat', 'red-flame-heels', 'heart-winter-coat'],
    extraCount: 3,
  },
  {
    id: 'NNG5925555',
    status: 'awaitingPayment',
    createdAt: '2024-06-20',
    total: 250,
    productIds: ['pink-heart-coat', 'red-flame-heels', 'heart-winter-coat'],
    extraCount: 3,
  },
  {
    id: 'NNG5925555',
    status: 'confirmed',
    createdAt: '2024-06-20',
    total: 250,
    productIds: ['red-flame-heels'],
  },
  {
    id: 'NNG5925555',
    status: 'shipped',
    createdAt: '2024-06-20',
    total: 250,
    productIds: ['red-flame-heels'],
  },
  {
    id: 'NNG5925555',
    status: 'completed',
    createdAt: '2024-06-20',
    total: 250,
    productIds: ['red-flame-heels'],
  },
  {
    id: 'NNG5925555',
    status: 'canceled',
    createdAt: '2024-06-20',
    total: 250,
    productIds: ['pink-heart-coat', 'red-flame-heels', 'heart-winter-coat'],
    extraCount: 3,
  },
])

function orderProducts(order: DemoOrder) {
  return order.productIds
    .map((productId) => productById.value.get(productId))
    .filter(Boolean)
}

function formatOrderDate(value: string) {
  return formatDate(value, {
    locale: locale.value,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatOrderTotal(value: number) {
  return formatMoney(value, {
    locale: locale.value,
    currency: 'SAR',
    maximumFractionDigits: 0,
  })
}

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}
</script>

<template>
  <SharedProfileShell role="buyer" @logout="handleLogout">
    <section class="bg-white">
      <div class="mb-7 flex items-center justify-between gap-4">
        <button
          type="button"
          class="inline-flex min-h-8 items-center gap-2 rounded-xs bg-grey-normal px-3 text-xs text-grey-darker transition-colors hover:bg-grey-normal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
        >
          <span>{{ t('profile.ordersPage.filters.recent') }}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="m4.5 5.5 2.5 2.5 2.5-2.5"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <h2 class="text-xl font-bold text-black-normal">
          {{ t('profile.nav.purchases') }}
        </h2>
      </div>

      <div class="divide-y divide-blue-light">
        <article
          v-for="order in orders"
          :key="`${order.id}-${order.status}`"
          class="flex flex-col gap-4 py-5 md:flex-row md:items-start md:justify-between"
        >
          <div class="min-w-0 flex-1 text-end">
            <p class="text-xs leading-5 text-grey-dark-hover">
              {{ t('profile.ordersPage.orderNumber', { id: order.id }) }}
            </p>

            <div class="mt-2 flex items-center justify-end gap-2">
              <span
                v-if="order.extraCount"
                class="text-xs leading-5 text-grey-dark-hover"
              >
                {{
                  t('profile.ordersPage.moreProducts', {
                    count: order.extraCount,
                  })
                }}
              </span>

              <div class="flex items-center justify-end gap-2">
                <img
                  v-for="product in orderProducts(order)"
                  :key="product?.id"
                  :src="product?.media[0]?.url"
                  :alt="product?.title"
                  class="size-12 rounded-xs bg-grey-normal object-cover"
                />
              </div>
            </div>

            <p class="mt-1 text-xs leading-5 text-grey-dark-hover">
              {{
                t('profile.ordersPage.productsCount', {
                  count: order.productIds.length + (order.extraCount ?? 0),
                })
              }}
            </p>
          </div>

          <div class="flex shrink-0 flex-row items-center justify-between gap-3 md:w-36 md:flex-col md:items-start md:text-left">
            <p class="text-xs leading-5 text-grey-dark-hover">
              {{ formatOrderDate(order.createdAt) }}
            </p>
            <SharedStatusBadge :status="order.status" size="sm" />
            <p class="text-sm font-semibold text-black-normal" dir="ltr">
              {{ formatOrderTotal(order.total) }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </SharedProfileShell>
</template>
