import type { CompleteDataPayload } from '~/types/auth'
import type { ApiError } from '~/types/api'
import { registerPhone, verifyOtp, resendCode, completeData, logoutUser } from '~/services/auth.service'

export function useAuth() {
  const authStore = useAuthStore()
  const { locale } = useI18n()
  const router = useRouter()

  const loading     = ref(false)
  const fieldErrors = ref<Record<string, string[]>>({})

  // يتنقل بين صفحات الـ auth
  const pendingPhone       = useState<string>('auth.phone',     () => '')
  const registrationToken  = useState<string>('auth.reg_token', () => '')

  function clearErrors() { fieldErrors.value = {} }

  function handleError(err: unknown) {
    const apiErr = err as ApiError
    if (apiErr?.errors)  { fieldErrors.value = apiErr.errors }
    else if (apiErr?.message) { fieldErrors.value = { general: [apiErr.message] } }
    else { fieldErrors.value = { general: ['حدث خطأ، حاول مجدداً'] } }
  }

  // ─── register ───────────────────────────────────────────────────────────────
  async function register(phone: string) {
    loading.value = true
    clearErrors()
    try {
      await registerPhone({
        phone_code: '966',   // بدون + — الـ API بيتوقع رقم بس
        phone,
        locale: locale.value,
      })
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
      const data = await verifyOtp({
        phone_code:   '966',
        phone:        pendingPhone.value,
        otp,
        device_type:  'web',
        device_token: 'web',
      })
      registrationToken.value = data.data.registration_token
      await router.push('/auth/signup')
    }
    catch (err) { handleError(err) }
    finally { loading.value = false }
  }

  // ─── resend OTP ─────────────────────────────────────────────────────────────
  async function resend() {
    try {
      await resendCode({ phone_code: '966', phone: pendingPhone.value })
    }
    catch (err) { handleError(err) }
  }

  // ─── complete data ───────────────────────────────────────────────────────────
  async function complete(
    data: Omit<CompleteDataPayload, 'registration_token' | 'device_token' | 'device_type' | 'phone_code'>,
  ) {
    loading.value = true
    clearErrors()
    try {
      const result = await completeData({
        ...data,
        phone_code:        '966',
        registration_token: registrationToken.value,
        device_type:       'web',
        device_token:      'web',
      })
      authStore.setToken(result.data.access_token)
      authStore.setUser(result.data.user)
      // نظّف الـ state المؤقت
      pendingPhone.value      = ''
      registrationToken.value = ''
      await router.push('/')
    }
    catch (err) { handleError(err) }
    finally { loading.value = false }
  }

  // ─── logout ─────────────────────────────────────────────────────────────────
  async function logout() {
    try { await logoutUser() }
    catch { /* نكمل logout حتى لو الـ API فشل */ }
    finally {
      authStore.logout()
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
    logout,
  }
}
