import type { Cart, CartItem } from '~/types/cart'
import type { Money } from '~/types/money'
import type { CatalogProduct, CatalogSeller } from './useProductCatalog'

interface DemoCartLine {
  productId: string
  quantity: number
}

export interface DemoCartItem extends CartItem {
  product: CatalogProduct
  seller: CatalogSeller
}

export interface DemoCartSellerGroup {
  seller: CatalogSeller
  items: DemoCartItem[]
  itemCount: number
  subtotal: Money
}

const demoServiceFeeAmount = 2

const demoCartFixture: DemoCartLine[] = [
  { productId: 'blue-denim-jacket', quantity: 1 },
  { productId: 'wide-leg-pants', quantity: 2 },
  { productId: 'red-flame-heels', quantity: 1 },
]

function createMoney(amount: number): Money {
  return {
    amount,
    currency: 'SAR',
  }
}

function getCartItemId(productId: string) {
  return `demo-cart-${productId}`
}

export function useDemoCart() {
  const { getProduct, getSeller } = useProductCatalog()

  // Demo-only state until the authenticated cart persistence contract lands.
  const lines = useState<DemoCartLine[]>('demo-cart-lines', () => [
    ...demoCartFixture,
  ])
  const loading = useState<boolean>('demo-cart-loading', () => true)

  const items = computed<DemoCartItem[]>(() =>
    lines.value
      .map((line) => {
        const product = getProduct(line.productId)
        const seller = getSeller(product?.sellerId)

        if (!product || !seller || line.quantity < 1) return undefined

        return {
          id: getCartItemId(product.id),
          product,
          seller,
          quantity: line.quantity,
        }
      })
      .filter((item): item is DemoCartItem => Boolean(item)),
  )

  const itemCount = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  )

  const subtotal = computed(() =>
    createMoney(
      items.value.reduce(
        (total, item) => total + item.product.price.amount * item.quantity,
        0,
      ),
    ),
  )

  const sellerCount = computed(
    () => new Set(items.value.map((item) => item.seller.id)).size,
  )

  const serviceFee = computed(() =>
    sellerCount.value > 0
      ? createMoney(demoServiceFeeAmount * sellerCount.value)
      : createMoney(0),
  )

  const total = computed(() =>
    createMoney(subtotal.value.amount + serviceFee.value.amount),
  )

  const cart = computed<Cart>(() => ({
    items: items.value,
    subtotal: subtotal.value,
    total: total.value,
  }))

  const sellerGroups = computed<DemoCartSellerGroup[]>(() => {
    const groups = new Map<string, DemoCartSellerGroup>()

    items.value.forEach((item) => {
      const current = groups.get(item.seller.id)
      const nextSubtotal =
        (current?.subtotal.amount ?? 0) +
        item.product.price.amount * item.quantity

      if (current) {
        current.items.push(item)
        current.itemCount += item.quantity
        current.subtotal = createMoney(nextSubtotal)
        return
      }

      groups.set(item.seller.id, {
        seller: item.seller,
        items: [item],
        itemCount: item.quantity,
        subtotal: createMoney(nextSubtotal),
      })
    })

    return Array.from(groups.values())
  })

  function setLoaded() {
    loading.value = false
  }

  function updateQuantity(itemId: string, quantity: number) {
    const line = lines.value.find(
      (entry) => getCartItemId(entry.productId) === itemId,
    )
    if (!line) return

    const nextQuantity = Math.max(1, Math.floor(quantity))
    line.quantity = nextQuantity
  }

  function removeItem(itemId: string) {
    lines.value = lines.value.filter(
      (entry) => getCartItemId(entry.productId) !== itemId,
    )
  }

  return {
    cart,
    items,
    itemCount,
    loading,
    sellerGroups,
    serviceFee,
    serviceFeePerSeller: createMoney(demoServiceFeeAmount),
    subtotal,
    total,
    setLoaded,
    updateQuantity,
    removeItem,
  }
}
