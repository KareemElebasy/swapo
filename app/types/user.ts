export interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  store_name: string | null
  email: string
  phone: string
  phone_code: string
  gender: 'male' | 'female'
  birth_date: string
  national_id: string | null
  verified_national_id: boolean
  image: string
  is_seller: boolean
  avg_rate: number
  reviews_count: number
  is_complete_data: boolean
}

export interface ProfileUpdatePayload {
  first_name?: string
  last_name?: string
  email?: string
  gender?: 'male' | 'female'
  birth_date?: string
  image?: File
}
