<script setup lang="ts">
import type { ProfileUpdatePayload } from '~/types/user'
import { apiFetch } from '~/composables/useApi'

definePageMeta({
  layout: 'seller',
  middleware: ['auth', 'seller'],
})

const { t } = useI18n()
const localePath = useLocalePath()
const authStore = useAuthStore()
const router = useRouter()

useHead({ title: t('profile.page.metaTitle') })

const user = computed(() => authStore.user)

const editing = ref(false)
const saving = ref(false)
const saveError = ref('')

const form = reactive<ProfileUpdatePayload>({
  first_name: '',
  last_name: '',
  email: '',
  gender: undefined,
  birth_date: '',
})

function startEdit() {
  if (!user.value) return
  form.first_name = user.value.first_name
  form.last_name = user.value.last_name
  form.email = user.value.email
  form.gender = user.value.gender
  form.birth_date = user.value.birth_date
  editing.value = true
  saveError.value = ''
}

function cancelEdit() {
  editing.value = false
  saveError.value = ''
}

async function saveInfo() {
  saving.value = true
  saveError.value = ''
  try {
    const updated = await apiFetch<{ data: typeof user.value }>('user/profile', {
      method: 'PATCH',
      body: form,
    })
    if (updated?.data) authStore.setUser(updated.data)
    editing.value = false
  } catch {
    saveError.value = t('profile.page.saveError')
  } finally {
    saving.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push(localePath('/auth/login'))
}

const genderOptions = computed(() => [
  { value: 'male', label: t('profile.page.info.male') },
  { value: 'female', label: t('profile.page.info.female') },
])
</script>

<template>
  <SharedProfileShell role="seller" @logout="handleLogout">
    <section class="rounded-sm border border-blue-light bg-white p-6">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h2 class="text-xl font-bold text-black-normal">{{ t('profile.page.title') }}</h2>
        <BaseButton
          v-if="!editing"
          variant="secondary"
          size="sm"
          @click="startEdit"
        >
          {{ t('profile.page.editInfo') }}
        </BaseButton>
      </div>

      <div class="mb-6 flex items-center gap-4">
        <div class="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-green bg-surface">
          <img
            v-if="user?.image"
            :src="user.image"
            :alt="t('profile.page.avatarAlt', { name: user.full_name })"
            class="size-full object-cover"
          />
          <svg v-else class="size-full p-4 text-navy" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z" />
          </svg>
        </div>
        <div>
          <p class="text-base font-semibold text-navy">{{ user?.store_name || user?.full_name }}</p>
          <p class="text-sm text-grey-dark-hover">{{ user?.phone_code }}{{ user?.phone }}</p>
          <span class="mt-1 inline-flex items-center rounded-full bg-green/10 px-2 py-0.5 text-xs font-medium text-green">
            {{ t('roles.seller') }}
          </span>
        </div>
      </div>

      <template v-if="!editing">
        <dl class="divide-y divide-border">
          <div class="flex items-center justify-between py-3">
            <dd class="text-sm text-black-normal">{{ user?.first_name }} {{ user?.last_name }}</dd>
            <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.page.info.name') }}</dt>
          </div>
          <div class="flex items-center justify-between py-3">
            <dd class="text-sm text-black-normal" dir="ltr">{{ user?.email || t('profile.page.info.notSet') }}</dd>
            <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.page.info.email') }}</dt>
          </div>
          <div class="flex items-center justify-between py-3">
            <dd class="text-sm text-black-normal" dir="ltr">{{ user?.phone_code }}{{ user?.phone }}</dd>
            <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.page.info.phone') }}</dt>
          </div>
          <div class="flex items-center justify-between py-3">
            <dd class="text-sm text-black-normal">
              {{ user?.gender === 'male' ? t('profile.page.info.male') : user?.gender === 'female' ? t('profile.page.info.female') : t('profile.page.info.notSet') }}
            </dd>
            <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.page.info.gender') }}</dt>
          </div>
          <div class="flex items-center justify-between py-3">
            <dd class="text-sm text-black-normal" dir="ltr">{{ user?.birth_date || t('profile.page.info.notSet') }}</dd>
            <dt class="text-sm font-medium text-grey-dark-hover">{{ t('profile.page.info.birthDate') }}</dt>
          </div>
        </dl>

        <div class="mt-4 flex justify-end">
          <BaseButton variant="ghost" size="sm" :to="localePath('/seller/data')">
            {{ t('profile.nav.bankAccount') }} ←
          </BaseButton>
        </div>
      </template>

      <template v-else>
        <form class="space-y-4" @submit.prevent="saveInfo">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BaseInput
              v-model="form.first_name"
              :label="t('auth.signupPage.form.firstNamePlaceholder')"
              :placeholder="t('auth.signupPage.form.firstNamePlaceholder')"
              required
            />
            <BaseInput
              v-model="form.last_name"
              :label="t('auth.signupPage.form.lastNamePlaceholder')"
              :placeholder="t('auth.signupPage.form.lastNamePlaceholder')"
              required
            />
          </div>
          <BaseInput
            v-model="form.email"
            type="email"
            :label="t('profile.page.info.email')"
            :placeholder="t('auth.signupPage.form.emailPlaceholder')"
            dir="ltr"
          />
          <BaseSelect
            v-model="form.gender"
            :label="t('profile.page.info.gender')"
            :options="genderOptions"
            :placeholder="t('profile.page.info.gender')"
          />
          <BaseInput
            v-model="form.birth_date"
            :label="t('profile.page.info.birthDate')"
            :placeholder="t('auth.signupPage.form.birthDatePlaceholder')"
            dir="ltr"
          />

          <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <BaseButton variant="ghost" type="button" @click="cancelEdit">
              {{ t('profile.page.cancelEdit') }}
            </BaseButton>
            <BaseButton variant="primary" type="submit" :loading="saving">
              {{ t('profile.page.saveInfo') }}
            </BaseButton>
          </div>
        </form>
      </template>
    </section>
  </SharedProfileShell>
</template>
