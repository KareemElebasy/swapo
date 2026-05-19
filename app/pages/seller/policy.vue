<script setup lang="ts">
import { apiFetch } from '~/composables/useApi'

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'seller'],
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

useHead({ title: t('profile.policyPage.metaTitle') })

interface StaticPageData {
  data: { id: number; desc: string }
}

const content = ref('')
const loading = ref(true)
const fetchError = ref(false)

onMounted(async () => {
  try {
    const res = await apiFetch<StaticPageData>('static-data/term')
    content.value = res?.data?.desc ?? ''
  } catch {
    fetchError.value = true
  } finally {
    loading.value = false
  }
})

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}
</script>

<template>
  <SharedProfileShell role="seller" @logout="handleLogout">
    <section class="rounded-sm border border-blue-light bg-white p-6">
      <h2 class="mb-4 text-xl font-bold text-black-normal">
        {{ t('profile.policyPage.title') }}
      </h2>

      <div v-if="loading" class="text-sm text-grey-dark-hover">
        {{ t('common.loading') }}
      </div>
      <p v-else-if="fetchError" class="text-sm text-red-500">
        {{ t('errors.general') }}
      </p>
      <div
        v-else
        class="static-html-content text-sm leading-7 text-black-normal"
        v-html="content"
      />
    </section>
  </SharedProfileShell>
</template>
