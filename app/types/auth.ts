import type { User } from './user'

export interface LoginCredentials {
  phone: string
  password?: string
}

export interface SignupPayload {
  name: string
  phone: string
  password?: string
}

export interface OtpPayload {
  phone: string
  code: string
}

export interface AuthSession {
  user: User
  accessToken: string
}
