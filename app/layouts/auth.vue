<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-grey-normal">
    <!-- Minimal branded header -->
    <header class="flex items-center justify-center py-8">
      <NuxtLink
        :to="localePath('/')"
        class="text-blue-normal font-bold text-2xl tracking-tight"
      >
        Swapo
      </NuxtLink>
    </header>

    <main class="flex-1 flex items-center justify-center px-4 pb-16">
      <slot />
    </main>

    <footer class="py-6 flex justify-center">
      <LanguageToggle variant="pill" />
    </footer>
  </div>
</template>
