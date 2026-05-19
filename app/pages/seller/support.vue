<script setup lang="ts">
definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'seller'],
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

useHead({ title: t('profile.supportPage.metaTitle') })

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}
</script>

<template>
  <SharedProfileShell role="seller" @logout="handleLogout">
    <section class="rounded-sm border border-blue-light bg-white p-6">
      <h2 class="mb-2 text-xl font-bold text-black-normal">
        {{ t('profile.supportPage.title') }}
      </h2>
      <p class="mb-6 text-sm text-grey-dark-hover">
        {{ t('profile.supportPage.description') }}
      </p>

      <h3 class="mb-4 text-base font-semibold text-black-normal">
        {{ t('profile.supportPage.contactTitle') }}
      </h3>

      <ul class="space-y-4">
        <li class="flex items-center justify-between rounded-sm bg-grey-normal p-4">
          <span class="text-sm font-medium text-black-normal" dir="ltr">{{ t('profile.supportPage.email') }}</span>
          <span class="text-sm text-grey-dark-hover">{{ t('profile.supportPage.emailLabel') }}</span>
        </li>
        <li class="flex items-center justify-between rounded-sm bg-grey-normal p-4">
          <span class="text-sm font-medium text-black-normal" dir="ltr">{{ t('profile.supportPage.whatsapp') }}</span>
          <span class="text-sm text-grey-dark-hover">{{ t('profile.supportPage.whatsappLabel') }}</span>
        </li>
        <li class="flex items-center justify-between rounded-sm bg-grey-normal p-4">
          <span class="text-sm text-black-normal">{{ t('profile.supportPage.hours') }}</span>
          <span class="text-sm text-grey-dark-hover">{{ t('profile.supportPage.hoursLabel') }}</span>
        </li>
      </ul>
    </section>
  </SharedProfileShell>
</template>
