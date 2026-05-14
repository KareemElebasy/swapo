<script setup lang="ts">
definePageMeta({
  layout: 'buyer',
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

useHead({ title: t('profile.aboutPage.metaTitle') })

const points = ['trusted', 'simple', 'secure'] as const

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}
</script>

<template>
  <SharedProfileShell role="buyer" @logout="handleLogout">
    <section class="rounded-sm border border-blue-light bg-white p-6">
      <h2 class="mb-4 text-xl font-bold text-black-normal">
        {{ t('profile.aboutPage.title') }}
      </h2>
      <p class="max-w-2xl text-sm leading-7 text-black-normal">
        {{ t('profile.aboutPage.description') }}
      </p>

      <ul class="mt-6 grid gap-3 sm:grid-cols-3">
        <li
          v-for="point in points"
          :key="point"
          class="rounded-sm bg-grey-normal p-4 text-end"
        >
          <p class="text-sm font-semibold text-black-normal">
            {{ t(`profile.aboutPage.points.${point}.title`) }}
          </p>
          <p class="mt-1 text-xs leading-5 text-grey-dark-hover">
            {{ t(`profile.aboutPage.points.${point}.description`) }}
          </p>
        </li>
      </ul>
    </section>
  </SharedProfileShell>
</template>
