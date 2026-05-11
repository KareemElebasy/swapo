<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <div class="mx-auto grid w-full max-w-[1312px] items-center justify-center gap-8 lg:grid-cols-[minmax(0,603px)_minmax(360px,601px)] lg:justify-between lg:gap-[72px] xl:gap-[108px]">
    <AuthOtpForm />
    <AuthLoginHero class="hidden lg:block" />
  </div>
</template>
