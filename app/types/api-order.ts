export type ApiOrderStatus =
  | 'pending_approval'
  | 'pending_payment'
  | 'pending_shipment'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export interface ApiOrderProduct {
  cover: string
  product_name: string
}

export interface ApiOrderListItem {
  id: number
  code: string
  created_at: number
  total_price: number
  total_quantity: number
  status: ApiOrderStatus
  status_trans: string
  products_data: ApiOrderProduct[]
}

export interface ApiOrderItemDetail {
  id: number
  quantity: number
  price: number
  product_name: string
  cover: string
  weight: number
  weight_type: string
  weight_type_trans: string
  status: string
  status_trans: string
  item_status: string
  item_status_trans: string
}

export interface ApiOrderDetail {
  id: number
  code: string
  total_price: number
  status: ApiOrderStatus
  status_trans: string
  notes: string | null
  created_at: number
  shipping_label_url: string | null
  address_data: {
    full_name?: string
    line1?: string
    city?: string
    district?: string
    phone?: string
    details?: string
  } | null
  buyer_data: {
    id: number
    full_name: string
    phone: string
  }
  items_data: ApiOrderItemDetail[]
  brief_data: {
    total_product_count: number
    shipping_price: number
    seller_shipping_price: number
    commission: number
    net_price: number
  }
}

export interface ApiOrdersResponse {
  data: ApiOrderListItem[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
  links: {
    next: string | null
    prev: string | null
  }
  status: string
  message: string
}
