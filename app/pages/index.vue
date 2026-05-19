<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import {
  Autoplay,
  Pagination,
  FreeMode,
  Navigation,
  EffectCoverflow,
} from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { Product } from "~/types/product";
import { useApi, apiFetch } from "~/composables/useApi";

interface HomeCategory {
  id: number;
  title: string;
  image: string;
}

interface HomeSlider {
  id: number;
  slider_type: string;
  title: string;
  desc: string;
  external_link?: string;
  image: string;
  seller_data: { id: number; full_name: string; image: string };
}

interface HomeFeature {
  id: number;
  title: string;
  desc: string;
  image: string;
}

interface HomeApiProduct {
  id: number;
  product_name: string;
  cover: string;
  status: "new" | "used";
  status_trans: string;
  ad_type: "direct" | "negotiation";
  ad_type_trans: string;
  price: number;
  availability_status: string;
  is_favorite: boolean;
  seller_data: {
    id: number;
    full_name: string;
    store_name?: string;
    image: string;
  };
}

interface HomeData {
  categories: HomeCategory[];
  sliders: HomeSlider[];
  features: HomeFeature[];
  latest_products: HomeApiProduct[];
  used_products: HomeApiProduct[];
  new_products: HomeApiProduct[];
  recently_viewed_products: HomeApiProduct[];
  suggested_products: HomeApiProduct[];
  boosted_products: HomeApiProduct[];
}

interface HomeApiResponse {
  data: HomeData;
  status: string;
}

type ApiProduct = Product & { condition: "new" | "used" };

type PageSection =
  | { type: "products"; id: string; title: string; products: ApiProduct[] }
  | { type: "promo" }
  | { type: "app" };

interface Post {
  id: number;
  is_viewed: boolean;
  product_data: {
    id: number;
    product_name: string;
    product_desc: string;
    banner: string;
  };
}

interface PostsApiResponse {
  data: Post[];
  meta: { current_page: number; last_page: number };
  status: string;
}

interface PostDetailApiResponse {
  data: Post;
  status: string;
}

definePageMeta({ layout: "public" });

const { t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();
const authStore = useAuthStore();

const { data: homeResponse, pending } = useApi<HomeApiResponse>("home");

const homeData = computed(() => homeResponse.value?.data);
const isSeller = computed(() => authStore.user?.is_seller ?? false);

function toProduct(item: HomeApiProduct): ApiProduct {
  return {
    id: String(item.id),
    title: item.product_name,
    price: { amount: item.price, currency: "SAR" },
    priceType: item.ad_type === "direct" ? "fixed" : "negotiable",
    categoryId: "",
    sellerId: String(item.seller_data.id),
    condition: item.status,
    media: [
      {
        id: `${item.id}-cover`,
        type: "image",
        url: item.cover,
        alt: item.product_name,
        isCover: true,
      },
    ],
  };
}

function mapSections(
  list: Array<{ id: string; title: string; products: HomeApiProduct[] }>,
): Array<{
  type: "products";
  id: string;
  title: string;
  products: ApiProduct[];
}> {
  return list
    .filter((s) => s.products.length > 0)
    .map((s) => ({
      type: "products" as const,
      ...s,
      products: s.products.map(toProduct),
    }));
}

const conditionLabels = computed<Record<string, string>>(() => ({
  new: t("product.condition.new"),
  used: t("product.condition.used"),
}));

const pageSections = computed((): PageSection[] => {
  const data = homeData.value;
  const sections: PageSection[] = [];

  if (data) {
    mapSections([
      {
        id: "latest",
        title: t("homePage.sections.latestTitle"),
        products: data.latest_products ?? [],
      },
      {
        id: "used",
        title: t("homePage.sections.usedTitle"),
        products: data.used_products ?? [],
      },
      {
        id: "new",
        title: t("homePage.sections.newTitle"),
        products: data.new_products ?? [],
      },
    ]).forEach((s) => sections.push(s));
  }

  if (!isSeller.value) sections.push({ type: "promo" });

  if (data) {
    mapSections([
      {
        id: "suggested",
        title: t("homePage.sections.suggestedTitle"),
        products: data.suggested_products ?? [],
      },
    ]).forEach((s) => sections.push(s));
  }

  sections.push({ type: "app" });

  if (data) {
    const afterApp: Array<{
      id: string;
      title: string;
      products: HomeApiProduct[];
    }> = [];
    if (data.recently_viewed_products?.length) {
      afterApp.push({
        id: "recent",
        title: t("homePage.sections.recentlyViewedTitle"),
        products: data.recently_viewed_products,
      });
    }
    if (data.boosted_products?.length) {
      afterApp.push({
        id: "boosted",
        title: t("homePage.sections.boostedTitle"),
        products: data.boosted_products,
      });
    }
    mapSections(afterApp).forEach((s) => sections.push(s));
  }

  return sections;
});

function pageSectionKey(item: PageSection): string {
  return item.type === "products" ? `section-${item.id}` : item.type;
}

const sellerBenefitKeys = [
  "uploadProducts",
  "directContact",
  "manageSales",
  "highlightProduct",
] as const;

const sellerBenefits = computed(() =>
  sellerBenefitKeys.map((k) => t(`homePage.promo.benefits.${k}`)),
);

const sellerChips = computed(() => [
  {
    label: t("homePage.promo.chips.lowCommission"),
    class: "left-[18%] top-3 -rotate-12 bg-grey-dark text-black-normal",
  },
  {
    label: t("homePage.promo.chips.moreBuyers"),
    class: "right-[8%] top-5 rotate-12 bg-[#ffc9c9] text-black-normal",
  },
  {
    label: t("homePage.promo.chips.yourPrices"),
    class: "left-0 top-16 rotate-12 bg-black text-white",
  },
  {
    label: t("homePage.promo.chips.easy"),
    class: "left-[15%] bottom-9 -rotate-12 bg-[#ffecc9] text-[#725100]",
  },
  {
    label: t("homePage.promo.chips.fastUpload"),
    class: "right-[25%] bottom-7 rotate-12 bg-[#c9ffda] text-[#004e39]",
  },
]);

function handleFavorite() {
  router.push(localePath("/auth/login"));
}

const swiperProgressMap = ref<Record<string, number>>({});

function onSwiperProgress(sectionId: string, progress: number) {
  swiperProgressMap.value[sectionId] = progress;
}

// ── Posts feed ──────────────────────────────────────────────────────────────
const postsOpen = ref(false);
const posts = ref<Post[]>([]);
const postsPage = ref(1);
const postsLastPage = ref(1);
const postsLoading = ref(false);
const activePost = ref<Post | null>(null);
const postsSwiper = ref<SwiperType | null>(null);

const hasMorePosts = computed(() => postsPage.value < postsLastPage.value);

async function fetchPosts(page: number) {
  if (postsLoading.value) return;
  postsLoading.value = true;
  try {
    const res = await apiFetch<PostsApiResponse>("post", { query: { page } });
    posts.value = page === 1 ? res.data : [...posts.value, ...res.data];
    postsLastPage.value = res.meta.last_page;
    postsPage.value = page;
    await nextTick();
    postsSwiper.value?.update();
  } finally {
    postsLoading.value = false;
  }
}

async function openPostsFeed() {
  postsOpen.value = true;
  if (posts.value.length === 0) await fetchPosts(1);
}

function closePostsFeed() {
  postsOpen.value = false;
  activePost.value = null;
}

async function onPostsSwiperReachEnd() {
  if (!hasMorePosts.value || postsLoading.value) return;
  await fetchPosts(postsPage.value + 1);
}

function openPostDetail(post: Post) {
  // Show immediately with data already in the list — no loading wait
  activePost.value = post;
  // Silently refresh from API in background to pick up any extra fields
  apiFetch<PostDetailApiResponse>(`post/${post.id}`)
    .then((res) => {
      if (activePost.value?.id === post.id) activePost.value = res.data;
    })
    .catch(() => {});
}

if (import.meta.client) {
  watch(postsOpen, (open) => {
    document.body.style.overflow = open ? "hidden" : "";
  });
}

useHead(() => ({ title: t("homePage.metaTitle") }));
</script>

<template>
  <main class="overflow-x-hidden bg-white">
    <!-- ── Hero Slider ─────────────────────────────────────────────────── -->
    <section
      v-if="pending || homeData?.sliders?.length"
      class="relative isolate overflow-hidden bg-brand-cyan-light"
      :aria-label="t('homePage.hero.searchLabel')"
    >
      <template v-if="pending && !homeData">
        <div
          class="h-[60vh] w-full animate-pulse bg-brand-cyan-light/60 lg:h-[75vh]"
          aria-hidden="true"
        />
      </template>
      <template v-else-if="homeData?.sliders?.length">
        <Swiper
          :modules="[Autoplay, Pagination]"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
          :pagination="{ clickable: true }"
          :loop="homeData.sliders.length > 1"
          class="hero-swiper h-[60vh] w-full lg:h-[75vh]"
        >
          <SwiperSlide v-for="slide in homeData.sliders" :key="slide.id">
            <component
              :is="slide.external_link ? 'a' : 'div'"
              :href="slide.external_link || undefined"
              :target="slide.external_link ? '_blank' : undefined"
              :rel="slide.external_link ? 'noopener noreferrer' : undefined"
              class="relative block h-full w-full overflow-hidden"
            >
              <img
                :src="slide.image"
                :alt="slide.title"
                class="absolute inset-0 size-full object-cover"
                loading="eager"
              />
            </component>
          </SwiperSlide>
        </Swiper>
      </template>
    </section>

    <!-- ── Features bar ────────────────────────────────────────────────── -->
    <section
      v-if="pending || homeData?.features?.length"
      class="border-b border-grey-normal bg-white"
      :aria-label="t('homePage.services.label')"
    >
      <div class="container-app grid gap-4 py-4 md:grid-cols-3 md:gap-0">
        <template v-if="pending && !homeData">
          <article
            v-for="i in 3"
            :key="i"
            :class="[
              'flex items-center gap-3 py-2 md:px-6',
              i > 1 ? 'md:border-s md:border-grey-normal-hover' : '',
            ]"
          >
            <BaseSkeleton
              variant="circle"
              width="w-10"
              height="h-10"
              class="shrink-0"
            />
            <span class="flex min-w-0 flex-1 flex-col gap-2">
              <BaseSkeleton variant="text" width="w-32" height="h-4" />
              <BaseSkeleton variant="text" width="w-44" height="h-3" />
            </span>
          </article>
        </template>
        <template v-else>
          <article
            v-for="(feature, index) in homeData?.features"
            :key="feature.id"
            :class="[
              'flex items-center justify-start gap-3 py-2 text-start md:justify-center md:px-6',
              index > 0 ? 'md:border-s md:border-grey-normal-hover' : '',
            ]"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-brand-cyan-light"
            >
              <img
                :src="feature.image"
                :alt="feature.title"
                class="size-full object-contain"
                loading="lazy"
              />
            </span>
            <span class="flex min-w-0 flex-col gap-1">
              <strong
                class="text-base font-medium leading-6 text-black-normal-hover"
                >{{ feature.title }}</strong
              >
              <span class="text-sm leading-5 text-grey-darker">{{
                feature.desc
              }}</span>
            </span>
          </article>
        </template>
      </div>
    </section>

    <!-- ── Page body ───────────────────────────────────────────────────── -->
    <div class="py-8 lg:py-10">
      <!-- ── Skeleton ───────────────────────────────────────────────────── -->
      <template v-if="pending && !homeData">
        <!-- Categories skeleton -->
        <section class="mb-2 bg-white py-4 lg:py-6">
          <div
            class="container-app mb-4 flex items-center justify-between gap-4"
          >
            <BaseSkeleton variant="text" width="w-40" height="h-6" />
            <BaseSkeleton variant="text" width="w-16" height="h-4" />
          </div>
          <div class="container-app flex gap-4 overflow-hidden">
            <div
              v-for="i in 6"
              :key="i"
              class="flex shrink-0 flex-col items-center gap-2"
            >
              <BaseSkeleton variant="circle" width="w-16" height="h-16" />
              <BaseSkeleton variant="text" width="w-14" height="h-3" />
            </div>
          </div>
        </section>

        <!-- Product section skeletons -->
        <section v-for="i in 3" :key="i" class="bg-white py-4 lg:py-6">
          <div
            class="container-app mb-4 flex items-center justify-between gap-4"
          >
            <BaseSkeleton variant="text" width="w-48" height="h-6" />
            <BaseSkeleton variant="text" width="w-16" height="h-4" />
          </div>
          <div
            class="container-app grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5"
          >
            <div v-for="j in 4" :key="j" class="flex flex-col gap-2">
              <BaseSkeleton variant="rect" height="h-52" />
              <BaseSkeleton variant="text" width="w-3/4" height="h-4" />
              <BaseSkeleton variant="text" width="w-1/2" height="h-4" />
            </div>
          </div>
        </section>
      </template>

      <!-- ── Content ────────────────────────────────────────────────────── -->
      <template v-else>
        <!-- Categories -->
        <section
          v-if="homeData?.categories?.length"
          class="mb-2 bg-white py-4 lg:py-6"
          :aria-labelledby="'home-categories-title'"
        >
          <div
            class="container-app mb-4 flex items-center justify-between gap-4"
          >
            <h2
              id="home-categories-title"
              class="min-w-0 truncate text-2xl font-medium leading-6 text-black-normal-hover"
            >
              {{ t("homePage.sections.categoriesTitle") }}
            </h2>
            <NuxtLink
              :to="localePath('/products')"
              class="shrink-0 text-sm font-medium text-blue-normal hover:text-blue-normal-hover"
            >
              {{ t("homePage.sections.viewAll") }}
            </NuxtLink>
          </div>

          <Swiper
            :modules="[FreeMode]"
            :free-mode="{ enabled: true, momentum: true }"
            slides-per-view="auto"
            :space-between="16"
            :breakpoints="{
              640: { spaceBetween: 20 },
              1024: { spaceBetween: 24 },
            }"
            class="swiper-inset overflow-visible! pb-2"
          >
            <SwiperSlide
              v-for="category in homeData.categories"
              :key="category.id"
              class="w-24! sm:w-32!"
            >
              <NuxtLink
                :to="localePath(`/products?category=${category.id}`)"
                class="flex flex-col items-center gap-2"
              >
                <span
                  class="flex size-16 items-center justify-center overflow-hidden rounded-full border border-grey-normal bg-grey-light-active sm:size-18"
                >
                  <img
                    :src="category.image"
                    :alt="category.title"
                    class="size-full object-cover"
                    loading="lazy"
                  />
                </span>
                <span
                  class="w-full text-center text-xs leading-4 text-black-normal line-clamp-2"
                  >{{ category.title }}</span
                >
              </NuxtLink>
            </SwiperSlide>
          </Swiper>
        </section>

        <!-- Page sections: products / promo / app download (ordered) -->
        <template v-for="item in pageSections" :key="pageSectionKey(item)">
          <!-- Product section -->
          <section
            v-if="item.type === 'products'"
            class="bg-white py-4 lg:py-6"
            :aria-labelledby="`home-${item.id}-title`"
          >
            <div
              class="container-app mb-4 flex items-center justify-between gap-4"
            >
              <h2
                :id="`home-${item.id}-title`"
                class="min-w-0 truncate text-2xl font-medium leading-6 text-black-normal-hover"
              >
                {{ item.title }}
              </h2>
              <NuxtLink
                :to="localePath('/products')"
                class="shrink-0 text-sm font-medium text-blue-normal hover:text-blue-normal-hover"
              >
                {{ t("homePage.sections.viewAll") }}
              </NuxtLink>
            </div>

            <Swiper
              :modules="[FreeMode, Navigation]"
              :free-mode="{ enabled: true, momentum: true }"
              :navigation="true"
              :slides-per-view="1.2"
              :space-between="12"
              :breakpoints="{
                480: { slidesPerView: 2, spaceBetween: 14 },
                768: { slidesPerView: 3, spaceBetween: 16 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1280: { slidesPerView: 4, spaceBetween: 24 },
              }"
              class="swiper-inset product-swiper overflow-visible! pb-4"
              @progress="(_, p) => onSwiperProgress(item.id, p)"
            >
              <SwiperSlide
                v-for="product in item.products"
                :key="`${item.id}-${product.id}`"
              >
                <SharedCatalogProductCard
                  :product="product"
                  :to="`/products/${product.id}`"
                  :condition-label="conditionLabels[product.condition]"
                  :listing-label="t('product.listingType.ad')"
                  show-favorite
                  @favorite="handleFavorite"
                />
              </SwiperSlide>
            </Swiper>

            <div class="container-app mt-1">
              <div
                class="mx-auto h-0.75 w-31.25 rounded-xl bg-grey-normal"
                aria-hidden="true"
              >
                <div
                  class="h-full w-8.5 rounded-xl bg-blue-light-active"
                  :style="{
                    marginInlineStart: `${(swiperProgressMap[item.id] ?? 0) * 91}px`,
                    transition: 'margin-inline-start 150ms ease',
                  }"
                />
              </div>
            </div>
          </section>

          <!-- Seller Promo -->
          <section
            v-else-if="item.type === 'promo'"
            class="container-app py-6 lg:py-8"
            :aria-labelledby="'home-seller-promo-title'"
          >
            <div
              class="relative isolate overflow-hidden rounded-lg bg-brand-cyan-light px-5 py-8 text-center sm:px-8 lg:min-h-58 lg:rounded-4xl lg:px-16"
            >
              <div
                class="absolute inset-0 opacity-50 bg-[linear-gradient(110deg,rgba(255,255,255,0.72),rgba(55,197,243,0.16))]"
                aria-hidden="true"
              />
              <span
                v-for="chip in sellerChips"
                :key="chip.label"
                :class="[
                  'absolute hidden rounded-full px-3 py-1 text-xs font-medium shadow-sm lg:inline-flex',
                  chip.class,
                ]"
                aria-hidden="true"
                >{{ chip.label }}</span
              >
              <div
                class="relative mx-auto flex max-w-130 flex-col items-center gap-6"
              >
                <div class="flex flex-col items-center gap-3">
                  <h2
                    id="home-seller-promo-title"
                    class="text-2xl font-bold leading-9 text-black-normal-hover"
                  >
                    {{ t("homePage.promo.title") }}
                  </h2>
                  <ul
                    class="grid gap-x-6 gap-y-1 text-start text-xs font-medium leading-6 text-black-normal sm:grid-cols-2"
                  >
                    <li
                      v-for="benefit in sellerBenefits"
                      :key="benefit"
                      class="flex items-center gap-2"
                    >
                      <svg
                        class="size-4 shrink-0 text-blue-normal"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="m3 8 3 3 7-7"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span>{{ benefit }}</span>
                    </li>
                  </ul>
                </div>
                <BaseButton
                  :to="localePath('/auth/lock')"
                  size="lg"
                  full-width
                  class="max-w-91 bg-blue-normal! text-brand-cyan! hover:bg-blue-normal-hover!"
                >
                  {{ t("homePage.promo.cta") }}
                </BaseButton>
              </div>
            </div>
          </section>

          <!-- App Download Banner (static) -->
          <section
            v-else-if="item.type === 'app'"
            class="container-app py-6 lg:py-8"
            :aria-label="t('homePage.appDownload.label')"
          >
            <div
              class="relative overflow-hidden rounded-2xl bg-[#0B1A55] px-6 pt-10 lg:h-64 lg:rounded-3xl lg:px-0 lg:pt-0"
            >
              <!-- Glow behind phones -->
              <div
                class="pointer-events-none absolute -top-10 inset-e-0 size-72 rounded-full bg-[radial-gradient(circle,rgba(55,197,243,0.35),rgba(55,197,243,0)_70%)] blur-2xl lg:size-112"
                aria-hidden="true"
              />

              <div
                class="relative flex flex-col items-center gap-6 lg:h-full lg:flex-row lg:items-center lg:justify-between lg:gap-8"
              >
                <!-- Text + badges -->
                <div
                  class="order-2 flex w-full flex-col items-center gap-5 text-center lg:order-1 lg:w-1/2 lg:items-start lg:ps-12 lg:text-start"
                >
                  <div class="flex flex-col gap-2">
                    <h2 class="text-2xl font-bold text-white lg:text-3xl">
                      {{ t("homePage.appDownload.title") }}
                    </h2>
                    <p class="text-sm leading-6 text-white/70 lg:text-base">
                      {{ t("homePage.appDownload.subtitle") }}
                    </p>
                  </div>
                  <div
                    class="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                  >
                    <a
                      href="#"
                      class="inline-flex h-14 items-center overflow-hidden rounded-xl transition hover:opacity-90"
                      :aria-label="t('homePage.appDownload.googlePlay')"
                    >
                      <img
                        src="/images/home/badge-google.png"
                        :alt="t('homePage.appDownload.googlePlay')"
                        class="h-14 w-auto"
                        loading="lazy"
                      />
                    </a>
                    <a
                      href="#"
                      class="inline-flex h-14 items-center overflow-hidden rounded-xl transition hover:opacity-90"
                      :aria-label="t('homePage.appDownload.appStore')"
                    >
                      <img
                        src="/images/home/badge-apple.png"
                        :alt="t('homePage.appDownload.appStore')"
                        class="h-14 w-auto"
                        loading="lazy"
                      />
                    </a>
                    <a
                      href="#"
                      class="inline-flex h-14 items-center overflow-hidden rounded-xl transition hover:opacity-90"
                      :aria-label="t('homePage.appDownload.appGallery')"
                    >
                      <img
                        src="/images/home/badge-gallery.png"
                        :alt="t('homePage.appDownload.appGallery')"
                        class="h-14 w-auto"
                        loading="lazy"
                      />
                    </a>
                  </div>
                </div>

                <!-- Phones -->
                <div
                  class="relative order-1 flex w-full justify-center lg:order-2 lg:h-full lg:w-1/2 lg:justify-end"
                >
                  <img
                    src="/images/home/app-phone.png"
                    :alt="t('homePage.appDownload.phoneAlt')"
                    class="relative z-10 h-48 w-auto object-contain lg:absolute lg:bottom-0 lg:inset-e-6 lg:h-72"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>
        </template>
      </template>
    </div>
    <!-- ── Best Products fixed button ───────────────────────────────────────── -->
    <button
      class="fixed bottom-6 inset-s-1/2 z-40 -translate-x-1/2 flex items-center gap-2 rounded-full bg-blue-normal px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-normal-hover active:scale-95 rtl:translate-x-1/2"
      :aria-label="t('homePage.posts.buttonLabel')"
      @click="openPostsFeed"
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
          d="M8 1C5 4 3 6.5 3 9.5a5 5 0 0 0 10 0C13 6.5 11 4 8 1Z"
          fill="currentColor"
          opacity=".85"
        />
        <path
          d="M8 6c-1 1.5-1.5 2.5-1.5 3.5a1.5 1.5 0 0 0 3 0C9.5 8.5 9 7.5 8 6Z"
          fill="white"
          opacity=".7"
        />
      </svg>
      {{ t("homePage.posts.buttonLabel") }}
    </button>

    <!-- ── Posts feed overlay ────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="posts-overlay">
        <div
          v-if="postsOpen"
          class="fixed inset-0 z-9999 flex items-center justify-center bg-black/65 backdrop-blur-sm"
          role="dialog"
          :aria-label="t('homePage.posts.buttonLabel')"
          aria-modal="true"
          @click.self="closePostsFeed"
        >
          <!-- ── First-load skeleton ── -->
          <div v-if="postsLoading && posts.length === 0" class="w-full">
            <div
              class="mx-auto w-[72vw] max-w-75 animate-pulse rounded-2xl bg-white/10"
              style="aspect-ratio: 3/4"
            />
          </div>

          <!-- ── Empty state ── -->
          <div
            v-else-if="!postsLoading && posts.length === 0"
            class="flex flex-col items-center gap-2"
          >
            <span class="text-sm text-white/60">{{ t("common.empty") }}</span>
          </div>

          <!-- ── Coverflow swiper ── -->
          <Swiper
            v-else
            :modules="[EffectCoverflow]"
            effect="coverflow"
            :coverflow-effect="{
              rotate: 30,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }"
            :grab-cursor="true"
            :centered-slides="true"
            slides-per-view="auto"
            :space-between="16"
            class="posts-feed-swiper w-full"
            @swiper="(s: SwiperType) => (postsSwiper = s)"
            @reachEnd="onPostsSwiperReachEnd"
          >
            <SwiperSlide
              v-for="post in posts"
              :key="post.id"
              class="posts-card-slide"
            >
              <!-- Card -->
              <div
                class="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl will-change-transform"
                style="max-height: 70vh"
              >
                <!-- ✕ close button -->
                <button
                  class="absolute inset-e-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                  :aria-label="t('homePage.posts.close')"
                  @click.stop="closePostsFeed"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 1l8 8M9 1 1 9"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>

                <!-- Image -->
                <div
                  class="relative w-full overflow-hidden bg-grey-light"
                  style="aspect-ratio: 3/4"
                >
                  <img
                    :src="post.product_data.banner"
                    :alt="post.product_data.product_name"
                    class="size-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <!-- Info -->
                <div
                  class="flex cursor-pointer flex-col gap-2 px-4 pb-4 pt-3"
                  @click="openPostDetail(post)"
                >
                  <h3
                    class="line-clamp-2 text-sm font-bold leading-5 text-black-normal-hover"
                  >
                    {{ post.product_data.product_name }}
                  </h3>
                  <p class="line-clamp-2 text-xs leading-5 text-grey-darker">
                    {{ post.product_data.product_desc }}
                  </p>
                  <span
                    class="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-blue-normal px-3 py-2.5 text-xs font-bold text-white"
                  >
                    {{ t("homePage.posts.viewProduct") }} 🛒
                  </span>
                </div>
              </div>
            </SwiperSlide>

            <!-- Infinite-scroll sentinel -->
            <SwiperSlide v-if="hasMorePosts" class="posts-card-slide">
              <div
                class="flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/8"
                style="aspect-ratio: 3/4"
              >
                <div
                  v-if="postsLoading"
                  class="size-7 animate-spin rounded-full border-2 border-white/25 border-t-white/70"
                />
              </div>
            </SwiperSlide>
          </Swiper>

          <!-- ── Detail bottom sheet ── -->
          <Transition name="slide-up">
            <div
              v-if="activePost"
              class="absolute inset-x-0 bottom-0 z-10 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
            >
              <!-- Handle -->
              <div class="flex shrink-0 flex-col items-center pb-1 pt-3">
                <span
                  class="h-1 w-10 rounded-full bg-grey-normal"
                  aria-hidden="true"
                />
              </div>
              <!-- Sub-header -->
              <div
                class="flex shrink-0 items-center gap-3 border-b border-grey-normal px-5 pb-3"
              >
                <button
                  class="flex size-8 shrink-0 items-center justify-center rounded-full bg-grey-light text-black-normal transition hover:bg-grey-normal"
                  :aria-label="t('homePage.posts.back')"
                  @click="activePost = null"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    class="rtl:rotate-180"
                  >
                    <path
                      d="M9 2 3 7l6 5"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <span
                  class="min-w-0 flex-1 truncate text-sm font-semibold text-black-normal-hover"
                >
                  {{ activePost.product_data.product_name }}
                </span>
              </div>
              <!-- Scrollable content -->
              <div class="overflow-y-auto overscroll-contain">
                <img
                  :src="activePost.product_data.banner"
                  :alt="activePost.product_data.product_name"
                  class="w-full object-cover"
                  style="max-height: 42vh"
                  loading="eager"
                />
                <div class="flex flex-col gap-4 p-5 pb-10">
                  <h2
                    class="text-xl font-bold leading-7 text-black-normal-hover"
                  >
                    {{ activePost.product_data.product_name }}
                  </h2>
                  <p class="text-sm leading-6 text-grey-darker">
                    {{ activePost.product_data.product_desc }}
                  </p>
                  <NuxtLink
                    :to="localePath(`/products/${activePost.product_data.id}`)"
                    class="flex items-center justify-center gap-2 rounded-xl bg-blue-normal px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-normal-hover"
                    @click="closePostsFeed"
                  >
                    {{ t("homePage.posts.viewProduct") }}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                      class="rtl:rotate-180"
                    >
                      <path
                        d="M2.5 7h9M8 3l4 4-4 4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<style>
/* Product swiper navigation arrows */
.product-swiper .swiper-button-next,
.product-swiper .swiper-button-prev {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 10px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  color: var(--color-blue-normal);
  top: 38%;
}
.product-swiper .swiper-button-next::after,
.product-swiper .swiper-button-prev::after {
  font-size: 13px;
  font-weight: 700;
}
.product-swiper .swiper-button-disabled {
  opacity: 0;
  pointer-events: none;
}

/* Posts feed overlay — fade in */
.posts-overlay-enter-active {
  transition: opacity 0.22s ease;
}
.posts-overlay-leave-active {
  transition: opacity 0.18s ease;
}
.posts-overlay-enter-from,
.posts-overlay-leave-to {
  opacity: 0;
}

/* Detail sheet — slide up from bottom */
.slide-up-enter-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-leave-active {
  transition: transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Coverflow card slide — explicit width so slides-per-view="auto" works */
.posts-feed-swiper .posts-card-slide {
  width: 200px;
}
@media (min-width: 480px) {
  .posts-feed-swiper .posts-card-slide {
    width: 220px;
  }
}
@media (min-width: 768px) {
  .posts-feed-swiper .posts-card-slide {
    width: 240px;
  }
}
@media (min-width: 1024px) {
  .posts-feed-swiper .posts-card-slide {
    width: 280px;
  }
}

/* Hero pagination pill animation */
.hero-swiper .swiper-pagination-bullet {
  background: white;
  opacity: 0.5;
  width: 8px;
  height: 8px;
  transition:
    width 0.3s,
    opacity 0.3s;
}
.hero-swiper .swiper-pagination-bullet-active {
  opacity: 1;
  width: 24px;
  border-radius: 4px;
}
</style>
