<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader mode="public">
      <template #actions>
        <BaseButton
          variant="ghost"
          size="sm"
          :to="localePath('/auth/login')"
          class="text-green-normal! hover:bg-blue-dark-hover!"
        >
          {{ t('auth.login') }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :to="localePath('/auth/signup')"
          class="bg-green-normal! text-blue-normal! hover:bg-green-normal-hover!"
        >
          {{ t('auth.signup') }}
        </BaseButton>
      </template>
    </AppHeader>

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
