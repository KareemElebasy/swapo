<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'seller'],
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

useHead({ title: t('profile.settingsPage.metaTitle') })

const notificationsEnabled = ref(true)
const orderUpdatesEnabled = ref(true)

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}
</script>

<template>
  <SharedProfileShell role="seller" @logout="handleLogout">
    <section class="rounded-sm border border-blue-light bg-white p-6">
      <h2 class="mb-6 text-xl font-bold text-black-normal">
        {{ t('profile.settingsPage.title') }}
      </h2>

      <div class="divide-y divide-blue-light">
        <div class="flex items-center justify-between gap-4 py-4">
          <SharedI18nLanguageToggle />
          <div class="text-end">
            <p class="text-sm font-semibold text-black-normal">
              {{ t('profile.settingsPage.language.title') }}
            </p>
            <p class="mt-1 text-xs text-grey-dark-hover">
              {{ t('profile.settingsPage.language.description') }}
            </p>
          </div>
        </div>

        <label class="flex cursor-pointer items-center justify-between gap-4 py-4">
          <input
            v-model="notificationsEnabled"
            type="checkbox"
            class="size-5 rounded-xs accent-brand-cyan"
          />
          <div class="text-end">
            <p class="text-sm font-semibold text-black-normal">
              {{ t('profile.settingsPage.notifications.title') }}
            </p>
            <p class="mt-1 text-xs text-grey-dark-hover">
              {{ t('profile.settingsPage.notifications.description') }}
            </p>
          </div>
        </label>

        <label class="flex cursor-pointer items-center justify-between gap-4 py-4">
          <input
            v-model="orderUpdatesEnabled"
            type="checkbox"
            class="size-5 rounded-xs accent-brand-cyan"
          />
          <div class="text-end">
            <p class="text-sm font-semibold text-black-normal">
              {{ t('profile.settingsPage.orderUpdates.title') }}
            </p>
            <p class="mt-1 text-xs text-grey-dark-hover">
              {{ t('profile.settingsPage.orderUpdates.description') }}
            </p>
          </div>
        </label>
      </div>
    </section>
  </SharedProfileShell>
</template>
