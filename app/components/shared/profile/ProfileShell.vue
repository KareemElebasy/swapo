<script setup lang="ts">
type ProfileRole = 'buyer' | 'seller'

interface Props {
  role: ProfileRole
  title?: string
  /** Mobile: show the sidebar/menu instead of content slot */
  isMenu?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isMenu: false,
})

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const menuRoot = computed(() =>
  props.role === 'seller' ? '/seller/profile' : '/profile',
)

const pageTitle = computed(() => props.title ?? t('profile.page.title'))
</script>

<template>
  <div class="mx-auto w-full max-w-280 px-4 py-6 md:py-8">
    <h1 class="text-end text-2xl font-bold leading-normal text-black-normal">
      {{ pageTitle }}
    </h1>

    <div class="mt-7 flex flex-col gap-6 md:flex-row md:items-start">
      <!-- Sidebar: always on desktop, only on menu pages on mobile -->
      <aside
        :class="[
          'shrink-0',
          isMenu ? 'block' : 'hidden md:block',
        ]"
      >
        <SharedProfileSidebar :role="role" @logout="emit('logout')" />
      </aside>

      <!-- Content: hidden on mobile menu pages, always on desktop -->
      <main
        :class="[
          'min-w-0 flex-1',
          isMenu ? 'hidden md:block' : 'block',
        ]"
      >
        <!-- Mobile back button (shown on sub-pages only) -->
        <div class="mb-4 flex items-center gap-2 md:hidden">
          <NuxtLink
            :to="localePath(menuRoot)"
            class="inline-flex items-center gap-1.5 text-sm text-grey-dark-hover hover:text-black-normal"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              class="ltr:rotate-180"
            >
              <path
                d="M11 5 7 9l4 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('profile.backToMenu') }}
          </NuxtLink>
        </div>

        <slot />
      </main>
    </div>
  </div>
</template>
