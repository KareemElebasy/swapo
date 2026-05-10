import type { Money } from './money'
import type { UserRole } from './user'

export type NegotiationStatus = 'pending' | 'active' | 'agreed' | 'ended'

export interface Offer {
  id: string
  amount: Money
  createdBy: UserRole
  createdAt: string
}

export interface Negotiation {
  id: string
  productId: string
  buyerId: string
  sellerId: string
  status: NegotiationStatus
  offers: Offer[]
}
