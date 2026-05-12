<script setup lang="ts">
import type { Product, ProductPriceType } from "~/types/product";

type ProductCondition = "new" | "used";

interface HomeProductConfig {
  id: string;
  titleKey: string;
  image: string;
  condition: ProductCondition;
  price: number;
  priceType: ProductPriceType;
}

interface HomeProduct extends Product {
  condition: ProductCondition;
}

definePageMeta({
  layout: "public",
});

const { t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

const searchQuery = ref("");

const productConfigs: HomeProductConfig[] = [
  {
    id: "denim-jacket",
    titleKey: "denimJacket",
    image: "/images/home/product-denim-jacket.png",
    condition: "used",
    price: 250,
    priceType: "fixed",
  },
  {
    id: "flame-heel",
    titleKey: "flameHeel",
    image: "/images/home/product-red-heels.png",
    condition: "new",
    price: 320,
    priceType: "negotiable",
  },
  {
    id: "heart-coat",
    titleKey: "heartCoat",
    image: "/images/home/product-heart-coat.png",
    condition: "new",
    price: 180,
    priceType: "fixed",
  },
  {
    id: "pink-coat",
    titleKey: "pinkCoat",
    image: "/images/home/product-pink-coat.png",
    condition: "new",
    price: 210,
    priceType: "negotiable",
  },
  {
    id: "denim-jacket-alt",
    titleKey: "denimJacket",
    image: "/images/home/product-denim-jacket.png",
    condition: "used",
    price: 250,
    priceType: "fixed",
  },
];

const recommendedProductConfigs: HomeProductConfig[] = [
  productConfigs[4]!,
  productConfigs[1]!,
  productConfigs[2]!,
  productConfigs[3]!,
  productConfigs[0]!,
];

const homeServices = computed(() => [
  {
    key: "delivery",
    title: t("homePage.services.fastDelivery.title"),
    message: t("homePage.services.fastDelivery.message"),
  },
  {
    key: "installment",
    title: t("homePage.services.installment.title"),
    message: t("homePage.services.installment.message"),
  },
  {
    key: "guarantee",
    title: t("homePage.services.moneyGuarantee.title"),
    message: t("homePage.services.moneyGuarantee.message"),
  },
]);

const sellerBenefitKeys = [
  "uploadProducts",
  "directContact",
  "manageSales",
  "highlightProduct",
] as const;

const sellerBenefits = computed(() =>
  sellerBenefitKeys.map((key) => t(`homePage.promo.benefits.${key}`)),
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

function buildProduct(config: HomeProductConfig): HomeProduct {
  const title = t(`homePage.products.${config.titleKey}`);

  return {
    id: config.id,
    title,
    price: {
      amount: config.price,
      currency: "SAR",
    },
    priceType: config.priceType,
    categoryId: "fashion",
    sellerId: "swapo-fixture",
    condition: config.condition,
    media: [
      {
        id: `${config.id}-cover`,
        type: "image",
        url: config.image,
        alt: title,
        isCover: true,
      },
    ],
  };
}

const featuredProducts = computed(() => productConfigs.map(buildProduct));
const recommendedProducts = computed(() =>
  recommendedProductConfigs.map(buildProduct),
);

const productSections = computed(() => [
  {
    id: "featured",
    title: t("homePage.sections.featuredTitle"),
    products: featuredProducts.value,
  },
  {
    id: "recommended",
    title: t("homePage.sections.recommendedTitle"),
    products: recommendedProducts.value,
  },
]);

const conditionLabels = computed<Record<ProductCondition, string>>(() => ({
  new: t("product.condition.new"),
  used: t("product.condition.used"),
}));

function submitSearch() {
  const query = searchQuery.value.trim();
  const path = localePath("/products");

  router.push(query ? { path, query: { q: query } } : path);
}

function handleFavorite() {
  router.push(localePath("/auth/login"));
}

useHead(() => ({
  title: t("homePage.metaTitle"),
}));
</script>

<template>
  <main class="bg-white">
    <!-- Start Hero -->
    <section
      class="relative isolate overflow-hidden bg-brand-cyan-light"
      :aria-labelledby="'home-hero-title'"
    >
      <div
        class="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(235,249,254,0)_0%,rgba(193,237,251,0.38)_100%)]"
        aria-hidden="true"
      />

      <div
        class="container-app relative grid min-h-[620px] items-center gap-10 py-12 lg:min-h-[792px] lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] lg:py-16"
      >
        <div
          class="relative z-10 flex max-w-2xl flex-col items-start gap-6 text-start"
        >
          <div class="flex flex-col gap-2">
            <h1
              id="home-hero-title"
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
    </section>
    <!-- end hero -->
    <section
      class="border-b border-grey-normal bg-white"
      :aria-label="t('homePage.services.label')"
    >
      <div class="container-app grid gap-4 py-4 md:grid-cols-3 md:gap-0">
        <article
          v-for="(service, index) in homeServices"
          :key="service.key"
          :class="[
            'flex items-center justify-start gap-3 py-2 text-start md:justify-center md:px-6',
            index > 0 ? 'md:border-s md:border-grey-normal-hover' : '',
          ]"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand-cyan-light text-blue-normal"
          >
            <svg
              v-if="service.key === 'delivery'"
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
            <svg
              v-else-if="service.key === 'installment'"
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
            <svg
              v-else
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
              >{{ service.title }}</strong
            >
            <span class="text-sm leading-5 text-grey-darker">{{
              service.message
            }}</span>
          </span>
        </article>
      </div>
    </section>

    <div class="py-8 lg:py-10">
      <section
        v-for="section in productSections"
        :key="section.id"
        class="bg-white py-4 lg:py-6"
        :aria-labelledby="`home-${section.id}-title`"
      >
        <div class="container-app">
          <header class="mb-4 flex items-center justify-between gap-4">
            <h2
              :id="`home-${section.id}-title`"
              class="min-w-0 truncate text-2xl font-medium leading-6 text-black-normal-hover"
            >
              {{ section.title }}
            </h2>
          </header>

          <div
            v-if="section.products.length"
            class="scrollbar-none -mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0"
          >
            <SharedCatalogProductCard
              v-for="product in section.products"
              :key="`${section.id}-${product.id}`"
              :product="product"
              :to="`/products/${product.id}`"
              :condition-label="conditionLabels[product.condition]"
              :listing-label="t('product.listingType.ad')"
              show-favorite
              class="w-[min(82vw,326px)] shrink-0 snap-start md:w-[326px]"
              @favorite="handleFavorite"
            />
          </div>

          <SharedFeedbackEmptyState
            v-else
            :title="t('homePage.sections.emptyTitle')"
            :message="t('homePage.sections.emptyMessage')"
            tone="brand"
          />

          <div
            v-if="section.products.length"
            class="mx-auto mt-3 h-[3px] w-[125px] rounded-xl bg-grey-normal"
            aria-hidden="true"
          >
            <div
              class="ms-auto h-full w-[34px] rounded-xl bg-blue-light-active"
            />
          </div>
        </div>
      </section>

      <section
        class="container-app py-6 lg:py-8"
        :aria-labelledby="'home-seller-promo-title'"
      >
        <div
          class="relative isolate overflow-hidden rounded-lg bg-brand-cyan-light px-5 py-8 text-center sm:px-8 lg:min-h-[232px] lg:rounded-[32px] lg:px-16"
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
          >
            {{ chip.label }}
          </span>

          <div
            class="relative mx-auto flex max-w-[520px] flex-col items-center gap-6"
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
