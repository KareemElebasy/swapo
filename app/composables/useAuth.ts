import type { CompleteDataPayload, SellerRegistrationPayload } from '~/types/auth'
import type { ApiError } from '~/types/api'
import {
  registerPhone,
  verifyOtp,
  resendCode,
  completeData,
  sellerRegistration,
  logoutUser,
  fetchProfile,
} from '~/services/auth.service'

export function useAuth() {
  const authStore = useAuthStore()
  const { locale } = useI18n()
  const router = useRouter()

  const loading     = ref(false)
  const fieldErrors = ref<Record<string, string[]>>({})

  // useCookie so values survive page refresh mid-flow (no dots in names — some parsers treat them as domain separators)
  const pendingPhone      = useCookie<string>('swapo_auth_phone',  { default: () => '', maxAge: 3600 })
  const registrationToken = useCookie<string>('swapo_auth_token',  { default: () => '', maxAge: 3600, sameSite: 'strict' })
  const tokenCookie       = useCookie<string | null>('swapo_token', { maxAge: 30 * 24 * 3600, sameSite: 'strict' })

  function clearErrors() { fieldErrors.value = {} }

  function handleError(err: unknown) {
    const apiErr = err as ApiError
    if (apiErr?.errors)       fieldErrors.value = apiErr.errors
    else if (apiErr?.message) fieldErrors.value = { general: [apiErr.message] }
    else                      fieldErrors.value = { general: ['حدث خطأ، حاول مجدداً'] }
  }

  function setPermanentToken(token: string) {
    authStore.setToken(token)
    tokenCookie.value = token
  }

  async function loadProfile() {
    try {
      const res = await fetchProfile()
      authStore.setUser(res.data)
    } catch {
      // non-fatal — token is still valid
    }
  }

  // ─── register ───────────────────────────────────────────────────────────────
  async function register(phone: string) {
    loading.value = true
    clearErrors()
    try {
      await registerPhone({ phone_code: '966', phone, locale: locale.value })
      pendingPhone.value = phone
      await router.push('/auth/verify')
    }
    catch (err) { handleError(err) }
    finally { loading.value = false }
  }

  // ─── verify OTP ─────────────────────────────────────────────────────────────
  async function verify(otp: string) {
    loading.value = true
    clearErrors()
    try {
      const res = await verifyOtp({
        phone_code:   '966',
        phone:        pendingPhone.value ?? '',
        otp,
        device_type:  'web',
        device_token: 'web',
      })

      if (!res.data.is_complete_data) {
        // User needs to complete profile — keep token in state only (not cookie)
        registrationToken.value = res.data.token
        await router.push('/auth/signup')
      } else if (!res.data.is_seller) {
        // Profile complete but not seller — store as permanent token then show lock page
        setPermanentToken(res.data.token)
        await loadProfile()
        registrationToken.value = ''
        pendingPhone.value = ''
        await router.push('/auth/lock')
      } else {
        // Fully registered — go home
        setPermanentToken(res.data.token)
        await loadProfile()
        registrationToken.value = ''
        pendingPhone.value = ''
        await router.push('/')
      }
    }
    catch (err) { handleError(err) }
    finally { loading.value = false }
  }

  // ─── resend OTP ─────────────────────────────────────────────────────────────
  async function resend() {
    try {
      await resendCode({ phone_code: '966', phone: pendingPhone.value ?? '' })
    }
    catch (err) { handleError(err) }
  }

  // ─── complete data ───────────────────────────────────────────────────────────
  async function complete(
    data: Omit<CompleteDataPayload, 'registration_token' | 'device_token' | 'device_type' | 'phone_code' | 'phone'>,
  ) {
    loading.value = true
    clearErrors()
    try {
      const result = await completeData({
        ...data,
        phone_code:         '966',
        phone:              pendingPhone.value ?? '',
        registration_token: registrationToken.value ?? '',
        device_type:        'web',
        device_token:       'web',
      })
      // Permanent token received — store it, clear temp state
      setPermanentToken(result.data.token)
      await loadProfile()
      pendingPhone.value = ''
      registrationToken.value = ''

      if (!result.data.is_seller) {
        await router.push('/auth/lock')
      } else {
        await router.push('/')
      }
    }
    catch (err) { handleError(err) }
    finally { loading.value = false }
  }

  // ─── seller registration ─────────────────────────────────────────────────────
  async function registerAsSeller(payload: SellerRegistrationPayload) {
    loading.value = true
    clearErrors()
    try {
      await sellerRegistration(payload)
      await loadProfile()
      await router.push('/')
    }
    catch (err) { handleError(err) }
    finally { loading.value = false }
  }

  // ─── logout ─────────────────────────────────────────────────────────────────
  async function logout() {
    try { await logoutUser() }
    catch { /* continue logout even if API fails */ }
    finally {
      authStore.logout()
      tokenCookie.value = null
      await router.push('/auth/login')
    }
  }

  return {
    loading,
    fieldErrors,
    pendingPhone,
    registrationToken,
    register,
    verify,
    resend,
    complete,
    registerAsSeller,
    logout,
  }
}
