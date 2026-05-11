<script setup lang="ts">
import { registerPhone } from "~/services/auth.service";

interface ServiceError {
  message?: string;
  errors?: Record<string, string[]>;
}

const { locale, t } = useI18n();
const router = useRouter();
const localePath = useLocalePath();

const phone = ref("");
const loading = ref(false);
const fieldErrors = ref<Record<string, string[]>>({});
const pendingPhone = useState<string>("auth.phone", () => "");

const phoneError = computed(() => fieldErrors.value.phone?.[0]);
const generalError = computed(() => fieldErrors.value.general?.[0]);
const canSubmit = computed(() => phone.value.length > 0 && !loading.value);

function setError(error: unknown) {
  const serviceError = error as ServiceError;

  if (serviceError.errors) {
    fieldErrors.value = serviceError.errors;
    return;
  }

  fieldErrors.value = {
    general: [serviceError.message ?? t("auth.loginPage.form.generalError")],
  };
}

async function submitLogin() {
  if (!canSubmit.value) {
    return;
  }

  loading.value = true;
  fieldErrors.value = {};

  try {
    await registerPhone({
      phone_code: "966",
      phone: phone.value,
      locale: locale.value,
    });

    pendingPhone.value = phone.value;
    await router.push(localePath("/auth/verify"));
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
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
