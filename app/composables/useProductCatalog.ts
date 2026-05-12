import type { FilterSection, SortOption } from "~/types/filter";
import type { Category, Product, ProductPriceType } from "~/types/product";

export type CatalogCondition = "new" | "used";

export interface CatalogProduct extends Product {
  condition: CatalogCondition;
  rating: number;
  publishedAt: string;
  searchTokens: string[];
  sortScore: number;
}

interface CatalogProductFixture {
  id: string;
  titleKey: string;
  image: string;
  condition: CatalogCondition;
  price: number;
  priceType: ProductPriceType;
  categoryId: CatalogCategoryId;
  rating: number;
  publishedAt: string;
  sortScore: number;
  searchTokens: string[];
}

export const catalogCategoryIds = [
  "mens-fashion",
  "pants",
  "dresses",
  "sportswear",
  "womens-fashion",
  "shoes",
  "accessories",
] as const;

export type CatalogCategoryId = (typeof catalogCategoryIds)[number];

const productFixtures: CatalogProductFixture[] = [
  {
    id: "blue-denim-jacket",
    titleKey: "blueDenimJacket",
    image: "/images/home/product-denim-jacket.png",
    condition: "used",
    price: 250,
    priceType: "fixed",
    categoryId: "mens-fashion",
    rating: 5,
    publishedAt: "2026-04-28",
    sortScore: 98,
    searchTokens: ["denim", "jacket", "mens", "blue"],
  },
  {
    id: "red-flame-heels",
    titleKey: "redFlameHeels",
    image: "/images/home/product-red-heels.png",
    condition: "new",
    price: 320,
    priceType: "negotiable",
    categoryId: "shoes",
    rating: 4,
    publishedAt: "2026-04-24",
    sortScore: 94,
    searchTokens: ["heels", "red", "shoes", "party"],
  },
  {
    id: "heart-winter-coat",
    titleKey: "heartWinterCoat",
    image: "/images/home/product-heart-coat.png",
    condition: "used",
    price: 180,
    priceType: "fixed",
    categoryId: "womens-fashion",
    rating: 5,
    publishedAt: "2026-04-20",
    sortScore: 92,
    searchTokens: ["coat", "winter", "hearts", "kids"],
  },
  {
    id: "pink-heart-coat",
    titleKey: "pinkHeartCoat",
    image: "/images/home/product-pink-coat.png",
    condition: "new",
    price: 210,
    priceType: "negotiable",
    categoryId: "dresses",
    rating: 5,
    publishedAt: "2026-04-18",
    sortScore: 90,
    searchTokens: ["pink", "coat", "dress", "kids"],
  },
  {
    id: "minimal-handbag",
    titleKey: "minimalHandbag",
    image: "/images/home/hero-handbag.png",
    condition: "used",
    price: 430,
    priceType: "fixed",
    categoryId: "accessories",
    rating: 4,
    publishedAt: "2026-04-12",
    sortScore: 86,
    searchTokens: ["bag", "handbag", "accessory", "pink"],
  },
  {
    id: "wide-leg-pants",
    titleKey: "wideLegPants",
    image: "/images/auth/login/pants-hanger.png",
    condition: "new",
    price: 165,
    priceType: "fixed",
    categoryId: "pants",
    rating: 3,
    publishedAt: "2026-04-08",
    sortScore: 82,
    searchTokens: ["pants", "wide", "casual"],
  },
  {
    id: "sport-sneakers",
    titleKey: "sportSneakers",
    image: "/images/home/hero-card.png",
    condition: "used",
    price: 145,
    priceType: "negotiable",
    categoryId: "sportswear",
    rating: 4,
    publishedAt: "2026-04-03",
    sortScore: 78,
    searchTokens: ["sneakers", "sport", "blue", "shoes"],
  },
  {
    id: "gold-statement-earrings",
    titleKey: "goldStatementEarrings",
    image: "/images/auth/login/sunglasses.png",
    condition: "used",
    price: 95,
    priceType: "fixed",
    categoryId: "accessories",
    rating: 5,
    publishedAt: "2026-03-29",
    sortScore: 74,
    searchTokens: ["gold", "earrings", "accessory"],
  },
  {
    id: "linen-day-dress",
    titleKey: "linenDayDress",
    image: "/images/home/product-pink-coat.png",
    condition: "new",
    price: 280,
    priceType: "negotiable",
    categoryId: "dresses",
    rating: 4,
    publishedAt: "2026-03-22",
    sortScore: 70,
    searchTokens: ["linen", "dress", "day", "womens"],
  },
];

function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase();
}

function isMatchingQuery(product: CatalogProduct, query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return true;

  const searchable = [
    product.title,
    product.description,
    product.categoryId,
    ...product.searchTokens,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  return searchable.includes(normalizedQuery);
}

function sortProducts(products: CatalogProduct[], sort?: string | number) {
  const sorted = [...products];

  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    case "price-asc":
      return sorted.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return sorted.sort((a, b) => b.price.amount - a.price.amount);
    case "top-rated":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted.sort((a, b) => b.sortScore - a.sortScore);
  }
}

export interface CatalogProductFilters {
  query?: string;
  categoryId?: string | null;
  condition?: CatalogCondition | "all";
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  priceType?: ProductPriceType | "all";
  sort?: string | number;
}

export function useProductCatalog() {
  const { t } = useI18n();

  const categories = computed<Category[]>(() =>
    catalogCategoryIds.map((id) => ({
      id,
      name: t(`catalog.categories.${id}`),
    })),
  );

  const products = computed<CatalogProduct[]>(() =>
    productFixtures.map((fixture) => {
      const title = t(`catalog.products.${fixture.titleKey}.title`);

      return {
        id: fixture.id,
        title,
        description: t(`catalog.products.${fixture.titleKey}.description`),
        price: {
          amount: fixture.price,
          currency: "SAR",
        },
        priceType: fixture.priceType,
        categoryId: fixture.categoryId,
        sellerId: "swapo-fixture",
        condition: fixture.condition,
        rating: fixture.rating,
        publishedAt: fixture.publishedAt,
        sortScore: fixture.sortScore,
        searchTokens: fixture.searchTokens,
        media: [
          {
            id: `${fixture.id}-cover`,
            type: "image",
            url: fixture.image,
            alt: title,
            isCover: true,
          },
        ],
      };
    }),
  );

  const conditionLabels = computed<Record<CatalogCondition, string>>(() => ({
    new: t("product.condition.new"),
    used: t("product.condition.used"),
  }));

  const listingLabel = computed(() => t("product.listingType.ad"));

  const sortOptions = computed<SortOption[]>(() => [
    { label: t("catalog.sort.recommended"), value: "recommended" },
    { label: t("catalog.sort.newest"), value: "newest" },
    { label: t("catalog.sort.priceAsc"), value: "price-asc" },
    { label: t("catalog.sort.priceDesc"), value: "price-desc" },
    { label: t("catalog.sort.topRated"), value: "top-rated" },
  ]);

  const filterSections = computed<FilterSection[]>(() => [
    {
      key: "condition",
      title: t("catalog.filters.condition"),
      type: "single",
      options: [
        { label: t("catalog.filters.all"), value: "all" },
        { label: t("product.condition.new"), value: "new" },
        { label: t("product.condition.used"), value: "used" },
      ],
    },
    {
      key: "price",
      title: t("catalog.filters.price"),
      type: "price",
      min: 1,
      max: 3000,
      step: 25,
    },
    {
      key: "rating",
      title: t("catalog.filters.rating"),
      type: "rating",
      options: [1, 2, 3, 4, 5].map((value) => ({
        label: String(value),
        value,
      })),
    },
    {
      key: "priceType",
      title: t("catalog.filters.tradeState"),
      type: "single",
      options: [
        { label: t("catalog.filters.all"), value: "all" },
        { label: t("catalog.filters.buyNow"), value: "fixed" },
        { label: t("catalog.filters.negotiate"), value: "negotiable" },
      ],
    },
  ]);

  function getCategory(categoryId?: string | null) {
    if (!categoryId) return undefined;
    return categories.value.find((category) => category.id === categoryId);
  }

  function filterProducts(
    sourceProducts: CatalogProduct[],
    filters: CatalogProductFilters = {},
  ) {
    const minPrice = Number.isFinite(filters.minPrice)
      ? filters.minPrice
      : undefined;
    const maxPrice = Number.isFinite(filters.maxPrice)
      ? filters.maxPrice
      : undefined;

    const filtered = sourceProducts.filter((product) => {
      if (filters.categoryId && product.categoryId !== filters.categoryId) {
        return false;
      }

      if (!isMatchingQuery(product, filters.query ?? "")) {
        return false;
      }

      if (
        filters.condition &&
        filters.condition !== "all" &&
        product.condition !== filters.condition
      ) {
        return false;
      }

      if (minPrice !== undefined && product.price.amount < minPrice) {
        return false;
      }

      if (maxPrice !== undefined && product.price.amount > maxPrice) {
        return false;
      }

      if (filters.rating && product.rating < filters.rating) {
        return false;
      }

      if (
        filters.priceType &&
        filters.priceType !== "all" &&
        product.priceType !== filters.priceType
      ) {
        return false;
      }

      return true;
    });

    return sortProducts(filtered, filters.sort);
  }

  return {
    categories,
    products,
    conditionLabels,
    listingLabel,
    sortOptions,
    filterSections,
    getCategory,
    filterProducts,
  };
}
