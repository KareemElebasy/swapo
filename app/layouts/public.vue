<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <SharedNavigationAppHeader mode="public">
      <template #actions>
        <BaseButton
          variant="ghost"
          size="sm"
          :to="localePath('/auth/login')"
          class="border border-blue-light-active text-blue-normal! hover:bg-blue-light!"
        >
          {{ t("auth.login") }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :to="localePath('/auth/signup')"
          class="hidden bg-blue-normal! text-grey-light! hover:bg-blue-normal-hover! sm:inline-flex"
        >
          {{ t("auth.signup") }}
        </BaseButton>
      </template>
    </SharedNavigationAppHeader>

    <main class="flex-1">
      <slot />
    </main>

    <SharedNavigationAppFooter />
  </div>
</template>
