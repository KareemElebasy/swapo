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

useHead({ title: t('profile.addressesPage.metaTitle') })

interface Address {
  id: number
  full_name: string
  phone: string
  city: string
  district: string
  line1: string
  details?: string
  is_default: boolean
}

const addresses = ref<Address[]>([])
const loading = ref(true)
const deletingId = ref<number | null>(null)

async function fetchAddresses() {
  loading.value = true
  try {
    const res = await apiFetch<{ data: Address[] }>('address')
    addresses.value = res?.data ?? []
  } finally {
    loading.value = false
  }
}

async function deleteAddress(id: number) {
  if (!confirm(t('profile.addressesPage.deleteConfirm'))) return
  deletingId.value = id
  try {
    await apiFetch(`address/${id}`, { method: 'DELETE' })
    addresses.value = addresses.value.filter(a => a.id !== id)
  } finally {
    deletingId.value = null
  }
}

async function setDefault(id: number) {
  await apiFetch(`address/${id}/default`, { method: 'POST' })
  addresses.value = addresses.value.map(a => ({ ...a, is_default: a.id === id }))
}

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}

onMounted(fetchAddresses)
</script>

<template>
  <SharedProfileShell role="buyer" @logout="handleLogout">
    <section class="bg-white">
      <div class="mb-7 flex items-center justify-between gap-4">
        <BaseButton
          variant="secondary"
          size="sm"
          :to="localePath('/profile/addresses/new')"
        >
          <template #icon>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </template>
          {{ t('profile.addressesPage.add') }}
        </BaseButton>

        <h2 class="text-xl font-bold text-black-normal">
          {{ t('profile.addressesPage.title') }}
        </h2>
      </div>

      <div v-if="loading" class="py-8 text-center text-sm text-grey-dark-hover">
        {{ t('profile.addressesPage.loading') }}
      </div>

      <div v-else-if="addresses.length === 0" class="py-12 text-center">
        <svg class="mx-auto mb-3 size-12 text-blue-light-active" viewBox="0 0 48 48" fill="none">
          <path d="M24 4C16.268 4 10 10.268 10 18c0 10.5 14 26 14 26S38 28.5 38 18C38 10.268 31.732 4 24 4Zm0 19a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </svg>
        <p class="font-semibold text-black-normal">
          {{ t('profile.addressesPage.empty.title') }}
        </p>
        <p class="mt-1 text-sm text-grey-dark-hover">
          {{ t('profile.addressesPage.empty.message') }}
        </p>
      </div>

      <ul v-else class="divide-y divide-blue-light">
        <li
          v-for="address in addresses"
          :key="address.id"
          class="flex items-center justify-between gap-4 py-5"
        >
          <div class="flex shrink-0 items-center gap-3">
            <button
              type="button"
              class="flex size-9 items-center justify-center rounded-full bg-status-canceled-bg text-status-canceled-text transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal disabled:opacity-50"
              :aria-label="t('profile.addressesPage.delete')"
              :disabled="deletingId === address.id"
              @click="deleteAddress(address.id)"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3.5 5h11M7 5V3.5h4V5M6 7.5v5M9 7.5v5M12 7.5v5M5 5l.5 10h7L13 5"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <NuxtLink
              :to="localePath(`/profile/addresses/${address.id}/edit`)"
              class="flex size-9 items-center justify-center rounded-full bg-grey-normal text-grey-dark-active transition-colors hover:bg-grey-normal-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
              :aria-label="t('profile.addressesPage.edit')"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M8 4H4.5A1.5 1.5 0 0 0 3 5.5v8A1.5 1.5 0 0 0 4.5 15h8a1.5 1.5 0 0 0 1.5-1.5V10M11 3l4 4-6.5 6.5H5v-3.5L11 3Z"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </NuxtLink>
          </div>

          <div class="min-w-0 flex flex-1 items-start justify-end gap-3 text-end">
            <div>
              <p class="text-sm font-semibold text-black-normal">
                {{ address.line1 }}
              </p>
              <p class="mt-1 text-sm text-grey-dark-hover">
                {{ address.district }}، {{ address.city }}
              </p>
              <p class="mt-1 text-xs text-grey-dark-hover" dir="ltr">
                {{ address.phone }}
              </p>
            </div>

            <button
              type="button"
              class="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-normal"
              :class="address.is_default ? 'border-brand-cyan' : 'border-grey-dark-hover'"
              :aria-label="t('profile.addressesPage.setDefault')"
              @click="setDefault(address.id)"
            >
              <span
                v-if="address.is_default"
                class="size-3 rounded-full bg-brand-cyan"
                aria-hidden="true"
              />
            </button>
          </div>
        </li>
      </ul>
    </section>
  </SharedProfileShell>
</template>
