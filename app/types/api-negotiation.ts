export type NegotiationStatus = 'open' | 'agreed' | 'finished' | 'cancelled' | 'pending' | 'negotiating'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

export interface ApiNegotiationParty {
  id: number
  store_name: string | null
  full_name: string
  first_name: string
  last_name: string
  image: string
  is_blocked: boolean
}

export interface ApiNegotiationMessage {
  type: 'message' | 'offer'
  id: number
  negotiation_id: number
  sender: ApiNegotiationParty
  room: string
  created_at: number // Unix timestamp
  // text message fields
  content?: string
  // offer fields
  price?: number
  status?: OfferStatus
  status_trans?: string
  expires_at?: string | null
}

export interface ApiNegotiationDetailProduct {
  id: number
  product_name: string
  cover: string
  shipping_setting: string
  shipping_setting_trans: string
  price: number
}

export interface ApiNegotiationDetail {
  id: number
  order_data: unknown | null
  status: NegotiationStatus
  status_trans: string
  quantity: number
  product_data: ApiNegotiationDetailProduct
  buyer_data: ApiNegotiationParty
  seller_data: ApiNegotiationParty
  accepted_offer: ApiNegotiationMessage | null
  messages: ApiNegotiationMessage[]
  expires_at?: string | null
}

// List item shape (from GET negotiation endpoint)
export interface ApiNegotiationListItem {
  id: number
  status: NegotiationStatus
  status_trans: string
  proposed_price?: number
  product_data: { id: number; product_name: string; cover: string; price: number }
  buyer_data: ApiNegotiationParty
  seller_data: ApiNegotiationParty
  created_at: number
  expires_at: string | null
  latest_offer: ApiNegotiationMessage | null
}
