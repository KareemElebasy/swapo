export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (!authStore.token) {
    return navigateTo('/auth/login')
  }
  if (!authStore.user?.is_seller) {
    return navigateTo('/')
  }
})
