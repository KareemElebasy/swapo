<script setup lang="ts">
import type { DemoCartSellerGroup } from '~/composables/useDemoCart'
import type { DemoCheckoutAddressDraft, DemoShippingMethodId } from '~/composables/useDemoCheckout'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  itemCount,
  loading,
  sellerGroups,
  serviceFee,
  total: cartTotal,
  setLoaded,
} = useDemoCart()
const {
  address,
  addressDraft,
  notes,
  selectedShippingId,
  selectedShippingMethod,
  shippingMethods,
  submitted,
  saveAddress,
  selectShippingMethod,
  startAddressEdit,
  submitCheckout,
  useSampleAddress,
} = useDemoCheckout()

const expandedSellerIds = ref<string[]>([])
const addressFormOpen = ref(false)
const notesOpen = ref(false)
const liveMessage = ref('')
const formErrors = ref<Partial<Record<keyof DemoCheckoutAddressDraft, string>>>({})
const deliveryBaseDate = useState<string>(
  'demo-checkout-delivery-base-date',
  () => new Date().toISOString(),
)

let loadingTimer: number | undefined

const hasItems = computed(() => itemCount.value > 0)
const hasAddress = computed(() => Boolean(address.value))
const hasShipping = computed(() => Boolean(selectedShippingMethod.value))

const checkoutTotal = computed(() => ({
  amount: cartTotal.value.amount + (selectedShippingMethod.value?.price.amount ?? 0),
  currency: cartTotal.value.currency,
}))

const confirmDisabled = computed(
  () => loading.value || !hasItems.value || submitted.value,
)

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

watch(
  address,
  (value) => {
    if (!value) {
      addressFormOpen.value = false
    }
  },
  { immediate: true },
)

function addDays(value: Date, days: number) {
  const next = new Date(value)
  next.setDate(next.getDate() + days)
  return next
}

function formatDeliveryDate(index: number) {
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

function isSellerExpanded(sellerId: string) {
  return expandedSellerIds.value.includes(sellerId)
}

function toggleSeller(sellerId: string) {
  if (isSellerExpanded(sellerId)) {
    expandedSellerIds.value = expandedSellerIds.value.filter((id) => id !== sellerId)
    return
  }

  expandedSellerIds.value = [...expandedSellerIds.value, sellerId]
}

function sellerToggleLabel(group: DemoCartSellerGroup) {
  return t('checkout.summary.toggleSeller', {
    seller: group.seller.name,
  })
}

function openAddressForm() {
  startAddressEdit()
  addressFormOpen.value = true
  formErrors.value = {}
}

function fillSampleAddress() {
  useSampleAddress()
  addressFormOpen.value = false
  formErrors.value = {}
  liveMessage.value = t('checkout.status.addressSaved')
}

function validateAddress() {
  const requiredFields: Array<keyof DemoCheckoutAddressDraft> = [
    'fullName',
    'phone',
    'city',
    'district',
    'line1',
  ]
  const nextErrors: Partial<Record<keyof DemoCheckoutAddressDraft, string>> = {}

  requiredFields.forEach((field) => {
    if (!addressDraft.value[field].trim()) {
      nextErrors[field] = t('checkout.address.required')
    }
  })

  formErrors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

function handleSaveAddress() {
  if (!validateAddress()) {
    liveMessage.value = t('checkout.status.addressMissing')
    return
  }

  saveAddress()
  addressFormOpen.value = false
  liveMessage.value = t('checkout.status.addressSaved')
}

function handleSelectShipping(methodId: DemoShippingMethodId) {
  selectShippingMethod(methodId)
  liveMessage.value = t('checkout.status.shippingSelected')
}

function handleConfirmOrder() {
  if (!hasAddress.value) {
    openAddressForm()
    liveMessage.value = t('checkout.status.addressMissing')
    return
  }

  if (!hasShipping.value) {
    liveMessage.value = t('checkout.status.shippingMissing')
    return
  }

  submitCheckout()
  liveMessage.value = t('checkout.status.orderPlaceholder')
}

function shippingLabel(methodId: DemoShippingMethodId) {
  return t(`checkout.shipping.methods.${methodId}.title`)
}

function shippingDescription(methodId: DemoShippingMethodId) {
  return t(`checkout.shipping.methods.${methodId}.description`)
}
</script>

<template>
  <section class="container-app py-8 lg:py-10" :aria-labelledby="'checkout-title'">
    <p class="sr-only" aria-live="polite">
      {{ liveMessage }}
    </p>

    <div class="mb-6 flex items-center justify-end">
      <h1
        id="checkout-title"
        class="text-2xl font-bold leading-8 text-black-normal-hover"
      >
        {{ t('checkout.title') }}
      </h1>
    </div>

    <div
      v-if="loading"
      class="grid gap-8 xl:grid-cols-[minmax(280px,427px)_minmax(0,812px)] xl:items-start xl:justify-between"
      role="status"
      :aria-label="t('checkout.loading')"
    >
      <BaseSkeleton height="h-[260px]" />
      <BaseSkeleton height="h-[220px]" />
    </div>

    <SharedFeedbackEmptyState
      v-else-if="!hasItems"
      :title="t('checkout.empty.title')"
      :message="t('checkout.empty.message')"
      :action-label="t('checkout.empty.action')"
      action-to="/products"
      tone="brand"
      class="min-h-[420px]"
    />

    <div
      v-else
      class="grid gap-8 xl:grid-cols-[minmax(280px,427px)_minmax(0,812px)] xl:items-start xl:justify-between"
    >
      <aside class="order-2 flex flex-col gap-4 xl:order-1">
        <div class="rounded-sm bg-grey-light-active p-2">
          <div class="flex flex-col gap-3">
            <article
              v-for="(group, index) in sellerGroups"
              :key="group.seller.id"
              class="rounded-xs bg-white px-2 py-3"
            >
              <div class="flex items-center justify-between gap-3">
                <button
                  type="button"
                  class="flex size-8 shrink-0 items-center justify-center rounded-xs text-grey-dark-active transition-colors hover:bg-grey-normal hover:text-black-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
                  :aria-label="sellerToggleLabel(group)"
                  :aria-expanded="isSellerExpanded(group.seller.id)"
                  @click="toggleSeller(group.seller.id)"
                >
                  <svg
                    v-if="!isSellerExpanded(group.seller.id)"
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

                <div class="flex min-w-0 items-center gap-2">
                  <div class="min-w-0 text-end">
                    <div class="flex items-center justify-end gap-1">
                      <span class="text-xs font-light text-black-lighter">
                        ({{ t('cart.seller.itemCount', { count: group.itemCount }) }})
                      </span>
                      <h2 class="truncate text-sm font-medium text-black-normal-hover">
                        {{ group.seller.name }}
                      </h2>
                    </div>
                    <p class="text-xs leading-5 text-black-lighter">
                      {{ formatDeliveryDate(index) }}
                    </p>
                  </div>
                  <img
                    :src="group.seller.avatar"
                    :alt="t('cart.seller.avatarAlt', { seller: group.seller.name })"
                    class="size-8 shrink-0 rounded-full bg-grey-normal object-cover"
                  />
                </div>
              </div>

              <ul
                v-if="isSellerExpanded(group.seller.id)"
                class="mt-3 flex flex-col gap-2 border-t border-grey-normal pt-3"
              >
                <li
                  v-for="item in group.items"
                  :key="item.id"
                  class="flex items-center justify-between gap-3 text-xs text-grey-darker"
                >
                  <span dir="auto">{{ item.quantity }}x</span>
                  <NuxtLink
                    :to="localePath(`/products/${item.product.id}`)"
                    class="truncate text-black-normal hover:text-blue-normal"
                  >
                    {{ item.product.title }}
                  </NuxtLink>
                </li>
              </ul>
            </article>
          </div>

          <dl class="mt-3 flex flex-col gap-3 rounded-md p-3">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-sm font-light text-black-light-active">
                {{ t('cart.summary.totalProducts', { count: itemCount }) }}
              </dt>
              <dd class="sr-only">
                {{ itemCount }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
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
              <dt class="text-sm font-light text-black-light-active">
                {{ t('cart.summary.serviceFee') }}
              </dt>
            </div>
            <div
              v-if="selectedShippingMethod"
              class="flex items-center justify-between gap-3"
            >
              <dd>
                <SharedMoneyAmount
                  :amount="selectedShippingMethod.price.amount"
                  :currency="selectedShippingMethod.price.currency"
                  :maximum-fraction-digits="0"
                  size="sm"
                  weight="normal"
                  class="text-black-normal-hover"
                />
              </dd>
              <dt class="text-sm font-light text-black-light-active">
                {{ t('checkout.summary.shipping') }}
              </dt>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dd>
                <SharedMoneyAmount
                  :amount="checkoutTotal.amount"
                  :currency="checkoutTotal.currency"
                  :maximum-fraction-digits="0"
                  size="md"
                  weight="bold"
                  class="text-brand-cyan-active"
                />
              </dd>
              <dt class="text-sm font-medium text-black-normal-hover">
                {{ t('cart.summary.total') }}
              </dt>
            </div>
          </dl>

          <p
            v-if="!selectedShippingMethod"
            class="mt-2 rounded-sm bg-status-pending-bg px-3 py-1 text-center text-sm leading-5 text-black-light-active"
          >
            {{ t('cart.shippingNotice') }}
          </p>
        </div>

        <BaseButton
          full-width
          size="lg"
          :disabled="confirmDisabled"
          class="bg-blue-normal! text-grey-light! hover:bg-blue-normal-hover!"
          @click="handleConfirmOrder"
        >
          {{ submitted ? t('checkout.actions.confirmed') : t('checkout.actions.confirmOrder') }}
        </BaseButton>

        <p
          v-if="submitted"
          class="rounded-sm bg-status-completed-bg px-3 py-2 text-center text-sm text-status-completed-text"
          role="status"
        >
          {{ t('checkout.status.orderPlaceholder') }}
        </p>
      </aside>

      <div class="order-1 flex flex-col gap-4 xl:order-2">
        <section class="flex flex-col gap-2" :aria-labelledby="'checkout-address-title'">
          <h2
            id="checkout-address-title"
            class="text-sm font-medium text-black-normal-hover"
          >
            {{ t('checkout.address.title') }}
          </h2>

          <button
            v-if="!hasAddress && !addressFormOpen"
            type="button"
            class="flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-brand-cyan-light-active bg-brand-cyan-light px-4 py-3 text-blue-normal transition-colors hover:bg-green-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
            @click="openAddressForm"
          >
            <span>{{ t('checkout.address.addNew') }}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <button
            v-if="address && !addressFormOpen"
            type="button"
            class="flex w-full items-center justify-between gap-4 rounded-md bg-grey-normal p-3 text-start transition-colors hover:bg-grey-light-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
            @click="openAddressForm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="shrink-0 rtl:rotate-180"
              aria-hidden="true"
            >
              <path
                d="M12.5 5 7.5 10l5 5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="min-w-0 flex-1 truncate text-sm leading-6 text-black-light-active">
              {{ address.line1 }}
            </span>
          </button>

          <div
            v-if="addressFormOpen"
            class="rounded-md border border-grey-normal-hover bg-white p-4"
          >
            <div class="grid gap-4 md:grid-cols-2">
              <BaseInput
                v-model="addressDraft.fullName"
                :label="t('checkout.address.fullName')"
                :placeholder="t('checkout.address.fullNamePlaceholder')"
                :error="formErrors.fullName"
                required
              />
              <BaseInput
                v-model="addressDraft.phone"
                :label="t('checkout.address.phone')"
                :placeholder="t('checkout.address.phonePlaceholder')"
                :error="formErrors.phone"
                dir="ltr"
                required
              />
              <BaseInput
                v-model="addressDraft.city"
                :label="t('checkout.address.city')"
                :placeholder="t('checkout.address.cityPlaceholder')"
                :error="formErrors.city"
                required
              />
              <BaseInput
                v-model="addressDraft.district"
                :label="t('checkout.address.district')"
                :placeholder="t('checkout.address.districtPlaceholder')"
                :error="formErrors.district"
                required
              />
              <BaseInput
                v-model="addressDraft.line1"
                :label="t('checkout.address.line1')"
                :placeholder="t('checkout.address.line1Placeholder')"
                :error="formErrors.line1"
                class="md:col-span-2"
                required
              />
              <BaseInput
                v-model="addressDraft.details"
                :label="t('checkout.address.details')"
                :placeholder="t('checkout.address.detailsPlaceholder')"
                class="md:col-span-2"
              />
            </div>

            <div class="mt-4 flex flex-wrap justify-end gap-3">
              <BaseButton
                variant="secondary"
                type="button"
                @click="fillSampleAddress"
              >
                {{ t('checkout.address.useSample') }}
              </BaseButton>
              <BaseButton
                v-if="hasAddress"
                variant="ghost"
                type="button"
                @click="addressFormOpen = false"
              >
                {{ t('common.cancel') }}
              </BaseButton>
              <BaseButton type="button" @click="handleSaveAddress">
                {{ t('checkout.address.save') }}
              </BaseButton>
            </div>
          </div>
        </section>

        <div class="h-px bg-grey-normal-hover" />

        <section
          v-if="hasAddress"
          class="flex flex-col gap-3"
          :aria-labelledby="'checkout-shipping-title'"
        >
          <div class="flex items-center justify-end gap-1">
            <span class="text-sm font-medium text-status-canceled-text" aria-hidden="true">
              *
            </span>
            <h2
              id="checkout-shipping-title"
              class="text-sm font-medium text-black-normal-hover"
            >
              {{ t('checkout.shipping.title') }}
            </h2>
          </div>

          <div class="flex flex-col gap-3" role="radiogroup" :aria-labelledby="'checkout-shipping-title'">
            <button
              v-for="method in shippingMethods"
              :key="method.id"
              type="button"
              role="radio"
              :aria-checked="selectedShippingId === method.id"
              :class="[
                'flex w-full items-center justify-between gap-4 rounded-md border px-4 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal',
                selectedShippingId === method.id
                  ? 'border-brand-cyan bg-white'
                  : 'border-grey-normal-hover bg-white hover:border-brand-cyan-light-active',
              ]"
              @click="handleSelectShipping(method.id)"
            >
              <SharedMoneyAmount
                :amount="method.price.amount"
                :currency="method.price.currency"
                :maximum-fraction-digits="0"
                size="md"
                weight="bold"
                :class="selectedShippingId === method.id ? 'text-blue-normal' : 'text-black-normal'"
              />

              <span class="flex min-w-0 flex-1 items-start justify-end gap-2">
                <span class="min-w-0 text-end">
                  <span class="block text-sm font-medium text-black-normal">
                    {{ shippingLabel(method.id) }}
                  </span>
                  <span class="mt-1 block text-sm font-light leading-5 text-black-light-active">
                    {{ shippingDescription(method.id) }}
                  </span>
                </span>
                <span class="shrink-0 text-sm" aria-hidden="true">
                  {{ method.icon }}
                </span>
              </span>
            </button>
          </div>
        </section>

        <div v-if="hasAddress" class="h-px bg-grey-normal-hover" />

        <section class="flex flex-col gap-3" :aria-labelledby="'checkout-notes-title'">
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs font-light text-black-lighter">
              {{ t('common.optional') }}
            </span>
            <h2
              id="checkout-notes-title"
              class="text-sm font-medium text-black-normal-hover"
            >
              {{ t('checkout.notes.title') }}
            </h2>
          </div>

          <button
            v-if="!notesOpen"
            type="button"
            class="flex w-full items-start justify-end gap-2 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
            @click="notesOpen = true"
          >
            <span class="text-end">
              <span class="block text-sm text-black-normal">
                {{ notes || t('checkout.notes.prompt') }}
              </span>
              <span class="mt-1 block text-sm font-light text-black-light-active">
                {{ t('checkout.notes.helper') }}
              </span>
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="shrink-0 text-black-normal"
              aria-hidden="true"
            >
              <path
                d="M4 5.5A2.5 2.5 0 0 1 6.5 3h7A2.5 2.5 0 0 1 16 5.5v4A2.5 2.5 0 0 1 13.5 12H9l-4 3v-3.5A2.5 2.5 0 0 1 4 9.5v-4Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <BaseTextarea
            v-else
            v-model="notes"
            :placeholder="t('checkout.notes.placeholder')"
            :max-length="240"
            :rows="4"
          />
        </section>
      </div>
    </div>
  </section>
</template>
