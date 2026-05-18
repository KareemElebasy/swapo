export type ApiProductCondition = 'new' | 'used'
export type ApiProductAdType = 'direct' | 'negotiation'
export type ApiProductAvailability = 'available' | 'sold'
export type ApiWeightType = 'gm' | 'kg'

export interface ApiProductSellerData {
  id: number
  full_name: string
  store_name: string
  image: string
}

export interface ApiProductListItem {
  id: number
  product_name: string
  cover: string
  status: ApiProductCondition
  status_trans: string
  ad_type: ApiProductAdType
  ad_type_trans: string
  price: number
  availability_status: ApiProductAvailability
  availability_status_trans: string
  weight: number
  weight_type: ApiWeightType
  weight_type_trans: string
  quantity: number
  is_favorite: boolean
  in_cart: boolean
  is_negotiating: boolean
  is_pinned: boolean
  is_mine: boolean
  seller_data: ApiProductSellerData
}

export interface ApiProductListResponse {
  data: ApiProductListItem[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  min_price: number
  max_price: number
}

export interface ApiProductMedia {
  id: number
  media_type: string
  url: string
}

export interface ApiProductDetailSellerData extends ApiProductSellerData {
  average_rate: number
  is_verified: boolean
  address_data: {
    location: string
    city_data: { id: number; name: string }
    district_data: { id: number; name: string }
  }
}

export interface ApiReview {
  id: number
  user: {
    id: number
    full_name: string
    image: string | null
  }
  rate: number
  comment: string
  created_at: string
}

export interface ApiProductDetail {
  id: number
  product_name: string
  product_desc: string
  weight: number
  weight_type: ApiWeightType
  weight_type_trans: string
  status: ApiProductCondition
  status_trans: string
  ad_type: ApiProductAdType
  ad_type_trans: string
  availability_status: ApiProductAvailability
  availability_status_trans: string
  quantity: number
  reserved_quantity: number
  views: number
  price: number
  cover: string
  shipping_setting: 'buyer' | 'seller' | 'both'
  is_favorite: boolean
  in_cart: boolean
  is_reported: boolean
  is_negotiating: boolean
  is_pinned: boolean
  is_mine: boolean
  has_faq: boolean
  media: ApiProductMedia[]
  category_data: { id: number; title: string; image: string }
  subcategory_data: { id: number; title: string }
  seller_data: ApiProductDetailSellerData
  promotion_data: { type: string; status: string } | null
  similar_products: ApiProductListItem[]
  average_rate: number
  latest_reviews: ApiReview[]
}

export interface ProductFilters {
  type?: 'new' | 'used' | 'suggested' | 'boosted_products'
  ad_type?: 'direct' | 'negotiation'
  price_from?: number
  price_to?: number
  category_id?: number
  sort?: 'recent' | 'highest_price' | 'lowest_price' | 'highest_rate' | 'lowest_rate' | 'most_ordered'
  rate?: number
  page?: number
}
