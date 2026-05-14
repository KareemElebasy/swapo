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

useHead({ title: t('profile.sellerDataPage.metaTitle') })

interface City { id: number; name: string }

const cities = ref<City[]>([])
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const saveError = ref('')

const data = reactive({
  store_name: '',
  national_id: '',
  bank_name: '',
  iban: '',
  city_id: '',
  district: '',
  details: '',
})

const form = reactive({ ...data })

const cityOptions = computed(() =>
  cities.value.map(c => ({ value: String(c.id), label: c.name }))
)

function displayValue(val: string) {
  return val || t('profile.sellerDataPage.notSet')
}

async function loadData() {
  loading.value = true
  try {
    const [citiesRes, profileRes] = await Promise.all([
      apiFetch<{ data: City[] }>('list/cities', { useGeneral: true }),
      apiFetch<{ data: typeof data }>('seller/profile'),
    ])
    cities.value = citiesRes?.data ?? []
    const d = profileRes?.data
    if (d) {
      Object.assign(data, d)
      Object.assign(form, d)
    }
  } finally {
    loading.value = false
  }
}

function startEdit() {
  Object.assign(form, data)
  editing.value = true
  saveError.value = ''
}

function cancelEdit() {
  editing.value = false
  saveError.value = ''
}

async function save() {
  saving.value = true
  saveError.value = ''
  try {
    const updated = await apiFetch<{ data: typeof data }>('seller/profile', {
      method: 'PATCH',
      body: form,
    })
    if (updated?.data) Object.assign(data, updated.data)
    editing.value = false
  } catch {
    saveError.value = t('profile.sellerDataPage.saveError')
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
  <SharedProfileShell role="seller" @logout="handleLogout">
    <div v-if="loading" class="rounded-sm border border-blue-light bg-white p-6 text-center text-sm text-grey-dark-hover">
      {{ t('common.loading') }}
    </div>

    <template v-else>
      <section class="rounded-sm border border-blue-light bg-white p-6">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 class="text-xl font-bold text-black-normal">{{ t('profile.nav.bankAccount') }}</h2>
          <BaseButton
            v-if="!editing"
            variant="secondary"
            size="sm"
            @click="startEdit"
          >
            {{ t('profile.sellerDataPage.editInfo') }}
          </BaseButton>
        </div>

            <!-- View mode -->
            <template v-if="!editing">
              <h2 class="mb-3 text-sm font-semibold text-grey-dark-hover">{{ t('profile.sellerDataPage.storeSection') }}</h2>
              <dl class="mb-6 divide-y divide-border">
                <div class="flex items-center justify-between py-3">
                  <dd class="text-sm text-black-normal">{{ displayValue(data.store_name) }}</dd>
                  <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.sellerDataPage.labels.storeName') }}</dt>
                </div>
                <div class="flex items-center justify-between py-3">
                  <dd class="text-sm text-black-normal" dir="ltr">{{ displayValue(data.national_id) }}</dd>
                  <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.sellerDataPage.labels.nationalId') }}</dt>
                </div>
                <div class="flex items-center justify-between py-3">
                  <dd class="text-sm text-black-normal">{{ displayValue(data.bank_name) }}</dd>
                  <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.sellerDataPage.labels.bankName') }}</dt>
                </div>
                <div class="flex items-center justify-between py-3">
                  <dd class="text-sm font-mono text-black-normal" dir="ltr">{{ displayValue(data.iban) }}</dd>
                  <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.sellerDataPage.labels.iban') }}</dt>
                </div>
              </dl>

              <h2 class="mb-3 text-sm font-semibold text-grey-dark-hover">{{ t('profile.sellerDataPage.addressSection') }}</h2>
              <dl class="divide-y divide-border">
                <div class="flex items-center justify-between py-3">
                  <dd class="text-sm text-black-normal">{{ displayValue(data.city_id) }}</dd>
                  <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.sellerDataPage.labels.city') }}</dt>
                </div>
                <div class="flex items-center justify-between py-3">
                  <dd class="text-sm text-black-normal">{{ displayValue(data.district) }}</dd>
                  <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.sellerDataPage.labels.district') }}</dt>
                </div>
                <div v-if="data.details" class="flex items-center justify-between py-3">
                  <dd class="text-sm text-black-normal">{{ data.details }}</dd>
                  <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.sellerDataPage.labels.details') }}</dt>
                </div>
              </dl>
            </template>

            <!-- Edit mode -->
            <template v-else>
              <form class="space-y-4" @submit.prevent="save">
                <h2 class="text-sm font-semibold text-grey-dark-hover">{{ t('profile.sellerDataPage.storeSection') }}</h2>

                <BaseInput
                  v-model="form.store_name"
                  :label="t('profile.sellerDataPage.labels.storeName')"
                  :placeholder="t('seller.registration.form.placeholders.storeName')"
                />
                <BaseInput
                  v-model="form.national_id"
                  :label="t('profile.sellerDataPage.labels.nationalId')"
                  :placeholder="t('seller.registration.form.placeholders.nationalId')"
                  dir="ltr"
                />
                <BaseInput
                  v-model="form.bank_name"
                  :label="t('profile.sellerDataPage.labels.bankName')"
                  :placeholder="t('seller.registration.form.placeholders.bankName')"
                />
                <BaseInput
                  v-model="form.iban"
                  :label="t('profile.sellerDataPage.labels.iban')"
                  :placeholder="t('seller.registration.form.placeholders.iban')"
                  dir="ltr"
                />

                <h2 class="pt-2 text-sm font-semibold text-grey-dark-hover">{{ t('profile.sellerDataPage.addressSection') }}</h2>

                <BaseSelect
                  v-model="form.city_id"
                  :label="t('profile.sellerDataPage.labels.city')"
                  :placeholder="t('seller.registration.form.placeholders.city')"
                  :options="cityOptions"
                />
                <BaseInput
                  v-model="form.district"
                  :label="t('profile.sellerDataPage.labels.district')"
                  :placeholder="t('seller.registration.form.placeholders.district')"
                />
                <BaseTextarea
                  v-model="form.details"
                  :label="t('profile.sellerDataPage.labels.details')"
                  :placeholder="t('seller.registration.form.placeholders.details')"
                  :rows="2"
                />

                <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>

                <div class="flex justify-end gap-3 pt-2">
                  <BaseButton variant="ghost" type="button" @click="cancelEdit">
                    {{ t('profile.sellerDataPage.cancelEdit') }}
                  </BaseButton>
                  <BaseButton variant="primary" type="submit" :loading="saving">
                    {{ t('profile.sellerDataPage.save') }}
                  </BaseButton>
                </div>
              </form>
            </template>
      </section>
    </template>
  </SharedProfileShell>
</template>
