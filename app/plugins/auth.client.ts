import { fetchProfile } from '~/services/auth.service'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const tokenCookie = useCookie<string | null>('swapo_token')

  if (!tokenCookie.value) return

  authStore.setToken(tokenCookie.value)

  try {
    const res = await fetchProfile()
    authStore.setUser(res.data)
  } catch {
    authStore.logout()
    tokenCookie.value = null
  }
})
