<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

const { register, loading, fieldErrors } = useAuth();

const phone = ref("");

const phoneError = computed(() => fieldErrors.value.phone?.[0]);
const generalError = computed(() => fieldErrors.value.general?.[0]);
const canSubmit = computed(() => phone.value.length > 0 && !loading.value);

async function submitLogin() {
  if (!canSubmit.value) return;
  await register(phone.value);
}
</script>

<template>
  <form
    class="flex w-full max-w-[603px] flex-col items-start justify-center rounded-lg border border-black/5 bg-white/80 p-5 shadow-[0_24px_80px_rgba(9,9,9,0.06)] backdrop-blur sm:p-6 lg:min-h-[420px] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
    @submit.prevent="submitLogin"
  >
    <div class="flex w-full flex-col items-start gap-5">
      <img
        class="h-[35px] w-[104px]"
        src="/images/auth/login/swapo-logo-form.svg"
        :alt="t('common.logoAlt')"
      />

      <div class="flex w-full flex-col gap-0.5 text-start">
        <h2 class="w-full text-lg font-bold leading-6 text-[#121217]">
          {{ t("auth.loginPage.form.title") }}
        </h2>
        <p class="w-full text-sm leading-6 text-grey-darker">
          {{ t("auth.loginPage.form.subtitle") }}
        </p>
      </div>

      <div class="w-full pb-3">
        <AuthPhoneInput
          v-model="phone"
          :placeholder="t('auth.loginPage.form.phonePlaceholder')"
          :error="phoneError"
          :disabled="loading"
        />
      </div>
    </div>

    <BaseButton
      class="h-12 rounded-lg! text-base! font-semibold!"
      :class="
        canSubmit
          ? ''
          : 'bg-[#EEF2F2]! text-grey-dark-active! hover:bg-[#EEF2F2]! active:bg-[#EEF2F2]!'
      "
      type="submit"
      size="lg"
      full-width
      :disabled="!canSubmit"
      :loading="loading"
    >
      {{ t("auth.loginPage.form.submit") }}
    </BaseButton>

    <p
      v-if="generalError"
      class="mt-3 w-full text-sm text-status-canceled-text"
    >
      {{ generalError }}
    </p>
  </form>
</template>
