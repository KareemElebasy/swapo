<script setup lang="ts">
definePageMeta({
  layout: "buyer",
  middleware: ["auth", "profile"],
});

const localePath = useLocalePath()

function handleLogout() {
  const authStore = useAuthStore()
  authStore.logout()
  navigateTo(localePath("/auth/login"))
}

onMounted(() => {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    navigateTo(localePath('/profile/account'), { replace: true })
  }
})
</script>

<template>
  <SharedProfileShell role="buyer" is-menu @logout="handleLogout" />
</template>
