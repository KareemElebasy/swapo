<script setup lang="ts">
import { io, type Socket } from 'socket.io-client'
import type { ApiNegotiationMessage } from '~/types/api-negotiation'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const authStore = useAuthStore()
const negotiationStore = useNegotiationStore()

useHead({ title: t('negotiation.meta.title') })

const negotiationId = computed(() => {
  const val = route.params.id
  return Array.isArray(val) ? val[0]! : (val ?? '')
})

await negotiationStore.fetchNegotiation(negotiationId.value)

const negotiation = computed(() => negotiationStore.currentNegotiation)
const currentUserId = computed(() => authStore.user?.id)

// ── Messages ──────────────────────────────────────────────────────────────
const messages = ref<ApiNegotiationMessage[]>([])

watch(
  () => negotiationStore.currentNegotiation?.messages,
  (msgs) => {
    if (msgs) {
      messages.value = [...msgs].sort((a, b) => a.created_at - b.created_at)
    }
  },
  { immediate: true },
)

// ── Chat input state ──────────────────────────────────────────────────────
const chatMode = ref<'message' | 'offer'>('message')
const messageText = ref('')
const offerPrice = ref<number | undefined>(undefined)
const sendLoading = ref(false)
const sendError = ref('')
const messagesEndRef = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

watch(messages, scrollToBottom, { deep: true })

// ── Socket.io ─────────────────────────────────────────────────────────────
let socket: Socket | null = null

onMounted(() => {
  scrollToBottom()
  connectSocket()
})

onUnmounted(() => {
  socket?.disconnect()
})

function connectSocket() {
  socket = io('https://swapo.hajar.aait-d.com:4100', {
    transports: ['websocket'],
    auth: { token: authStore.token },
  })

  socket.emit('join', `negotiation-${negotiationId.value}`)

  socket.on('negotiation-chat', (msg: ApiNegotiationMessage) => {
    if (!messages.value.find(m => m.id === msg.id)) {
      messages.value.push(msg)
    }
  })
}

// ── Send actions ──────────────────────────────────────────────────────────
async function sendMessage() {
  if (!messageText.value.trim()) return
  sendLoading.value = true
  sendError.value = ''
  try {
    await negotiationStore.sendMessage(negotiationId.value, messageText.value.trim())
    messageText.value = ''
  } catch {
    sendError.value = t('negotiation.errors.sendFailed')
  } finally {
    sendLoading.value = false
  }
}

async function sendOffer() {
  if (!offerPrice.value) return
  sendLoading.value = true
  sendError.value = ''
  try {
    await negotiationStore.sendOffer(negotiationId.value, offerPrice.value)
    offerPrice.value = undefined
    chatMode.value = 'message'
  } catch {
    sendError.value = t('negotiation.errors.sendFailed')
  } finally {
    sendLoading.value = false
  }
}

async function acceptOffer(offerId: number) {
  await negotiationStore.acceptOffer(negotiationId.value, offerId)
}

async function rejectOffer(offerId: number) {
  await negotiationStore.rejectOffer(negotiationId.value, offerId)
}

async function cancelOffer(offerId: number) {
  await negotiationStore.cancelOffer(negotiationId.value, offerId)
}

function handleEnter(event: KeyboardEvent) {
  if (!event.shiftKey) {
    event.preventDefault()
    if (chatMode.value === 'offer') sendOffer()
    else sendMessage()
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function isOwn(senderId: number) {
  return senderId === currentUserId.value
}

function formatTime(unixTs: number) {
  return new Date(unixTs * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const offerStatusClass: Record<string, string> = {
  pending: 'bg-status-pending-bg text-status-pending-text',
  accepted: 'bg-status-confirmed-bg text-status-confirmed-text',
  rejected: 'bg-status-canceled-bg text-status-canceled-text',
  cancelled: 'bg-status-shipped-bg text-status-shipped-text',
}

const isClosed = computed(() =>
  ['agreed', 'finished', 'cancelled'].includes(negotiation.value?.status ?? ''),
)

const pendingOffer = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    const msg = messages.value[i]
    if (msg.type === 'offer' && msg.status === 'pending') return msg
  }
  return null
})
</script>

<template>
  <div class="flex h-[calc(100dvh-64px)] flex-col overflow-hidden bg-grey-normal">
    <!-- Loading -->
    <div v-if="negotiationStore.detailLoading" class="flex flex-1 items-center justify-center">
      <p class="text-sm text-grey-darker">{{ t('common.loading') }}</p>
    </div>

    <!-- Not found -->
    <SharedFeedbackEmptyState
      v-else-if="!negotiation"
      :title="t('negotiation.errors.loadFailed')"
      message=""
      :action-label="t('common.home')"
      :action-to="localePath('/')"
      tone="warning"
    />

    <template v-else>
      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <header class="flex shrink-0 items-center gap-3 border-b border-grey-normal-hover bg-white px-4 py-3">
        <NuxtLink
          :to="localePath('/profile')"
          class="flex size-8 items-center justify-center rounded-full text-grey-darker hover:bg-grey-normal"
          :aria-label="t('common.previous')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </NuxtLink>

        <img
          v-if="negotiation.product_data.cover"
          :src="negotiation.product_data.cover"
          :alt="negotiation.product_data.product_name"
          class="size-10 rounded-xl object-cover"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-black-normal">
            {{ negotiation.product_data.product_name }}
          </p>
          <div class="flex items-center gap-2">
            <span
              class="rounded-xl px-2 py-0.5 text-xs"
              :class="isClosed
                ? 'bg-status-canceled-bg text-status-canceled-text'
                : 'bg-status-pending-bg text-status-pending-text'"
            >
              {{ negotiation.status_trans }}
            </span>
          </div>
        </div>

        <div class="text-end">
          <p class="text-xs text-grey-darker">{{ t('negotiation.detail.originalPrice') }}</p>
          <SharedMoneyAmount
            :amount="negotiation.product_data.price"
            currency="SAR"
            :maximum-fraction-digits="0"
            weight="bold"
            class="text-sm text-blue-normal"
          />
        </div>
      </header>

      <!-- ── Seller info bar ────────────────────────────────────────────── -->
      <div class="shrink-0 border-b border-grey-normal-hover bg-white px-4 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs text-grey-darker">
            <img
              v-if="negotiation.seller_data.image"
              :src="negotiation.seller_data.image"
              :alt="negotiation.seller_data.store_name ?? negotiation.seller_data.full_name"
              class="size-5 rounded-full object-cover"
            />
            <span>{{ negotiation.seller_data.store_name ?? negotiation.seller_data.full_name }}</span>
          </div>
        </div>
        <p class="mt-1 text-xs text-grey-dark-active">{{ t('negotiation.detail.shippingNote') }}</p>
      </div>

      <!-- ── Pending offer bar ──────────────────────────────────────────── -->
      <div
        v-if="pendingOffer && !isClosed"
        class="shrink-0 border-b border-grey-normal-hover bg-white px-4 py-3"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs text-grey-darker">{{ t('negotiation.detail.awaitingReply') }}</p>
            <SharedMoneyAmount
              :amount="pendingOffer.price ?? 0"
              currency="SAR"
              :maximum-fraction-digits="0"
              weight="bold"
              class="text-blue-normal"
            />
          </div>
          <div v-if="!isOwn(pendingOffer.sender.id)" class="flex gap-2">
            <BaseButton
              variant="secondary"
              size="sm"
              :loading="negotiationStore.actionLoading"
              @click="rejectOffer(pendingOffer.id)"
            >
              {{ t('negotiation.actions.reject') }}
            </BaseButton>
            <BaseButton
              variant="primary"
              size="sm"
              :loading="negotiationStore.actionLoading"
              @click="acceptOffer(pendingOffer.id)"
            >
              {{ t('negotiation.actions.accept') }}
            </BaseButton>
          </div>
          <div v-else>
            <BaseButton
              variant="ghost"
              size="sm"
              :loading="negotiationStore.actionLoading"
              @click="cancelOffer(pendingOffer.id)"
            >
              {{ t('negotiation.actions.cancel') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- ── Messages ───────────────────────────────────────────────────── -->
      <div class="flex-1 overflow-y-auto px-4 py-4">
        <div
          v-if="!messages.length"
          class="flex h-full flex-col items-center justify-center gap-2 text-center"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-grey-dark" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
          <p class="text-sm font-medium text-grey-darker">{{ t('negotiation.chat.empty') }}</p>
          <p class="text-xs text-grey-dark-active">{{ t('negotiation.chat.emptyHint') }}</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="isOwn(msg.sender.id) ? 'justify-end' : 'justify-start'"
          >
            <!-- Offer bubble -->
            <div
              v-if="msg.type === 'offer'"
              class="w-[min(85%,320px)] rounded-2xl border p-4"
              :class="isOwn(msg.sender.id)
                ? 'rounded-br-sm border-blue-light bg-blue-light'
                : 'rounded-bl-sm border-grey-normal-hover bg-white'"
            >
              <div class="mb-2 flex items-center justify-between gap-2">
                <p class="text-xs text-grey-darker">
                  {{ isOwn(msg.sender.id) ? t('negotiation.detail.you') : (negotiation.seller_data.store_name ?? negotiation.seller_data.full_name) }}
                </p>
                <span
                  class="rounded-xl px-2 py-0.5 text-xs font-medium"
                  :class="offerStatusClass[msg.status ?? ''] ?? 'bg-grey-normal text-grey-darker'"
                >
                  {{ msg.status_trans }}
                </span>
              </div>

              <SharedMoneyAmount
                :amount="msg.price ?? 0"
                currency="SAR"
                :maximum-fraction-digits="0"
                weight="bold"
                class="text-xl text-blue-normal"
              />

              <!-- Received pending → accept / reject -->
              <div
                v-if="msg.status === 'pending' && !isOwn(msg.sender.id)"
                class="mt-3 flex gap-2"
              >
                <BaseButton
                  variant="secondary"
                  size="sm"
                  class="flex-1"
                  :loading="negotiationStore.actionLoading"
                  @click="rejectOffer(msg.id)"
                >
                  {{ t('negotiation.actions.reject') }}
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="sm"
                  class="flex-1"
                  :loading="negotiationStore.actionLoading"
                  @click="acceptOffer(msg.id)"
                >
                  {{ t('negotiation.actions.accept') }}
                </BaseButton>
              </div>

              <!-- Own pending → cancel -->
              <div
                v-else-if="msg.status === 'pending' && isOwn(msg.sender.id)"
                class="mt-3"
              >
                <BaseButton
                  variant="ghost"
                  size="sm"
                  full-width
                  :loading="negotiationStore.actionLoading"
                  @click="cancelOffer(msg.id)"
                >
                  {{ t('negotiation.actions.cancel') }}
                </BaseButton>
              </div>

              <p class="mt-2 text-end text-xs text-grey-dark-active">{{ formatTime(msg.created_at) }}</p>
            </div>

            <!-- Text bubble -->
            <div
              v-else-if="msg.content"
              class="max-w-[85%] rounded-2xl px-4 py-2.5"
              :class="isOwn(msg.sender.id)
                ? 'rounded-br-sm bg-blue-normal text-white'
                : 'rounded-bl-sm bg-white text-black-normal'"
            >
              <p class="text-sm leading-6 whitespace-pre-wrap">{{ msg.content }}</p>
              <p
                class="mt-1 text-end text-xs"
                :class="isOwn(msg.sender.id) ? 'text-blue-light-active' : 'text-grey-dark-active'"
              >
                {{ formatTime(msg.created_at) }}
              </p>
            </div>
          </div>

          <div ref="messagesEndRef" aria-hidden="true" />
        </div>
      </div>

      <!-- ── Input area ─────────────────────────────────────────────────── -->
      <div
        v-if="!isClosed"
        class="shrink-0 border-t border-grey-normal-hover bg-white px-4 py-3"
      >
        <div class="mb-3 flex gap-2">
          <button
            type="button"
            class="rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
            :class="chatMode === 'message'
              ? 'bg-blue-normal text-white'
              : 'bg-grey-normal text-grey-darker hover:bg-grey-normal-hover'"
            @click="chatMode = 'message'"
          >
            {{ t('negotiation.chat.messagePlaceholder') }}
          </button>
          <button
            type="button"
            class="rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
            :class="chatMode === 'offer'
              ? 'bg-blue-normal text-white'
              : 'bg-grey-normal text-grey-darker hover:bg-grey-normal-hover'"
            @click="chatMode = 'offer'"
          >
            {{ t('negotiation.actions.newOffer') }}
          </button>
        </div>

        <p v-if="sendError" class="mb-2 text-xs text-status-canceled-text">{{ sendError }}</p>

        <div v-if="chatMode === 'message'" class="flex gap-2">
          <textarea
            v-model="messageText"
            :placeholder="t('negotiation.chat.messagePlaceholder')"
            rows="1"
            class="flex-1 resize-none rounded-xl border border-grey-normal-hover bg-grey-normal px-4 py-2.5 text-sm text-black-normal placeholder:text-grey-dark-active focus:border-blue-normal focus:bg-white focus:outline-none"
            @keydown.enter="handleEnter"
          />
          <button
            type="button"
            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-normal text-white transition-colors hover:bg-blue-normal-hover disabled:opacity-50"
            :disabled="!messageText.trim() || sendLoading"
            :aria-label="t('negotiation.actions.sendMessage')"
            @click="sendMessage"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <div v-else class="flex gap-2">
          <div class="relative flex-1">
            <input
              v-model="offerPrice"
              type="number"
              :placeholder="t('negotiation.chat.offerPlaceholder')"
              dir="ltr"
              class="w-full rounded-xl border border-grey-normal-hover bg-grey-normal py-2.5 pe-4 ps-10 text-sm text-black-normal placeholder:text-grey-dark-active focus:border-blue-normal focus:bg-white focus:outline-none"
            />
            <span class="absolute inset-s-3 top-1/2 -translate-y-1/2 text-sm text-grey-darker">
              ر.س
            </span>
          </div>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-xl bg-blue-normal px-4 text-sm font-medium text-white transition-colors hover:bg-blue-normal-hover disabled:opacity-50"
            :disabled="!offerPrice || sendLoading"
            @click="sendOffer"
          >
            {{ t('negotiation.actions.sendOffer') }}
          </button>
        </div>
      </div>

      <!-- Closed state footer -->
      <div
        v-else
        class="shrink-0 border-t border-grey-normal-hover bg-grey-light px-4 py-3 text-center"
      >
        <p
          class="text-sm font-medium"
          :class="negotiation.status === 'agreed' ? 'text-status-confirmed-text' : 'text-grey-darker'"
        >
          {{ negotiation.status_trans }}
        </p>
      </div>
    </template>
  </div>
</template>
