<script setup lang="ts">
definePageMeta({
  layout: 'buyer',
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

useHead({ title: t('profile.phonePage.metaTitle') })

const user = computed(() => authStore.user)

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6">
    <div class="flex gap-6">
      <aside class="hidden shrink-0 md:block">
        <SharedProfileSidebar role="buyer" @logout="handleLogout" />
      </aside>

      <main class="min-w-0 flex-1">
        <!-- Back link (mobile) -->
        <NuxtLink
          :to="localePath('/profile')"
          class="mb-4 inline-flex items-center gap-1 text-sm text-grey-dark-hover md:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="rtl:rotate-180">
            <path d="M10 4 6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ t('profile.nav.profile') }}
        </NuxtLink>

        <div class="rounded-xl border border-border bg-white p-6">
          <h1 class="mb-6 text-xl font-bold text-navy">{{ t('profile.phonePage.title') }}</h1>

          <!-- Current phone display -->
          <div class="mb-6 rounded-lg bg-surface p-4">
            <p class="mb-1 text-xs font-medium text-grey-dark-hover">{{ t('profile.phonePage.currentLabel') }}</p>
            <p class="text-base font-semibold text-navy" dir="ltr">
              {{ user?.phone_code }}{{ user?.phone }}
            </p>
          </div>

          <!-- Info notice -->
          <div class="flex gap-3 rounded-lg border border-blue-light bg-blue-light/40 p-4">
            <svg class="mt-0.5 size-5 shrink-0 text-blue-normal" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-black-normal">{{ t('profile.phonePage.info') }}</p>
          </div>

          <div class="mt-6">
            <BaseButton
              variant="secondary"
              :to="localePath('/profile/support')"
            >
              {{ t('profile.nav.support') }}
            </BaseButton>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
