import type { Address } from './address'
import type { RatingSummary } from './review'
import type { User } from './user'

export interface SellerProfile {
  id: string
  user: User
  storeName: string
  bio?: string
  businessAddress?: Address
  rating?: RatingSummary
}

export interface SellerMetrics {
  activeProducts: number
  completedOrders: number
  responseRate?: number
}
