export type AddressType = 'delivery' | 'business'

export interface GeoLocation {
  lat: number
  lng: number
}

export interface Address {
  id: string
  type: AddressType
  city: string
  district?: string
  line1: string
  line2?: string
  location?: GeoLocation
  isDefault?: boolean
}
