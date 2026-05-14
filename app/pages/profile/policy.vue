<script setup lang="ts">
definePageMeta({
  layout: 'buyer',
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

useHead({ title: t('profile.policyPage.metaTitle') })

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}

const sections = ['usage', 'privacy', 'transactions', 'disputes'] as const
</script>

<template>
  <SharedProfileShell role="buyer" @logout="handleLogout">
    <section class="rounded-sm border border-blue-light bg-white p-6">
      <h2 class="mb-1 text-xl font-bold text-black-normal">
        {{ t('profile.policyPage.title') }}
      </h2>
      <p class="mb-6 text-xs text-grey-dark-hover">
        {{ t('profile.policyPage.lastUpdated') }}
      </p>

      <p class="mb-6 text-sm leading-relaxed text-black-normal">
        {{ t('profile.policyPage.intro') }}
      </p>

      <div class="space-y-5">
        <div
          v-for="section in sections"
          :key="section"
          class="rounded-sm bg-grey-normal p-4"
        >
          <h3 class="mb-2 text-sm font-semibold text-black-normal">
            {{ t(`profile.policyPage.sections.${section}.title`) }}
          </h3>
          <p class="text-sm leading-relaxed text-black-normal">
            {{ t(`profile.policyPage.sections.${section}.body`) }}
          </p>
        </div>
      </div>
    </section>
  </SharedProfileShell>
</template>
