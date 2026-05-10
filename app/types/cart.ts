import type { Money } from './money'
import type { Product } from './product'

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: Money
  total: Money
}
