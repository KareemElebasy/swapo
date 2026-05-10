import type { Money } from './money'
import type { AppStatus } from './status'

export type ProductMediaType = 'image' | 'video'
export type ProductPriceType = 'fixed' | 'negotiable'

export interface ProductMedia {
  id: string
  type: ProductMediaType
  url: string
  alt?: string
  isCover?: boolean
}

export interface Category {
  id: string
  name: string
  parentId?: string
}

export interface Product {
  id: string
  title: string
  description?: string
  price: Money
  priceType: ProductPriceType
  categoryId: string
  sellerId: string
  media: ProductMedia[]
  status?: AppStatus
}
