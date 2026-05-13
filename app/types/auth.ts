export interface RegisterPayload {
  phone_code: string   // '966' بدون +
  phone: string
  locale: string
}

export interface VerifyPayload {
  phone_code: string
  phone: string
  otp: string
  device_token: string
  device_type: 'ios' | 'android' | 'web'
}

export interface CompleteDataPayload {
  phone_code: string
  phone: string
  first_name: string
  last_name: string
  email: string
  gender: 'male' | 'female'
  birth_date: string           // 'YYYY-MM-DD'
  device_token: string
  device_type: 'ios' | 'android' | 'web'
  registration_token: string
}

export interface VerifyResponse {
  data: {
    id: number
    is_complete_data: boolean
    is_seller: boolean
    token: string
  }
}

export interface CompleteDataResponse {
  data: {
    is_complete_data: boolean
    is_seller: boolean
    token: string
  }
}

export interface SellerRegistrationPayload {
  store_name?: string
  national_id?: string
  bank_name: string
  iban: string
  lat: number
  lng: number
  street_name: string
  location?: string
  address_type?: string
  city_id: number
  district_id?: number
  details?: string
}

export interface SellerRegistrationResponse {
  data: {
    token: string
    is_complete_data: boolean
    is_seller: boolean
  }
}
