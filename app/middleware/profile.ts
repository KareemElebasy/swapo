export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (authStore.user?.is_seller) {
    return navigateTo('/seller/profile', { replace: true })
  }
})
