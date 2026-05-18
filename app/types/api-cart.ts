import type { ApiProductListItem } from './api-product'

export interface ApiCartItem {
  cart_item_id: number
  quantity: number
  unit_price: number
  total_price: number
  is_available: boolean
  product_data: ApiProductListItem
}

export interface ApiCartSeller {
  seller_id: number
  store_name: string
  store_image: string
  total_quantity: number
  subtotal: number
  service_fee: number
  total_price: number
  items: ApiCartItem[]
}

export interface ApiCart {
  cart_id: number
  cart_total: number
  service_fee: number
  total_quantity: number
  sellers: ApiCartSeller[]
}
