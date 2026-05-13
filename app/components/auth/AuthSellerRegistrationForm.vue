<script setup lang="ts">
import closeIcon from '~/assets/images/auth/seller/close-form.svg'
import { apiFetch } from '~/composables/useApi'

interface City { id: number; name: string }
interface District { id: number; name: string }
interface Coords { lat: number; lng: number }

const { t } = useI18n()
const localePath = useLocalePath()
const { registerAsSeller, loading, fieldErrors } = useAuth()

// ─── form state ──────────────────────────────────────────────────────────────
const storeName  = ref('')
const nationalId = ref('')
const bankName   = ref('')
const iban       = ref('')
const details    = ref('')
const cityId     = ref<number | null>(null)
const districtId = ref<number | null>(null)
const streetName = ref('')
const location   = ref('')
const coords     = ref<Coords>({ lat: 24.7136, lng: 46.6753 })

// ─── address collapse ────────────────────────────────────────────────────────
const addressOpen = ref(false)

// ─── city / district data ────────────────────────────────────────────────────
const cities     = ref<City[]>([])
const districts  = ref<District[]>([])
const citiesLoading    = ref(false)
const districtsLoading = ref(false)

const cityOptions = computed(() =>
  cities.value.map((c) => ({ value: c.id, label: c.name })),
)
const districtOptions = computed(() =>
  districts.value.map((d) => ({ value: d.id, label: d.name })),
)

async function loadCities() {
  citiesLoading.value = true
  try {
    const res = await apiFetch<{ data: City[] }>('list/cities', { useGeneral: true })
    cities.value = res.data ?? []
  } catch {
    cities.value = []
  } finally {
    citiesLoading.value = false
  }
}

async function loadDistricts(id: number) {
  districtsLoading.value = true
  districtId.value = null
  districts.value = []
  try {
    const res = await apiFetch<{ data: District[] }>('list/districts', {
      useGeneral: true,
      query: { city_id: id },
    })
    districts.value = res.data ?? []
  } catch {
    districts.value = []
  } finally {
    districtsLoading.value = false
  }
}

function onCityChange(val: number | null) {
  cityId.value = val
  if (val) loadDistricts(val)
}

// ─── map ──────────────────────────────────────────────────────────────────────
function onCoordsUpdate(c: Coords) { coords.value = c }
function onAddressUpdate(addr: string) {
  location.value = addr
  if (!streetName.value) streetName.value = addr
}

// ─── validation ──────────────────────────────────────────────────────────────
const generalError = computed(() => fieldErrors.value.general?.[0])
const canSubmit = computed(() =>
  bankName.value.trim().length > 0 &&
  iban.value.trim().length > 0 &&
  cityId.value !== null &&
  !loading.value,
)

// ─── submit ──────────────────────────────────────────────────────────────────
async function submit() {
  if (!canSubmit.value) return
  await registerAsSeller({
    store_name:   storeName.value.trim() || undefined,
    national_id:  nationalId.value.trim() || undefined,
    bank_name:    bankName.value.trim(),
    iban:         iban.value.trim(),
    lat:          coords.value.lat,
    lng:          coords.value.lng,
    street_name:  streetName.value.trim(),
    location:     location.value.trim() || undefined,
    city_id:      cityId.value!,
    district_id:  districtId.value ?? undefined,
    details:      details.value.trim() || undefined,
  })
}

// ─── skip ────────────────────────────────────────────────────────────────────
const router = useRouter()
function skipRegistration() {
  router.push(localePath('/'))
}

onMounted(() => { loadCities() })
</script>

<template>
  <AuthCenteredDialog
    :title="t('seller.registration.title')"
    :close-label="t('common.close')"
    :close-to="localePath('/auth/lock')"
    :close-icon-src="closeIcon"
    body-class="overflow-y-auto px-5"
  >
    <form class="flex w-full flex-col gap-5 pb-2" @submit.prevent="submit">
      <p class="text-start text-sm leading-6 text-grey-darker">
        {{ t('seller.registration.subtitle') }}
      </p>

      <!-- ── Store & Payment ───────────────────────────────────────────── -->
      <fieldset class="flex flex-col gap-4">
        <legend class="mb-1 text-xs font-semibold uppercase tracking-wide text-grey-darker">
          {{ t('seller.registration.form.storeInfoSection') }}
        </legend>

        <!-- Store name (optional) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-black-normal-hover" for="sr-storeName">
            {{ t('seller.registration.form.storeName') }}
            <span class="ms-1 text-xs text-grey-darker">{{ t('common.optional') }}</span>
          </label>
          <input
            id="sr-storeName"
            v-model="storeName"
            type="text"
            :placeholder="t('seller.registration.form.placeholders.storeName')"
            :disabled="loading"
            class="h-12 w-full rounded-lg border border-grey-normal-hover bg-white ps-4 pe-4 text-sm text-black-normal placeholder:text-grey-normal-active transition-colors focus:border-blue-normal focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
          />
        </div>

        <!-- National ID (optional) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-black-normal-hover" for="sr-nationalId">
            {{ t('seller.registration.form.nationalId') }}
            <span class="ms-1 text-xs text-grey-darker">{{ t('common.optional') }}</span>
          </label>
          <input
            id="sr-nationalId"
            v-model="nationalId"
            type="text"
            inputmode="numeric"
            dir="ltr"
            :placeholder="t('seller.registration.form.placeholders.nationalId')"
            :disabled="loading"
            class="h-12 w-full rounded-lg border border-grey-normal-hover bg-white ps-4 pe-4 text-sm text-black-normal placeholder:text-grey-normal-active transition-colors focus:border-blue-normal focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
          />
        </div>

        <!-- Bank name (required) -->
        <div class="flex flex-col gap-1.5">
          <label class="flex items-center gap-0.5 text-sm font-medium text-black-normal-hover" for="sr-bankName">
            {{ t('seller.registration.form.bankName') }}
            <span class="text-status-canceled-text" aria-hidden="true">*</span>
          </label>
          <input
            id="sr-bankName"
            v-model="bankName"
            type="text"
            :placeholder="t('seller.registration.form.placeholders.bankName')"
            :disabled="loading"
            :aria-invalid="!!fieldErrors.bank_name?.[0] || undefined"
            class="h-12 w-full rounded-lg border bg-white ps-4 pe-4 text-sm text-black-normal placeholder:text-grey-normal-active transition-colors focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
            :class="fieldErrors.bank_name?.[0] ? 'border-status-canceled-text' : 'border-grey-normal-hover focus:border-blue-normal'"
          />
          <p v-if="fieldErrors.bank_name?.[0]" class="text-xs text-status-canceled-text">
            {{ fieldErrors.bank_name[0] }}
          </p>
        </div>

        <!-- IBAN (required) -->
        <div class="flex flex-col gap-1.5">
          <label class="flex items-center gap-0.5 text-sm font-medium text-black-normal-hover" for="sr-iban">
            {{ t('seller.registration.form.iban') }}
            <span class="text-status-canceled-text" aria-hidden="true">*</span>
          </label>
          <input
            id="sr-iban"
            v-model="iban"
            type="text"
            dir="ltr"
            :placeholder="t('seller.registration.form.placeholders.iban')"
            :disabled="loading"
            :aria-invalid="!!fieldErrors.iban?.[0] || undefined"
            class="h-12 w-full rounded-lg border bg-white ps-4 pe-4 text-sm text-black-normal placeholder:text-grey-normal-active transition-colors focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
            :class="fieldErrors.iban?.[0] ? 'border-status-canceled-text' : 'border-grey-normal-hover focus:border-blue-normal'"
          />
          <p v-if="fieldErrors.iban?.[0]" class="text-xs text-status-canceled-text">
            {{ fieldErrors.iban[0] }}
          </p>
        </div>
      </fieldset>

      <!-- ── Address (collapsible) ─────────────────────────────────────── -->
      <fieldset class="flex flex-col gap-0 rounded-xl border border-grey-normal-hover overflow-hidden">
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-3 text-start"
          @click="addressOpen = !addressOpen"
        >
          <span class="text-sm font-semibold text-black-normal-hover">
            {{ t('seller.registration.form.addressSection') }}
          </span>
          <svg
            class="size-4 text-grey-darker transition-transform duration-200"
            :class="addressOpen ? 'rotate-180' : ''"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div v-show="addressOpen" class="flex flex-col gap-4 border-t border-grey-normal-hover px-4 pb-4 pt-4">
          <div class="flex flex-col gap-2">
            <p class="text-xs leading-5 text-grey-darker">
              {{ t('seller.registration.form.mapHelper') }}
            </p>
            <ClientOnly>
              <SharedMapPicker
                :model-value="coords"
                @update:model-value="onCoordsUpdate"
                @update:address="onAddressUpdate"
              />
            </ClientOnly>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-0.5 text-sm font-medium text-black-normal-hover" for="sr-streetName">
              {{ t('seller.registration.form.pickupLocation') }}
              <span class="text-status-canceled-text" aria-hidden="true">*</span>
            </label>
            <input
              id="sr-streetName"
              v-model="streetName"
              type="text"
              :disabled="loading"
              :aria-invalid="!!fieldErrors.street_name?.[0] || undefined"
              class="h-12 w-full rounded-lg border bg-white ps-4 pe-4 text-sm text-black-normal placeholder:text-grey-normal-active transition-colors focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
              :class="fieldErrors.street_name?.[0] ? 'border-status-canceled-text' : 'border-grey-normal-hover focus:border-blue-normal'"
            />
            <p v-if="fieldErrors.street_name?.[0]" class="text-xs text-status-canceled-text">
              {{ fieldErrors.street_name[0] }}
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-0.5 text-sm font-medium text-black-normal-hover" for="sr-city">
              {{ t('seller.registration.form.city') }}
              <span class="text-status-canceled-text" aria-hidden="true">*</span>
            </label>
            <select
              id="sr-city"
              :value="cityId"
              :disabled="loading || citiesLoading"
              :aria-invalid="!!fieldErrors.city_id?.[0] || undefined"
              class="h-12 w-full rounded-lg border bg-white ps-4 pe-4 text-sm text-black-normal transition-colors focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
              :class="fieldErrors.city_id?.[0] ? 'border-status-canceled-text' : 'border-grey-normal-hover focus:border-blue-normal'"
              @change="onCityChange(($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)"
            >
              <option value="">{{ t('seller.registration.form.placeholders.city') }}</option>
              <option v-for="opt in cityOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <p v-if="fieldErrors.city_id?.[0]" class="text-xs text-status-canceled-text">
              {{ fieldErrors.city_id[0] }}
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-0.5 text-sm font-medium text-black-normal-hover" for="sr-district">
              {{ t('seller.registration.form.district') }}
              <span class="ms-1 text-xs text-grey-darker">{{ t('common.optional') }}</span>
            </label>
            <select
              id="sr-district"
              :value="districtId"
              :disabled="loading || districtsLoading || cityId === null"
              class="h-12 w-full rounded-lg border border-grey-normal-hover bg-white ps-4 pe-4 text-sm text-black-normal transition-colors focus:border-blue-normal focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
              @change="districtId = ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null"
            >
              <option value="">{{ t('seller.registration.form.placeholders.district') }}</option>
              <option v-for="opt in districtOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-black-normal-hover" for="sr-details">
              {{ t('seller.registration.form.details') }}
              <span class="ms-1 text-xs text-grey-darker">{{ t('common.optional') }}</span>
            </label>
            <textarea
              id="sr-details"
              v-model="details"
              rows="3"
              :placeholder="t('seller.registration.form.placeholders.details')"
              :disabled="loading"
              class="w-full rounded-lg border border-grey-normal-hover bg-white ps-4 pe-4 pt-3 pb-3 text-sm text-black-normal placeholder:text-grey-normal-active transition-colors focus:border-blue-normal focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60 resize-none"
            />
          </div>
        </div>
      </fieldset>

      <!-- General error -->
      <p v-if="generalError" class="text-sm text-status-canceled-text">
        {{ generalError }}
      </p>
    </form>

    <template #footer>
      <div class="flex flex-col gap-3">
        <BaseButton
          type="button"
          size="lg"
          full-width
          :disabled="!canSubmit"
          :loading="loading"
          class="h-12 rounded-lg! text-base! font-semibold!"
          :class="canSubmit ? '' : 'bg-[#EEF2F2]! text-grey-dark-active! hover:bg-[#EEF2F2]! active:bg-[#EEF2F2]!'"
          @click="submit"
        >
          {{ t('seller.registration.form.submit') }}
        </BaseButton>

        <button
          type="button"
          :disabled="loading"
          class="inline-flex w-full items-center justify-center rounded-lg border border-grey-normal-hover bg-white px-4 py-3 text-sm font-medium text-grey-darker transition-colors hover:bg-grey-normal disabled:cursor-not-allowed disabled:opacity-60"
          @click="skipRegistration"
        >
          {{ t('seller.registration.form.skip') }}
        </button>

        <p class="text-center text-xs text-grey-darker">
          {{ t('seller.registration.form.skipHint') }}
        </p>
      </div>
    </template>
  </AuthCenteredDialog>
</template>
