import type {
  RegisterPayload,
  VerifyPayload,
  CompleteDataPayload,
  VerifyResponse,
  CompleteDataResponse,
  SellerRegistrationPayload,
  SellerRegistrationResponse,
} from '~/types/auth'
import type { User } from '~/types/user'
import { apiFetch } from '~/composables/useApi'

export const registerPhone = (payload: RegisterPayload) =>
  apiFetch<{ message: string }>('auth/register', {
    method: 'POST',
    body: payload,
  })

export const verifyOtp = (payload: VerifyPayload) =>
  apiFetch<VerifyResponse>('auth/verify', {
    method: 'POST',
    body: payload,
  })

export const resendCode = (payload: { phone_code: string; phone: string }) =>
  apiFetch<{ message: string }>('auth/resend-code', {
    method: 'POST',
    body: payload,
  })

export const completeData = (payload: CompleteDataPayload) =>
  apiFetch<CompleteDataResponse>('auth/complete-data', {
    method: 'POST',
    body: payload,
    registrationToken: payload.registration_token,
  })

export const sellerRegistration = (payload: SellerRegistrationPayload) =>
  apiFetch<SellerRegistrationResponse>('auth/seller-registration', {
    method: 'POST',
    body: payload,
    // Authorization header comes from authStore.token automatically via apiFetch
  })

export const logoutUser = () =>
  apiFetch<{ message: string }>('auth/logout', {
    method: 'POST',
    body: { device_type: 'web', device_token: 'web' },
  })

export const fetchProfile = () =>
  apiFetch<{ data: User }>('profile')
