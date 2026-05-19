<script setup lang="ts">
import type {
  ApiNegotiationListItem,
  NegotiationStatus,
} from "~/types/api-negotiation";
import { apiFetch } from "~/composables/useApi";

definePageMeta({
  layout: "public",
  middleware: "auth",
});

const { t } = useI18n();
const localePath = useLocalePath();
const authStore = useAuthStore();
const negotiationStore = useNegotiationStore();

useHead({ title: t("negotiation.list.title") });

// ── Role tab (seller sees both buyer + seller roles) ──────────────────────
const activeRole = ref<"buyer" | "seller">("buyer");
const isSeller = computed(() => authStore.user?.is_seller ?? false);

// ── Status filter ─────────────────────────────────────────────────────────
type StatusFilter = "" | "open" | "negotiating" | "agreed";
const activeStatus = ref<StatusFilter>("");

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: "", label: t("negotiation.list.filterAll") },
  { key: "open", label: t("negotiation.list.filterOpen") },
  { key: "negotiating", label: t("negotiation.list.filterNegotiating") },
  { key: "agreed", label: t("negotiation.list.filterAgreed") },
];

// ── Data ──────────────────────────────────────────────────────────────────
const loading = ref(false);
const negotiations = ref<ApiNegotiationListItem[]>([]);
const currentPage = ref(1);
const lastPage = ref(1);

async function fetchList(page = 1) {
  loading.value = true;
  try {
    const params: Record<string, string | number> = {
      role: activeRole.value,
      page,
    };
    if (activeStatus.value) params.status = activeStatus.value;

    const res = await apiFetch<{
      data: ApiNegotiationListItem[];
      meta: { current_page: number; last_page: number };
    }>("negotiation", { query: params });
    if (page === 1) {
      negotiations.value = res.data;
    } else {
      negotiations.value.push(...res.data);
    }
    currentPage.value = res.meta.current_page;
    lastPage.value = res.meta.last_page;
  } finally {
    loading.value = false;
  }
}

// Watch role and status changes → reset & refetch
watch(
  [activeRole, activeStatus],
  () => {
    currentPage.value = 1;
    fetchList(1);
  },
  { immediate: true },
);

async function loadMore() {
  if (currentPage.value < lastPage.value) {
    await fetchList(currentPage.value + 1);
  }
}

// ── Open drawer on row click ──────────────────────────────────────────────
async function openNegotiation(item: ApiNegotiationListItem) {
  await negotiationStore.openDrawerFromListItem(item);
}

// ── Helpers ───────────────────────────────────────────────────────────────
const statusClasses: Partial<Record<NegotiationStatus, string>> = {
  open: "bg-status-pending-bg text-status-pending-text",
  negotiating: "bg-blue-light text-blue-normal",
  agreed: "bg-status-confirmed-bg text-status-confirmed-text",
  paid: "bg-status-confirmed-bg text-status-confirmed-text",
  pending_payment: "bg-status-pending-bg text-status-pending-text",
  finished: "bg-grey-normal text-grey-darker",
  cancelled: "bg-status-canceled-bg text-status-canceled-text",
};

function counterpart(item: ApiNegotiationListItem) {
  return activeRole.value === "buyer" ? item.seller_data : item.buyer_data;
}

function counterpartName(item: ApiNegotiationListItem) {
  const party = counterpart(item);
  return party.store_name || party.full_name;
}

function lastActivityPreview(item: ApiNegotiationListItem): string {
  const la = item.last_activity;
  if (!la) return "";
  if (la.type === "offer" && la.price != null) {
    return t("negotiation.list.lastOffer", {
      price: la.price.toLocaleString(),
    });
  }
  return la.content ?? "";
}
</script>

<template>
  <main class="min-h-screen bg-grey-normal">
    <div class="container-app py-6">
      <!-- Page header -->
      <div class="mb-5 flex items-center justify-between">
        <h1 class="text-xl font-bold text-black-normal">
          {{ t("negotiation.list.title") }}
        </h1>

        <!-- Role toggle — visible for sellers only -->
        <div
          v-if="isSeller"
          class="flex rounded-xl border border-grey-normal-hover bg-white p-1"
        >
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            :class="
              activeRole === 'buyer'
                ? 'bg-blue-normal text-white'
                : 'text-grey-darker hover:bg-grey-normal'
            "
            @click="activeRole = 'buyer'"
          >
            {{ t("negotiation.list.roleBuyer") }}
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            :class="
              activeRole === 'seller'
                ? 'bg-blue-normal text-white'
                : 'text-grey-darker hover:bg-grey-normal'
            "
            @click="activeRole = 'seller'"
          >
            {{ t("negotiation.list.roleSeller") }}
          </button>
        </div>
      </div>

      <!-- Status filter chips -->
      <div class="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          type="button"
          class="shrink-0 rounded-2xl px-4 py-1.5 text-sm font-medium transition-colors"
          :class="
            activeStatus === tab.key
              ? 'bg-blue-normal text-white'
              : 'bg-white text-grey-darker border border-grey-normal-hover hover:border-blue-light'
          "
          @click="activeStatus = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading && !negotiations.length" class="flex flex-col gap-3">
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-3 rounded-2xl bg-white p-4"
        >
          <BaseSkeleton
            height="h-12"
            width="w-12"
            class="shrink-0 rounded-full"
          />
          <div class="flex flex-1 flex-col gap-2">
            <BaseSkeleton variant="text" width="w-1/3" />
            <BaseSkeleton variant="text" width="w-2/3" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <SharedFeedbackEmptyState
        v-else-if="!loading && !negotiations.length"
        :title="t('negotiation.list.empty')"
        :message="
          activeRole === 'buyer'
            ? t('negotiation.list.emptyBuyer')
            : t('negotiation.list.emptySeller')
        "
        :action-label="t('catalog.breadcrumbs.products')"
        :action-to="localePath('/products')"
        tone="neutral"
        variant="inline"
      />

      <!-- Negotiations list -->
      <div v-else class="flex flex-col gap-3">
        <button
          v-for="item in negotiations"
          :key="item.id"
          type="button"
          class="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-start transition-shadow hover:shadow-sm"
          @click="openNegotiation(item)"
        >
          <!-- Product cover -->
          <div class="relative shrink-0">
            <img
              v-if="item.product_data.cover"
              :src="item.product_data.cover"
              :alt="item.product_data.product_name"
              class="size-12 rounded-xl object-cover"
            />
            <div
              v-else
              class="flex size-12 items-center justify-center rounded-xl bg-grey-normal text-grey-dark-active"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
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
                <path
                  d="m3 15 4-4 4 4 4-6 4 6"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <!-- Counterpart avatar overlay -->
            <img
              v-if="counterpart(item).image"
              :src="counterpart(item).image"
              :alt="counterpartName(item)"
              class="absolute -bottom-1 -end-1 size-6 rounded-full border-2 border-white object-cover"
            />
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-sm font-medium text-black-normal">
                {{ counterpartName(item) }}
              </p>
              <span
                class="shrink-0 rounded-xl px-2 py-0.5 text-xs font-medium"
                :class="
                  statusClasses[item.status] ??
                  'bg-grey-normal text-grey-darker'
                "
              >
                {{ item.status_trans }}
              </span>
            </div>

            <p class="mt-0.5 truncate text-xs text-grey-darker">
              {{ item.product_data.product_name }}
            </p>

            <p
              v-if="item.last_activity"
              class="mt-1 truncate text-xs text-grey-dark-active"
            >
              {{ lastActivityPreview(item) }}
              <span class="ms-1 text-grey-normal-hover">·</span>
              <span class="ms-1">{{ item.last_activity.created_at }}</span>
            </p>
          </div>

          <!-- Chevron -->
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="shrink-0 text-grey-dark-active rtl:rotate-180"
            aria-hidden="true"
          >
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Load more -->
        <div v-if="currentPage < lastPage" class="mt-2 flex justify-center">
          <BaseButton variant="secondary" :loading="loading" @click="loadMore">
            {{ t("common.loadMore") }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Chat drawer -->
    <SharedChatNegotiationDrawer />
  </main>
</template>
