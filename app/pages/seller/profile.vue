<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'seller'],
})

const localePath = useLocalePath()

function handleLogout() {
  const authStore = useAuthStore()
  authStore.logout()
  navigateTo(localePath('/auth/login'))
}

onMounted(() => {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    navigateTo(localePath('/seller/account'), { replace: true })
  }
})
</script>

<template>
  <SharedProfileShell role="seller" is-menu @logout="handleLogout" />
</template>
