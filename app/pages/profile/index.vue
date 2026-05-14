<script setup lang="ts">
definePageMeta({
  layout: "buyer",
  middleware: ["auth", "profile"],
});

function handleLogout() {
  const authStore = useAuthStore()
  const localePath = useLocalePath()
  authStore.logout()
  navigateTo(localePath("/auth/login"))
}
</script>

<template>
  <SharedProfileShell role="buyer" is-menu @logout="handleLogout" />
</template>
