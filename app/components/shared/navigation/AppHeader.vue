<script setup lang="ts">
type HeaderMode = 'public' | 'buyer' | 'seller'

interface Props {
  mode?: HeaderMode
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'public',
})

const { t } = useI18n()
const localePath = useLocalePath()

const searchQuery = ref('')
const mobileMenuOpen = ref(false)

const showSearch = computed(() => props.mode !== 'seller')
</script>

<template>
  <header class="sticky top-0 z-50 bg-blue-normal">
    <div class="container-app flex items-center h-16 gap-3">
      <!-- Logo -->
      <NuxtLink
        :to="localePath('/')"
        class="shrink-0 text-green-normal font-bold text-xl tracking-tight"
      >
        Swapo
      </NuxtLink>

      <!-- Search bar — visible on sm+ for public and buyer modes -->
      <div v-if="showSearch" class="hidden sm:flex flex-1 max-w-md">
        <BaseSearchBar
          v-model="searchQuery"
          :placeholder="t('common.search')"
          class="w-full"
        />
      </div>

      <div class="flex-1" />

      <!-- End actions: language toggle + role-specific slot -->
      <div class="flex items-center gap-1 shrink-0">
        <LanguageToggle variant="compact" :inverted="true" />
        <slot name="actions" />
      </div>

      <!-- Mobile hamburger -->
      <button
        class="sm:hidden inline-flex items-center justify-center size-10 rounded-sm text-green-normal hover:bg-blue-dark-hover transition-colors"
        type="button"
        :aria-label="mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
        :aria-expanded="mobileMenuOpen"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            v-if="!mobileMenuOpen"
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <path
            v-else
            d="M5 5l10 10M15 5L5 15"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile search — shows below main row for public and buyer modes -->
    <div v-if="showSearch" class="sm:hidden container-app pb-3">
      <BaseSearchBar
        v-model="searchQuery"
        :placeholder="t('common.search')"
      />
    </div>

    <!-- Mobile actions panel -->
    <div
      v-if="mobileMenuOpen"
      class="sm:hidden bg-blue-dark border-t border-blue-dark-hover"
    >
      <div class="container-app py-3 flex flex-col gap-1">
        <slot name="mobile-menu" />
      </div>
    </div>
  </header>
</template>
