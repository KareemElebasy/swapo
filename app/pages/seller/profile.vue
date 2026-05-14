<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'seller'],
})

function handleLogout() {
  const authStore = useAuthStore()
  const localePath = useLocalePath()
  authStore.logout()
  navigateTo(localePath('/auth/login'))
}
</script>

<template>
  <SharedProfileShell role="seller" is-menu @logout="handleLogout" />
</template>
