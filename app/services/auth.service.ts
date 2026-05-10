import type { RegisterPayload, VerifyPayload, CompleteDataPayload, VerifyResponse, AuthResponse } from '~/types/auth'
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
  apiFetch<AuthResponse>('auth/complete-data', {
    method: 'POST',
    body: payload,
    // registration_token بيتبعت كـ Bearer header وكـ field في الـ body
    registrationToken: payload.registration_token,
  })

export const logoutUser = () =>
  apiFetch<{ message: string }>('auth/logout', {
    method: 'POST',
    body: { device_type: 'web', device_token: 'web' },
  })
