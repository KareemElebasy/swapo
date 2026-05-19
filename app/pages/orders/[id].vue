<script setup lang="ts">
import type { ApiOrderDetail } from '~/types/api-order'
import { apiFetch } from '~/composables/useApi'

definePageMeta({
  layout: 'buyer',
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}

const order = ref<ApiOrderDetail | null>(null)
const loading = ref(true)
const fetchError = ref(false)
const cancelling = ref(false)

useHead(() => ({
  title: order.value
    ? t('profile.orderDetailPage.orderCode', { code: order.value.code })
    : t('profile.orderDetailPage.metaTitle'),
}))

onMounted(async () => {
  try {
    const res = await apiFetch<{ data: ApiOrderDetail }>(`buyer-order/${route.params.id}`)
    order.value = res?.data ?? null
  } catch {
    fetchError.value = true
  } finally {
    loading.value = false
  }
})


function formatAddress(addr: ApiOrderDetail['address_data']) {
  if (!addr) return null
  return [addr.full_name, addr.district, addr.line1, addr.city].filter(Boolean).join('، ')
}

async function cancelOrder() {
  if (!order.value) return
  if (!confirm(t('profile.orderDetailPage.actions.cancelConfirm'))) return
  cancelling.value = true
  try {
    await apiFetch(`buyer-order/cancel/${order.value.id}`, { method: 'PATCH' })
    order.value = { ...order.value, status: 'cancelled', status_trans: t('status.canceled') }
  } finally {
    cancelling.value = false
  }
}

const timelineSteps = computed(() => [
  {
    key: 'pending_approval',
    label: t('profile.orderDetailPage.timeline.pendingApproval'),
    hint: t('profile.orderDetailPage.timeline.pendingApprovalHint'),
    stepIndex: 0,
  },
  {
    key: 'pending_payment',
    label: t('profile.orderDetailPage.timeline.pendingPayment'),
    hint: t('profile.orderDetailPage.timeline.pendingPaymentHint'),
    stepIndex: 1,
  },
  {
    key: 'pending_shipment',
    label: t('profile.orderDetailPage.timeline.pendingShipment'),
    hint: null,
    stepIndex: 2,
  },
  {
    key: 'shipped',
    label: t('profile.orderDetailPage.timeline.shipped'),
    hint: null,
    stepIndex: 3,
  },
  {
    key: 'completed',
    label: t('profile.orderDetailPage.timeline.completed'),
    hint: null,
    stepIndex: 4,
  },
])

const currentStep = computed(() => orderTimelineStep(order.value?.status ?? ''))
const isCancelled = computed(() => order.value?.status === 'cancelled' || order.value?.status === 'rejected')
const canCancel = computed(() => order.value?.status === 'pending_approval')

function printPage() {
  if (typeof window !== 'undefined') window.print()
}
</script>

<template>
  <SharedProfileShell role="buyer" @logout="handleLogout">

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="h-6 w-48 animate-pulse rounded bg-surface" />
      <div class="h-8 w-64 animate-pulse rounded bg-surface" />
      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <div class="h-80 animate-pulse rounded-xl bg-surface" />
        <div class="h-80 animate-pulse rounded-xl bg-surface" />
      </div>
    </div>

    <!-- Error -->
    <SharedFeedbackEmptyState
      v-else-if="fetchError"
      :title="t('errors.general')"
      :action-label="t('common.previous')"
      @action="router.back()"
    />

    <template v-else-if="order">
      <!-- Breadcrumb + print -->
      <div class="mb-4 flex items-center justify-between gap-4">
        <SharedNavigationBreadcrumbs
          :show-home="false"
          :items="[
            { label: t('profile.orderDetailPage.breadcrumb'), to: '/orders' },
            { label: t('profile.orderDetailPage.orderCode', { code: order.code }) },
          ]"
        />
        <button
          type="button"
          class="flex items-center gap-1.5 text-sm text-grey-darker hover:text-black-normal"
          @click="printPage"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="1" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1.4" />
            <path d="M3 10H1v5h14v-5h-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <rect x="4" y="11" width="8" height="4" rx="0.5" stroke="currentColor" stroke-width="1.4" />
          </svg>
          {{ t('profile.orderDetailPage.print') }}
        </button>
      </div>

      <!-- Title + status -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-bold text-black-normal">
          {{ t('profile.orderDetailPage.title') }}
        </h1>
        <SharedStatusBadge
          :status="mapApiOrderStatus(order.status)"
          :label="order.status_trans"
        />
      </div>

      <!-- Two column layout: sidebar (address/notes/timeline) | main (summary/items) -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">

        <!-- Sidebar col: address, payment, notes, timeline, cancel -->
        <div class="space-y-4">

          <!-- Delivery address -->
          <div class="rounded-xl border border-border bg-white p-4">
            <h2 class="mb-3 text-sm font-semibold text-black-normal">
              {{ t('profile.orderDetailPage.sections.address') }}
            </h2>
            <p
              v-if="order.address_data"
              class="rounded-lg bg-surface px-3 py-2.5 text-sm leading-6 text-black-normal"
            >
              {{ formatAddress(order.address_data) }}
            </p>
            <p v-else class="text-sm text-grey-dark-hover">
              {{ t('profile.orderDetailPage.sections.addressEmpty') }}
            </p>
          </div>

          <!-- Order notes -->
          <div v-if="order.notes" class="rounded-xl border border-border bg-white p-4">
            <h2 class="mb-2 text-sm font-semibold text-black-normal">
              {{ t('profile.orderDetailPage.sections.notes') }}
            </h2>
            <p class="text-sm leading-6 text-grey-darker">{{ order.notes }}</p>
          </div>

          <!-- Status timeline -->
          <div class="rounded-xl border border-border bg-white p-4">
            <template v-if="isCancelled">
              <div class="flex items-center gap-3">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-status-canceled-bg">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M4 4l6 6M10 4l-6 6" stroke="#500001" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </span>
                <p class="text-sm font-medium text-status-canceled-text">
                  {{
                    order.status === 'rejected'
                      ? t('profile.orderDetailPage.timeline.rejected')
                      : t('profile.orderDetailPage.timeline.cancelled')
                  }}
                </p>
              </div>
            </template>

            <ol v-else class="relative space-y-0">
              <li
                v-for="(step, idx) in timelineSteps"
                :key="step.key"
                class="relative flex gap-3 pb-5 last:pb-0"
              >
                <!-- Connector line -->
                <div
                  v-if="idx < timelineSteps.length - 1"
                  class="absolute inset-s-3.75 top-8 h-full w-px"
                  :class="step.stepIndex < currentStep ? 'bg-green' : 'bg-border'"
                />
                <!-- Step icon -->
                <span
                  class="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full"
                  :class="step.stepIndex < currentStep
                    ? 'bg-green'
                    : step.stepIndex === currentStep
                      ? 'border-2 border-green bg-white'
                      : 'border-2 border-border bg-white'"
                >
                  <svg v-if="step.stepIndex < currentStep" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="#0B1A55" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span
                    v-else-if="step.stepIndex === currentStep"
                    class="size-2.5 rounded-full bg-green"
                  />
                </span>

                <!-- Step content -->
                <div class="pt-1">
                  <p
                    class="text-sm font-medium"
                    :class="step.stepIndex <= currentStep ? 'text-black-normal' : 'text-grey-dark-hover'"
                  >
                    {{ step.label }}
                  </p>
                  <p v-if="step.hint && step.stepIndex === currentStep" class="mt-0.5 text-xs text-grey-darker">
                    {{ step.hint }}
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <!-- Cancel button -->
          <BaseButton
            v-if="canCancel"
            variant="danger"
            full-width
            :loading="cancelling"
            @click="cancelOrder"
          >
            {{ t('profile.orderDetailPage.actions.cancel') }}
          </BaseButton>
        </div>

        <!-- Main col: order summary + items -->
        <div class="space-y-4">

          <!-- Price summary -->
          <div class="rounded-xl border border-border bg-white p-4">
            <h2 class="mb-4 text-sm font-semibold text-black-normal">
              {{ t('profile.orderDetailPage.summary.productCount', { count: order.brief_data.total_product_count }) }}
            </h2>
            <dl class="divide-y divide-border">
              <div class="flex items-center justify-between py-2.5">
                <dd>
                  <SharedMoneyAmount :amount="order.brief_data.shipping_price" size="sm" weight="normal" />
                </dd>
                <dt class="text-sm text-grey-dark-hover">{{ t('profile.orderDetailPage.summary.shipping') }}</dt>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dd>
                  <SharedMoneyAmount :amount="order.brief_data.commission" size="sm" weight="normal" />
                </dd>
                <dt class="text-sm text-grey-dark-hover">{{ t('profile.orderDetailPage.summary.commission') }}</dt>
              </div>
              <div class="flex items-center justify-between py-2.5">
                <dd>
                  <SharedMoneyAmount :amount="order.total_price" size="md" weight="bold" class="text-navy" />
                </dd>
                <dt class="text-sm font-semibold text-black-normal">{{ t('profile.orderDetailPage.summary.total') }}</dt>
              </div>
            </dl>
          </div>

          <!-- Items list -->
          <div class="rounded-xl border border-border bg-white p-4">
            <h2 class="mb-4 text-sm font-semibold text-black-normal">
              {{ t('profile.orderDetailPage.sections.items') }}
            </h2>
            <div class="space-y-4">
              <div
                v-for="item in order.items_data"
                :key="item.id"
                class="flex items-start gap-3"
              >
                <img
                  :src="item.cover"
                  :alt="item.product_name"
                  class="size-16 shrink-0 rounded-lg object-cover"
                />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-black-normal">
                    {{ item.product_name }}
                  </p>
                  <p class="mt-0.5 text-xs text-grey-dark-hover">
                    {{ t('profile.orderDetailPage.product.qty', { qty: item.quantity }) }}
                    ·
                    {{ t('profile.orderDetailPage.product.weight', { value: item.weight, unit: item.weight_type_trans }) }}
                  </p>
                </div>
                <SharedMoneyAmount
                  :amount="item.price"
                  size="sm"
                  weight="bold"
                  class="shrink-0 text-navy"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>
  </SharedProfileShell>
</template>
