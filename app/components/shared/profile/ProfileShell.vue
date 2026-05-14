<script setup lang="ts">
type ProfileRole = 'buyer' | 'seller'

interface Props {
  role: ProfileRole
  title?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()

const pageTitle = computed(() => props.title ?? t('profile.page.title'))
</script>

<template>
  <div class="mx-auto w-full max-w-[1120px] px-4 py-6 md:py-8">
    <h1 class="text-end text-2xl font-bold leading-normal text-black-normal">
      {{ pageTitle }}
    </h1>

    <div class="mt-7 flex flex-col gap-6 md:flex-row">
      <aside class="hidden shrink-0 md:block">
        <SharedProfileSidebar :role="role" @logout="emit('logout')" />
      </aside>

      <main class="min-w-0 flex-1">
        <slot />

        <div class="mt-6 md:hidden">
          <SharedProfileSidebar :role="role" @logout="emit('logout')" />
        </div>
      </main>
    </div>
  </div>
</template>
