<script setup lang="ts">
import { apiFetch } from '~/composables/useApi'

definePageMeta({
  layout: 'buyer',
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

useHead({ title: t('profile.addressForm.editMetaTitle') })

const addressId = computed(() => route.params.addressId as string)

interface City { id: number; name: string }
interface Address {
  id: number
  full_name: string
  phone: string
  city_id: number
  district: string
  line1: string
  details?: string
}

const cities = ref<City[]>([])
const loadingAddress = ref(true)

const form = reactive({
  full_name: '',
  phone: '',
  city_id: '',
  district: '',
  line1: '',
  details: '',
})

const errors = reactive({
  full_name: '',
  phone: '',
  city_id: '',
  district: '',
  line1: '',
})

const saving = ref(false)
const saveError = ref('')

const cityOptions = computed(() =>
  cities.value.map(c => ({ value: String(c.id), label: c.name }))
)

async function loadData() {
  loadingAddress.value = true
  try {
    const [citiesRes, addressRes] = await Promise.all([
      apiFetch<{ data: City[] }>('list/cities', { useGeneral: true }),
      apiFetch<{ data: Address }>(`address/${addressId.value}`),
    ])
    cities.value = citiesRes?.data ?? []
    const a = addressRes?.data
    if (a) {
      form.full_name = a.full_name
      form.phone = a.phone
      form.city_id = String(a.city_id)
      form.district = a.district
      form.line1 = a.line1
      form.details = a.details ?? ''
    }
  } finally {
    loadingAddress.value = false
  }
}

function validate() {
  errors.full_name = form.full_name ? '' : t('profile.addressForm.required')
  errors.phone = form.phone ? '' : t('profile.addressForm.required')
  errors.city_id = form.city_id ? '' : t('profile.addressForm.required')
  errors.district = form.district ? '' : t('profile.addressForm.required')
  errors.line1 = form.line1 ? '' : t('profile.addressForm.required')
  return !Object.values(errors).some(Boolean)
}

async function submit() {
  if (!validate()) return
  saving.value = true
  saveError.value = ''
  try {
    await apiFetch(`address/${addressId.value}`, { method: 'PATCH', body: form })
    router.push(localePath('/profile/addresses'))
  } catch {
    saveError.value = t('profile.addressForm.saveError')
  } finally {
    saving.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}

onMounted(loadData)
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-6">
    <div class="flex gap-6">
      <aside class="hidden shrink-0 md:block">
        <SharedProfileSidebar role="buyer" @logout="handleLogout" />
      </aside>

      <main class="min-w-0 flex-1">
        <NuxtLink
          :to="localePath('/profile/addresses')"
          class="mb-4 inline-flex items-center gap-1 text-sm text-grey-dark-hover"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="rtl:rotate-180">
            <path d="M10 4 6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ t('profile.addressesPage.title') }}
        </NuxtLink>

        <div class="rounded-xl border border-border bg-white p-6">
          <h1 class="mb-6 text-xl font-bold text-navy">{{ t('profile.addressForm.editTitle') }}</h1>

          <div v-if="loadingAddress" class="py-8 text-center text-sm text-grey-dark-hover">
            {{ t('common.loading') }}
          </div>

          <form v-else class="space-y-4" @submit.prevent="submit">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BaseInput
                v-model="form.full_name"
                :label="t('profile.addressForm.fullName')"
                :placeholder="t('profile.addressForm.fullNamePlaceholder')"
                :error="errors.full_name"
                required
              />
              <BaseInput
                v-model="form.phone"
                :label="t('profile.addressForm.phone')"
                :placeholder="t('profile.addressForm.phonePlaceholder')"
                :error="errors.phone"
                dir="ltr"
                required
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BaseSelect
                v-model="form.city_id"
                :label="t('profile.addressForm.city')"
                :placeholder="t('profile.addressForm.cityPlaceholder')"
                :options="cityOptions"
                :error="errors.city_id"
              />
              <BaseInput
                v-model="form.district"
                :label="t('profile.addressForm.district')"
                :placeholder="t('profile.addressForm.districtPlaceholder')"
                :error="errors.district"
                required
              />
            </div>

            <BaseInput
              v-model="form.line1"
              :label="t('profile.addressForm.line1')"
              :placeholder="t('profile.addressForm.line1Placeholder')"
              :error="errors.line1"
              required
            />

            <BaseTextarea
              v-model="form.details"
              :label="t('profile.addressForm.details')"
              :placeholder="t('profile.addressForm.detailsPlaceholder')"
              :rows="2"
            />

            <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>

            <div class="flex justify-end gap-3 pt-2">
              <BaseButton
                variant="ghost"
                type="button"
                :to="localePath('/profile/addresses')"
              >
                {{ t('common.cancel') }}
              </BaseButton>
              <BaseButton variant="primary" type="submit" :loading="saving">
                {{ t('profile.addressForm.save') }}
              </BaseButton>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>
