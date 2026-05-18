<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, FreeMode, Navigation } from "swiper/modules";
import type { Product } from "~/types/product";
import { useApi } from "~/composables/useApi";

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

definePageMeta({ layout: "public" });

const { t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

const { data: homeResponse } = await useApi<HomeApiResponse>("home");

const homeData = computed(() => homeResponse.value?.data);

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

const conditionLabels = computed<Record<string, string>>(() => ({
  new: t("product.condition.new"),
  used: t("product.condition.used"),
}));

const productSections = computed(() => {
  const data = homeData.value;
  if (!data) return [];

  const base = [
    {
      id: "latest",
      title: t("homePage.sections.latestTitle"),
      products: data.latest_products ?? [],
    },
    {
      id: "new",
      title: t("homePage.sections.newTitle"),
      products: data.new_products ?? [],
    },
    {
      id: "used",
      title: t("homePage.sections.usedTitle"),
      products: data.used_products ?? [],
    },
    {
      id: "suggested",
      title: t("homePage.sections.suggestedTitle"),
      products: data.suggested_products ?? [],
    },
    {
      id: "boosted",
      title: t("homePage.sections.boostedTitle"),
      products: data.boosted_products ?? [],
    },
  ];

  if (data.recently_viewed_products?.length) {
    base.unshift({
      id: "recent",
      title: t("homePage.sections.recentlyViewedTitle"),
      products: data.recently_viewed_products,
    });
  }

  return base
    .filter((s) => s.products.length > 0)
    .map((s) => ({ ...s, products: s.products.map(toProduct) }));
});

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

useHead(() => ({ title: t("homePage.metaTitle") }));
</script>

<template>
  <main class="overflow-x-hidden bg-white">
    <!-- ── Hero Slider ─────────────────────────────────────────────────── -->
    <section
      class="relative isolate overflow-hidden bg-brand-cyan-light"
      :aria-label="t('homePage.hero.searchLabel')"
    >
      <template v-if="homeData?.sliders?.length">
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

      <template v-else>
        <div
          class="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(235,249,254,0)_0%,rgba(193,237,251,0.38)_100%)]"
          aria-hidden="true"
        />
        <div
          class="container-app relative grid min-h-155 items-center gap-10 py-12 lg:min-h-198 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:py-16"
        >
          <div
            class="relative z-10 flex max-w-2xl flex-col items-start gap-6 text-start"
          >
            <div class="flex flex-col gap-2">
              <h1
                class="text-4xl font-bold leading-tight text-black-dark-hover sm:text-[46px]"
              >
                <span class="block">{{ t("homePage.hero.titleLine1") }}</span>
                <span class="block">{{ t("homePage.hero.titleLine2") }}</span>
              </h1>
              <p
                class="text-xl font-medium leading-8 text-grey-dark-active sm:text-[26px]"
              >
                {{ t("homePage.hero.subtitle") }}
              </p>
            </div>
          </div>
          <div class="relative min-h-[320px] lg:min-h-[560px]" dir="ltr">
            <div
              class="absolute inset-x-8 bottom-0 h-12 rounded-[50%] bg-blue-light-active/25 blur-sm"
              aria-hidden="true"
            />
            <img
              src="/images/home/hero-card.png"
              :alt="t('homePage.hero.cardAlt')"
              class="absolute bottom-0 left-[4%] h-[170px] w-[146px] rounded-t-[18px] object-cover shadow-sm sm:h-[230px] sm:w-[190px] lg:left-[2%] lg:h-[288px] lg:w-[220px]"
              loading="eager"
            />
            <img
              src="/images/home/hero-blazer.png"
              :alt="t('homePage.hero.blazerAlt')"
              class="absolute bottom-8 left-[20%] w-[68%] max-w-[520px] object-contain drop-shadow-sm lg:bottom-2 lg:left-[18%]"
              loading="eager"
            />
            <img
              src="/images/home/hero-handbag.png"
              :alt="t('homePage.hero.handbagAlt')"
              class="absolute bottom-10 right-0 w-[28%] max-w-[170px] object-contain drop-shadow-sm lg:bottom-20 lg:right-0"
              loading="eager"
            />
          </div>
        </div>
      </template>
    </section>

    <!-- ── Features bar ────────────────────────────────────────────────── -->
    <section
      class="border-b border-grey-normal bg-white"
      :aria-label="t('homePage.services.label')"
    >
      <div class="container-app grid gap-4 py-4 md:grid-cols-3 md:gap-0">
        <template v-if="homeData?.features?.length">
          <article
            v-for="(feature, index) in homeData.features"
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
        <template v-else>
          <article
            class="flex items-center justify-start gap-3 py-2 text-start md:justify-center md:px-6"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand-cyan-light text-blue-normal"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 6.5h10v8H3v-8ZM13 9h3.2l2.8 3v2.5h-6V9Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path
                  d="M6.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </span>
            <span class="flex min-w-0 flex-col gap-1">
              <strong
                class="text-base font-medium leading-6 text-black-normal-hover"
                >{{ t("homePage.services.fastDelivery.title") }}</strong
              >
              <span class="text-sm leading-5 text-grey-darker">{{
                t("homePage.services.fastDelivery.message")
              }}</span>
            </span>
          </article>
          <article
            class="flex items-center justify-start gap-3 py-2 text-start md:border-s md:border-grey-normal-hover md:justify-center md:px-6"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand-cyan-light text-blue-normal"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5"
                  width="16"
                  height="12"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M3 9h16M7 13h4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="flex min-w-0 flex-col gap-1">
              <strong
                class="text-base font-medium leading-6 text-black-normal-hover"
                >{{ t("homePage.services.installment.title") }}</strong
              >
              <span class="text-sm leading-5 text-grey-darker">{{
                t("homePage.services.installment.message")
              }}</span>
            </span>
          </article>
          <article
            class="flex items-center justify-start gap-3 py-2 text-start md:border-s md:border-grey-normal-hover md:justify-center md:px-6"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand-cyan-light text-blue-normal"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M11 3.5 17 6v4.5c0 3.7-2.4 6.4-6 8-3.6-1.6-6-4.3-6-8V6l6-2.5Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <path
                  d="m8.5 11 1.7 1.7 3.5-3.7"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="flex min-w-0 flex-col gap-1">
              <strong
                class="text-base font-medium leading-6 text-black-normal-hover"
                >{{ t("homePage.services.moneyGuarantee.title") }}</strong
              >
              <span class="text-sm leading-5 text-grey-darker">{{
                t("homePage.services.moneyGuarantee.message")
              }}</span>
            </span>
          </article>
        </template>
      </div>
    </section>

    <!-- ── Page body ───────────────────────────────────────────────────── -->
    <div class="py-8 lg:py-10">
      <!-- Categories -->
      <section
        v-if="homeData?.categories?.length"
        class="mb-2 bg-white py-4 lg:py-6"
        :aria-labelledby="'home-categories-title'"
      >
        <div class="container-app mb-4 flex items-center justify-between gap-4">
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

        <!-- full-width swiper aligned to container via .swiper-inset -->
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
            class="!w-[72px] sm:!w-[84px]"
          >
            <NuxtLink
              :to="localePath(`/products?category=${category.id}`)"
              class="flex flex-col items-center gap-2"
            >
              <span
                class="flex size-[64px] items-center justify-center overflow-hidden rounded-full border border-grey-normal bg-grey-light-active sm:size-[72px]"
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

      <!-- Product sections -->
      <section
        v-for="section in productSections"
        :key="section.id"
        class="bg-white py-4 lg:py-6"
        :aria-labelledby="`home-${section.id}-title`"
      >
        <!-- Section header -->
        <div class="container-app mb-4 flex items-center justify-between gap-4">
          <h2
            :id="`home-${section.id}-title`"
            class="min-w-0 truncate text-2xl font-medium leading-6 text-black-normal-hover"
          >
            {{ section.title }}
          </h2>
          <NuxtLink
            :to="localePath('/products')"
            class="shrink-0 text-sm font-medium text-blue-normal hover:text-blue-normal-hover"
          >
            {{ t("homePage.sections.viewAll") }}
          </NuxtLink>
        </div>

        <!-- Product swiper — full width, aligned via .swiper-inset -->
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
          @progress="(_, p) => onSwiperProgress(section.id, p)"
        >
          <SwiperSlide
            v-for="product in section.products"
            :key="`${section.id}-${product.id}`"
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

        <!-- Scroll indicator -->
        <div class="container-app mt-1">
          <div
            class="mx-auto h-0.75 w-31.25 rounded-xl bg-grey-normal"
            aria-hidden="true"
          >
            <div
              class="h-full w-8.5 rounded-xl bg-blue-light-active"
              :style="{
                marginInlineStart: `${(swiperProgressMap[section.id] ?? 0) * 91}px`,
                transition: 'margin-inline-start 150ms ease',
              }"
            />
          </div>
        </div>
      </section>

      <!-- Seller promo -->
      <section
        class="container-app py-6 lg:py-8"
        :aria-labelledby="'home-seller-promo-title'"
      >
        <div
          class="relative isolate overflow-hidden rounded-lg bg-brand-cyan-light px-5 py-8 text-center sm:px-8 lg:min-h-58 lg:rounded-4xl lg:px-16"
        >
          <div
            class="absolute inset-0 opacity-50 [background-image:linear-gradient(110deg,rgba(255,255,255,0.72),rgba(55,197,243,0.16))]"
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
              class="max-w-[364px] bg-blue-normal! text-brand-cyan! hover:bg-blue-normal-hover!"
            >
              {{ t("homePage.promo.cta") }}
            </BaseButton>
          </div>
        </div>
      </section>
    </div>
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
