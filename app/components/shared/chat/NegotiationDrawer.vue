<script setup lang="ts">
import { io, type Socket } from "socket.io-client";
import type { ApiNegotiationMessage } from "~/types/api-negotiation";

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const negotiationStore = useNegotiationStore();

const negotiation = computed(() => negotiationStore.currentNegotiation);
const drawerProduct = computed(() => negotiationStore.drawerProduct);
const currentUserId = computed(() => authStore.user?.id);

// ── Messages (socket + REST merge) ───────────────────────────────────────
const messages = ref<ApiNegotiationMessage[]>([]);
const messagesEndRef = ref<HTMLElement | null>(null);

watch(
  () => negotiationStore.currentNegotiation?.messages,
  (fetched) => {
    if (!fetched) return;
    const sorted = [...fetched].sort((a, b) => a.created_at - b.created_at);
    // Merge: update existing + add new from REST, keep socket-only items
    const fetchedById = new Map(sorted.map((m) => [m.id, m]));
    const merged = messages.value.map((m) => fetchedById.get(m.id) ?? m);
    const existingIds = new Set(messages.value.map((m) => m.id));
    sorted.filter((m) => !existingIds.has(m.id)).forEach((m) => merged.push(m));
    messages.value = merged.sort((a, b) => a.created_at - b.created_at);
    scrollToBottom();
  },
  { immediate: true },
);

function scrollToBottom() {
  nextTick(() => messagesEndRef.value?.scrollIntoView({ behavior: "smooth" }));
}

// ── Socket ────────────────────────────────────────────────────────────────
let socket: Socket | null = null;

function connectSocket(negotiationId: string) {
  if (!import.meta.client) return;
  socket?.disconnect();
  socket = io("https://swapo.hajar.aait-d.com:4100", {
    transports: ["websocket"],
    auth: { token: authStore.token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", async () => {
    socket?.emit("join", `negotiation-${negotiationId}`);
    if (negotiation.value) {
      await negotiationStore.fetchNegotiation(negotiation.value.id);
    }
  });

  socket.on("negotiation-chat", (msg: ApiNegotiationMessage) => {
    if (!messages.value.find((m) => m.id === msg.id)) {
      messages.value.push(msg);
      messages.value.sort((a, b) => a.created_at - b.created_at);
      scrollToBottom();
    }
  });
}

watch(
  () => negotiationStore.currentNegotiation?.id,
  (id) => {
    if (
      id &&
      negotiationStore.drawerView === "chat" &&
      negotiationStore.drawerOpen
    ) {
      connectSocket(String(id));
    }
  },
);

watch(
  () => negotiationStore.drawerOpen,
  (open) => {
    if (!open) {
      socket?.disconnect();
      socket = null;
    } else if (
      negotiation.value?.id &&
      negotiationStore.drawerView === "chat"
    ) {
      connectSocket(String(negotiation.value.id));
    }
  },
);

onUnmounted(() => {
  socket?.disconnect();
});

// ── Derived offer data ────────────────────────────────────────────────────
const latestOffer = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i].type === "offer") return messages.value[i];
  }
  return negotiation.value?.accepted_offer ?? null;
});

const pendingOffer = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    const m = messages.value[i];
    if (m.type === "offer" && m.status === "pending") return m;
  }
  return null;
});

const displayPrice = computed(() => {
  if (negotiation.value?.accepted_offer?.price)
    return negotiation.value.accepted_offer.price;
  if (latestOffer.value?.price) return latestOffer.value.price;
  return drawerProduct.value?.price ?? 0;
});

const offerSubmitter = computed(() => {
  if (negotiation.value?.accepted_offer)
    return negotiation.value.accepted_offer.sender;
  return latestOffer.value?.sender ?? null;
});

const isCurrentUserBuyer = computed(
  () => negotiation.value?.buyer_data.id === currentUserId.value,
);

// ── Status badge ──────────────────────────────────────────────────────────
const statusBadge = computed(() => {
  const neg = negotiation.value;
  if (!neg) return { text: "", cls: "bg-grey-normal text-grey-darker" };

  if (neg.status === "finished")
    return { text: neg.status_trans, cls: "bg-grey-normal text-grey-darker" };

  if (neg.status === "agreed")
    return {
      text: neg.status_trans,
      cls: "bg-status-confirmed-bg text-status-confirmed-text",
    };

  if (latestOffer.value) {
    const offer = latestOffer.value;
    if (offer.status === "pending")
      return {
        text: t("negotiation.detail.awaitingReply"),
        cls: "bg-status-pending-bg text-status-pending-text",
      };

    if (offer.status === "rejected") {
      if (isOwn(offer.sender.id)) {
        // My offer was rejected by the other party
        const text = isCurrentUserBuyer.value
          ? t("negotiation.rejected.bySeller")
          : t("negotiation.rejected.byBuyer");
        return { text, cls: "bg-status-canceled-bg text-status-canceled-text" };
      }
      return {
        text: t("negotiation.offer.rejected"),
        cls: "bg-status-canceled-bg text-status-canceled-text",
      };
    }

    if (offer.status === "accepted")
      return {
        text: t("negotiation.offer.accepted"),
        cls: "bg-status-confirmed-bg text-status-confirmed-text",
      };

    if (offer.status === "cancelled")
      return {
        text: t("negotiation.offer.cancelled"),
        cls: "bg-status-shipped-bg text-status-shipped-text",
      };
  }

  return {
    text: neg.status_trans,
    cls: "bg-status-pending-bg text-status-pending-text",
  };
});

// ── Conditional flags ─────────────────────────────────────────────────────
const isClosed = computed(() =>
  ["finished", "cancelled"].includes(negotiation.value?.status ?? ""),
);

const isAgreed = computed(() => negotiation.value?.status === "agreed");
const isFinished = computed(() => negotiation.value?.status === "finished");

const canSendOffer = computed(() => {
  if (!negotiation.value) return !!drawerProduct.value;
  if (negotiation.value.status !== "open") return false;
  if (!latestOffer.value) return true;
  return latestOffer.value.status !== "pending";
});

const canRespondToOffer = computed(
  () => !!(pendingOffer.value && !isOwn(pendingOffer.value.sender.id)),
);

// ── Timer ─────────────────────────────────────────────────────────────────
const remainingTime = ref("");
let timerInterval: ReturnType<typeof setInterval> | null = null;

function computeRemaining() {
  const exp = pendingOffer.value?.expires_at ?? negotiation.value?.expires_at;
  if (!exp) {
    remainingTime.value = "";
    return;
  }
  const diff = new Date(exp).getTime() - Date.now();
  if (diff <= 0) {
    remainingTime.value = "";
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    return;
  }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  remainingTime.value = parts.join(" ");
}

watch(
  () => [pendingOffer.value?.expires_at, negotiation.value?.expires_at],
  () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    computeRemaining();
    if (remainingTime.value)
      timerInterval = setInterval(computeRemaining, 30000);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// ── Offer form ────────────────────────────────────────────────────────────
const offerPriceInput = ref<number | undefined>(undefined);
const offerSubmitLoading = ref(false);
const offerSubmitError = ref("");

async function submitOffer() {
  if (!offerPriceInput.value || !drawerProduct.value) return;
  offerSubmitLoading.value = true;
  offerSubmitError.value = "";
  try {
    if (negotiation.value) {
      await negotiationStore.sendOffer(
        negotiation.value.id,
        offerPriceInput.value,
      );
    } else {
      const result = await negotiationStore.startNegotiation(
        drawerProduct.value.id,
        offerPriceInput.value,
      );
      if (result?.data?.id)
        await negotiationStore.fetchNegotiation(result.data.id);
    }
    offerPriceInput.value = undefined;
    negotiationStore.switchDrawerView("chat");
  } catch {
    offerSubmitError.value = t("negotiation.errors.sendFailed");
  } finally {
    offerSubmitLoading.value = false;
  }
}

// ── Chat input ────────────────────────────────────────────────────────────
const messageText = ref("");
const sendLoading = ref(false);
const sendError = ref("");

async function sendMessage() {
  if (!messageText.value.trim() || !negotiation.value) return;
  sendLoading.value = true;
  sendError.value = "";
  try {
    await negotiationStore.sendMessage(
      negotiation.value.id,
      messageText.value.trim(),
    );
    messageText.value = "";
  } catch {
    sendError.value = t("negotiation.errors.sendFailed");
  } finally {
    sendLoading.value = false;
  }
}

function handleEnter(event: KeyboardEvent) {
  if (!event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ── Offer actions ─────────────────────────────────────────────────────────
async function acceptOffer(offerId: number) {
  if (!negotiation.value) return;
  await negotiationStore.acceptOffer(negotiation.value.id, offerId);
}

async function rejectOffer(offerId: number) {
  if (!negotiation.value) return;
  await negotiationStore.rejectOffer(negotiation.value.id, offerId);
}

async function cancelOffer(offerId: number) {
  if (!negotiation.value) return;
  await negotiationStore.cancelOffer(negotiation.value.id, offerId);
}

// ── Helpers ───────────────────────────────────────────────────────────────
function isOwn(senderId: number) {
  return senderId === currentUserId.value;
}

function formatTime(unixTs: number) {
  return new Date(unixTs * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(unixTs: number) {
  return new Date(unixTs * 1000).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const offerStatusCls: Record<string, string> = {
  pending: "bg-status-pending-bg text-status-pending-text",
  accepted: "bg-status-confirmed-bg text-status-confirmed-text",
  rejected: "bg-status-canceled-bg text-status-canceled-text",
  cancelled: "bg-status-shipped-bg text-status-shipped-text",
};

// Group messages by day
const groupedMessages = computed(() => {
  const groups: { day: string; msgs: ApiNegotiationMessage[] }[] = [];
  let currentDay = "";
  for (const msg of messages.value) {
    const day = formatDay(msg.created_at);
    if (day !== currentDay) {
      currentDay = day;
      groups.push({ day, msgs: [] });
    }
    groups[groups.length - 1]!.msgs.push(msg);
  }
  return groups;
});

const isOfferView = computed(() => negotiationStore.drawerView === "offer");
const isChatView = computed(() => negotiationStore.drawerView === "chat");

function openOfferForm() {
  offerPriceInput.value = undefined;
  offerSubmitError.value = "";
  negotiationStore.switchDrawerView("offer");
}

function backToChat() {
  offerPriceInput.value = undefined;
  offerSubmitError.value = "";
  negotiationStore.switchDrawerView("chat");
}
</script>

<template>
  <BaseDrawer
    :open="negotiationStore.drawerOpen"
    side="start"
    :closable="false"
    panel-class="bg-white !w-full sm:!w-[460px] !max-w-full my-8 sm:my-20"
    body-class="!p-0 !overflow-hidden flex flex-col"
    @update:open="(v) => !v && negotiationStore.closeDrawer()"
  >
    <!-- ══════════════════════════════════════════════════════ HEADER ══ -->
    <template #header>
      <!-- Offer form header -->
      <div
        v-if="isOfferView"
        class="flex w-full items-center gap-3 border-b border-grey-normal px-4 py-3"
      >
        <!-- Back (only when in existing negotiation) -->
        <button
          v-if="negotiation"
          type="button"
          class="flex size-8 shrink-0 items-center justify-center rounded-full text-grey-darker hover:bg-grey-normal"
          @click="backToChat"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h2 class="flex-1 text-center text-sm font-semibold text-black-normal">
          {{ t("negotiation.startModal.title") }}
        </h2>
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-full text-grey-dark-active hover:bg-grey-normal"
          @click="negotiationStore.closeDrawer()"
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
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Chat header -->
      <div
        v-else-if="isChatView"
        class="flex w-full items-center gap-3 border-b border-grey-normal px-4 py-3"
      >
        <!-- Product image (start/right in RTL) -->
        <img
          v-if="drawerProduct?.cover"
          :src="drawerProduct.cover"
          :alt="drawerProduct.product_name"
          class="size-12 shrink-0 rounded-xl object-cover"
        />
        <div
          v-else
          class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-grey-normal text-grey-dark"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path
              d="M21 15l-5-5L5 21"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <!-- Product name + seller -->
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-black-normal">
            {{ drawerProduct?.product_name }}
          </p>
          <p class="truncate text-xs text-grey-darker">
            {{ drawerProduct?.seller_name }}
          </p>
        </div>

        <!-- Action buttons (end/left in RTL) -->
        <div class="flex shrink-0 items-center gap-2">
          <button
            v-if="canSendOffer && negotiation"
            type="button"
            class="flex items-center gap-1 rounded-xl border border-blue-normal px-3 py-1.5 text-xs font-medium text-blue-normal transition-colors hover:bg-blue-light"
            @click="openOfferForm"
          >
            {{ t("negotiation.actions.sendOffer") }}
          </button>
          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-full text-grey-dark-active hover:bg-grey-normal"
            @click="negotiationStore.closeDrawer()"
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
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- ════════════════════════════════════════════════════ OFFER FORM ══ -->
    <template v-if="isOfferView">
      <!-- Scrollable form body -->
      <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <!-- Product reference -->
        <p class="text-xs text-grey-dark-active">
          {{ drawerProduct?.product_name }}
        </p>

        <!-- Original price row -->
        <div
          class="flex items-center justify-between rounded-xl bg-grey-normal px-4 py-3"
        >
          <span class="text-sm text-grey-darker">{{
            t("negotiation.detail.originalPrice")
          }}</span>
          <SharedMoneyAmount
            :amount="drawerProduct?.price ?? 0"
            currency="SAR"
            :maximum-fraction-digits="0"
            weight="bold"
            class="text-blue-normal"
          />
        </div>

        <!-- Price input -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-black-normal">
            {{ t("negotiation.startModal.priceLabel") }}
          </label>
          <div class="relative">
            <input
              v-model="offerPriceInput"
              type="number"
              :placeholder="t('negotiation.startModal.pricePlaceholder')"
              dir="ltr"
              class="w-full rounded-xl border border-grey-normal-hover bg-grey-normal py-3 pe-4 ps-12 text-sm text-black-normal placeholder:text-grey-dark-active focus:border-blue-normal focus:bg-white focus:outline-none"
            />
            <span
              class="absolute inset-s-4 top-1/2 -translate-y-1/2 text-sm font-medium text-grey-darker"
              >ر.س</span
            >
          </div>
        </div>

        <!-- Shipping info rows -->
        <div
          class="flex flex-col gap-1.5 rounded-xl bg-grey-normal px-4 py-3 text-xs"
        >
          <div class="flex items-center justify-between">
            <span class="text-grey-dark-active">{{
              t("negotiation.detail.shippingNote")
            }}</span>
          </div>
        </div>

        <p v-if="offerSubmitError" class="text-xs text-status-canceled-text">
          {{ offerSubmitError }}
        </p>

        <!-- Policy -->
        <div class="rounded-xl border border-grey-normal px-4 py-3">
          <p class="mb-2 text-xs font-semibold text-black-normal">
            {{ t("negotiation.startModal.rules.title") }}
          </p>
          <ul class="space-y-1.5 list-disc ps-4 text-xs text-grey-darker">
            <li>{{ t("negotiation.startModal.rules.onceOnly") }}</li>
            <li>{{ t("negotiation.startModal.rules.noEdit") }}</li>
            <li>{{ t("negotiation.startModal.rules.sellerCounter") }}</li>
            <li>{{ t("negotiation.startModal.rules.noChangeAfterAccept") }}</li>
            <li>{{ t("negotiation.startModal.rules.finalPrice") }}</li>
          </ul>
        </div>
      </div>

      <!-- Fixed footer -->
      <div
        class="shrink-0 border-t border-grey-normal px-5 py-4 flex flex-col gap-2"
      >
        <BaseButton
          variant="primary"
          full-width
          class="bg-blue-normal! text-white! hover:bg-blue-normal-hover!"
          :loading="offerSubmitLoading || negotiationStore.actionLoading"
          :disabled="!offerPriceInput"
          @click="submitOffer"
        >
          {{ t("negotiation.startModal.submit") }}
        </BaseButton>
        <p class="text-center text-xs text-grey-darker">
          {{ t("negotiation.startModal.policy") }}
        </p>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════ CHAT VIEW ══ -->
    <template v-else-if="isChatView">
      <!-- Loading -->
      <div
        v-if="negotiationStore.detailLoading"
        class="flex-1 flex items-center justify-center"
      >
        <p class="text-sm text-grey-darker">{{ t("common.loading") }}</p>
      </div>

      <template v-else-if="negotiation">
        <!-- ── Offer info card ──────────────────────────────────────── -->
        <div class="shrink-0 border-b border-grey-normal bg-white">
          <!-- Row: submitter + status -->
          <div class="flex items-start justify-between px-4 pt-3 pb-2 gap-3">
            <!-- START (right in RTL): submitter section -->
            <div class="flex flex-col gap-1">
              <p class="text-xs text-grey-darker">
                {{ t("negotiation.detail.offerSubmitter") }}
              </p>
              <div v-if="offerSubmitter" class="flex items-center gap-1.5">
                <img
                  v-if="offerSubmitter.image"
                  :src="offerSubmitter.image"
                  :alt="offerSubmitter.full_name"
                  class="size-6 rounded-full object-cover"
                />
                <div
                  v-else
                  class="flex size-6 items-center justify-center rounded-full bg-blue-light text-xs font-bold text-blue-normal"
                >
                  {{
                    (
                      offerSubmitter.store_name || offerSubmitter.full_name
                    ).charAt(0)
                  }}
                </div>
                <span class="text-xs font-medium text-black-normal">
                  {{
                    isOwn(offerSubmitter.id)
                      ? t("negotiation.detail.you")
                      : offerSubmitter.store_name || offerSubmitter.full_name
                  }}
                </span>
              </div>
            </div>

            <!-- END (left in RTL): status badge -->
            <span
              class="mt-1 shrink-0 rounded-xl px-2.5 py-1 text-xs font-medium"
              :class="statusBadge.cls"
            >
              {{ statusBadge.text }}
            </span>
          </div>

          <!-- Divider -->
          <div class="mx-4 border-t border-grey-normal" />

          <!-- Price section -->
          <div class="px-4 py-3 text-center">
            <p class="mb-1 text-xs text-grey-darker">
              {{ t("negotiation.detail.proposedPrice") }}
            </p>
            <SharedMoneyAmount
              :amount="displayPrice"
              currency="SAR"
              :maximum-fraction-digits="0"
              weight="bold"
              class="text-[28px] leading-tight text-blue-normal"
            />
            <p class="mt-1 text-xs text-grey-dark-active">
              {{ t("negotiation.detail.shippingNote") }}
            </p>
          </div>

          <!-- Timer bar (pending + has expiry) -->
          <div
            v-if="pendingOffer && remainingTime"
            class="mx-4 mb-3 flex items-center justify-center gap-2 rounded-xl bg-grey-normal px-3 py-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="shrink-0 text-grey-darker"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                stroke-width="1.5"
              />
              <path
                d="M12 7v5l3 2"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
            <span class="text-xs text-grey-darker">
              {{ t("negotiation.detail.expiresIn", { time: remainingTime }) }}
            </span>
          </div>

          <!-- Accept / Reject bar (received pending offer) -->
          <div v-if="canRespondToOffer" class="flex gap-3 px-4 pb-3">
            <BaseButton
              variant="secondary"
              class="flex-1"
              :loading="negotiationStore.actionLoading"
              @click="rejectOffer(pendingOffer!.id)"
            >
              {{ t("negotiation.actions.reject") }}
            </BaseButton>
            <BaseButton
              variant="primary"
              class="flex-1 bg-blue-normal! text-white! hover:bg-blue-normal-hover!"
              :loading="negotiationStore.actionLoading"
              @click="acceptOffer(pendingOffer!.id)"
            >
              {{ t("negotiation.actions.accept") }}
            </BaseButton>
          </div>

          <!-- Cancel bar (own pending offer) -->
          <div
            v-else-if="pendingOffer && isOwn(pendingOffer.sender.id)"
            class="px-4 pb-3"
          >
            <BaseButton
              variant="ghost"
              full-width
              size="sm"
              :loading="negotiationStore.actionLoading"
              @click="cancelOffer(pendingOffer.id)"
            >
              {{ t("negotiation.actions.cancel") }}
            </BaseButton>
          </div>

          <!-- Payment bar (agreed) -->
          <div v-if="isAgreed" class="px-4 pb-3 flex flex-col gap-2">
            <p
              class="rounded-xl bg-status-pending-bg px-3 py-2 text-xs text-status-pending-text"
            >
              {{ t("negotiation.detail.paymentWarning") }}
            </p>
            <BaseButton
              variant="primary"
              full-width
              class="bg-blue-normal! text-white! hover:bg-blue-normal-hover!"
              :to="localePath('/checkout')"
              @click="negotiationStore.closeDrawer()"
            >
              {{ t("negotiation.actions.continuePayment") }}
            </BaseButton>
          </div>
        </div>

        <!-- ── Messages ────────────────────────────────────────────── -->
        <div class="flex-1 overflow-y-auto px-4 py-4">
          <div
            v-if="!messages.length"
            class="flex h-full flex-col items-center justify-center gap-2 text-center"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-grey-dark"
              aria-hidden="true"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>
            <p class="text-sm font-medium text-grey-darker">
              {{ t("negotiation.chat.empty") }}
            </p>
            <p class="text-xs text-grey-dark-active">
              {{ t("negotiation.chat.emptyHint") }}
            </p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <template v-for="group in groupedMessages" :key="group.day">
              <!-- Day separator -->
              <div class="flex items-center gap-3 my-1">
                <div class="flex-1 border-t border-grey-normal" />
                <span class="shrink-0 text-xs text-grey-dark-active">{{
                  group.day
                }}</span>
                <div class="flex-1 border-t border-grey-normal" />
              </div>

              <!-- Messages in this day -->
              <div
                v-for="msg in group.msgs"
                :key="msg.id"
                class="flex"
                :class="isOwn(msg.sender.id) ? 'justify-end' : 'justify-start'"
              >
                <!-- Offer bubble -->
                <div
                  v-if="msg.type === 'offer'"
                  class="w-[min(85%,280px)] rounded-2xl border p-3.5"
                  :class="
                    isOwn(msg.sender.id)
                      ? 'rounded-br-sm border-blue-light bg-blue-light'
                      : 'rounded-bl-sm border-grey-normal-hover bg-white'
                  "
                >
                  <div class="mb-2 flex items-center justify-between gap-2">
                    <span
                      class="rounded-xl px-2 py-0.5 text-[10px] font-medium"
                      :class="
                        offerStatusCls[msg.status ?? ''] ??
                        'bg-grey-normal text-grey-darker'
                      "
                    >
                      {{ msg.status_trans }}
                    </span>
                    <p class="text-xs text-grey-darker">
                      {{
                        isOwn(msg.sender.id)
                          ? t("negotiation.detail.you")
                          : msg.sender.store_name || msg.sender.full_name
                      }}
                    </p>
                  </div>

                  <SharedMoneyAmount
                    :amount="msg.price ?? 0"
                    currency="SAR"
                    :maximum-fraction-digits="0"
                    weight="bold"
                    class="text-2xl text-blue-normal"
                  />

                  <!-- Received pending → accept / reject inline -->
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
                      {{ t("negotiation.actions.reject") }}
                    </BaseButton>
                    <BaseButton
                      variant="primary"
                      size="sm"
                      class="flex-1 bg-blue-normal! text-white! hover:bg-blue-normal-hover!"
                      :loading="negotiationStore.actionLoading"
                      @click="acceptOffer(msg.id)"
                    >
                      {{ t("negotiation.actions.accept") }}
                    </BaseButton>
                  </div>

                  <!-- Own pending → cancel inline -->
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
                      {{ t("negotiation.actions.cancel") }}
                    </BaseButton>
                  </div>

                  <p class="mt-2 text-end text-[10px] text-grey-dark-active">
                    {{ formatTime(msg.created_at) }}
                  </p>
                </div>

                <!-- Text bubble -->
                <div
                  v-else-if="msg.content"
                  class="max-w-[85%] rounded-2xl px-4 py-2.5"
                  :class="
                    isOwn(msg.sender.id)
                      ? 'rounded-br-sm bg-blue-normal text-white'
                      : 'rounded-bl-sm bg-white text-black-normal'
                  "
                >
                  <p class="text-sm leading-6 whitespace-pre-wrap">
                    {{ msg.content }}
                  </p>
                  <p
                    class="mt-0.5 text-end text-[10px]"
                    :class="
                      isOwn(msg.sender.id)
                        ? 'text-blue-light-active'
                        : 'text-grey-dark-active'
                    "
                  >
                    {{ formatTime(msg.created_at) }}
                  </p>
                </div>
              </div>
            </template>

            <div ref="messagesEndRef" aria-hidden="true" />
          </div>
        </div>

        <!-- ── Input area ──────────────────────────────────────────── -->
        <div
          v-if="!isClosed && !isFinished"
          class="shrink-0 border-t border-grey-normal-hover bg-white px-4 py-3"
        >
          <p v-if="sendError" class="mb-2 text-xs text-status-canceled-text">
            {{ sendError }}
          </p>
          <div class="flex gap-2">
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- ── Finished footer ─────────────────────────────────────── -->
        <div
          v-else-if="isFinished"
          class="shrink-0 border-t border-grey-normal-hover bg-grey-light px-4 py-3 text-center"
        >
          <p class="text-sm text-grey-darker">
            {{ t("negotiation.finished.deliveredMessage") }}
          </p>
        </div>
      </template>

      <!-- Not found -->
      <div
        v-else-if="!negotiationStore.detailLoading"
        class="flex-1 flex items-center justify-center"
      >
        <p class="text-sm text-grey-darker">
          {{ t("negotiation.errors.loadFailed") }}
        </p>
      </div>
    </template>
  </BaseDrawer>
</template>
