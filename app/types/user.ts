import type { Address } from './address'

export type UserRole = 'buyer' | 'seller'

export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  avatarUrl?: string
}

export interface UserProfile extends User {
  email?: string
  addresses?: Address[]
}
