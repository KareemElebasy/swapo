<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <div class="ms-auto me-auto grid w-full max-w-[1312px] items-center justify-center gap-8 lg:grid-cols-[minmax(0,603px)_minmax(0,601px)] lg:justify-between lg:gap-[108px]">
    <AuthSignupForm />
    <AuthLoginHero class="hidden lg:block" />
  </div>
</template>
