import type { Address } from './address'
import type { Money } from './money'
import type { Product } from './product'
import type { AppStatus } from './status'

export interface OrderItem {
  id: string
  product: Product
  quantity: number
  unitPrice: Money
}

export interface Order {
  id: string
  buyerId: string
  sellerId: string
  items: OrderItem[]
  status: AppStatus
  total: Money
  shippingAddress?: Address
  createdAt: string
}
