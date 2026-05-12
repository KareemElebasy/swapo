<script setup lang="ts">
import { resendCode, verifyOtp } from "~/services/auth.service";

interface ServiceError {
  message?: string;
  errors?: Record<string, string[]>;
}

const resendDelaySeconds = 20;

const { locale, t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

const otp = ref("");
const loading = ref(false);
const resending = ref(false);
const resendRemaining = ref(resendDelaySeconds);
const fieldErrors = ref<Record<string, string[]>>({});
const pendingPhone = useState<string>("auth.phone", () => "");
const registrationToken = useState<string>("auth.reg_token", () => "");

let timerId: ReturnType<typeof setInterval> | undefined;

const otpError = computed(
  () => fieldErrors.value.otp?.[0] ?? fieldErrors.value.code?.[0],
);
const generalError = computed(() => fieldErrors.value.general?.[0]);
const formattedPhone = computed(() =>
  pendingPhone.value ? `+966${pendingPhone.value}` : "",
);
const canSubmit = computed(() => otp.value.length === 4 && !loading.value);
const canResend = computed(
  () => resendRemaining.value === 0 && !resending.value && !!pendingPhone.value,
);
const timerLabel = computed(() => {
  const minutes = Math.floor(resendRemaining.value / 60);
  const seconds = String(resendRemaining.value % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
});
const arrowDirectionClass = computed(() =>
  locale.value === "ar" ? "" : "rotate-180",
);

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = undefined;
  }
}

function startTimer() {
  stopTimer();
  resendRemaining.value = resendDelaySeconds;

  timerId = setInterval(() => {
    if (resendRemaining.value <= 1) {
      resendRemaining.value = 0;
      stopTimer();
      return;
    }

    resendRemaining.value -= 1;
  }, 1000);
}

function setError(error: unknown) {
  const serviceError = error as ServiceError;

  if (serviceError.errors) {
    fieldErrors.value = serviceError.errors;
    return;
  }

  fieldErrors.value = {
    general: [serviceError.message ?? t("auth.verifyPage.form.generalError")],
  };
}

async function submitOtp() {
  if (!canSubmit.value) {
    fieldErrors.value = {
      otp: [t("auth.verifyPage.form.invalidCode")],
    };
    return;
  }

  loading.value = true;
  fieldErrors.value = {};

  try {
    const response = await verifyOtp({
      phone_code: "966",
      phone: pendingPhone.value,
      otp: otp.value,
      device_type: "web",
      device_token: "web",
    });

    registrationToken.value = response.data.registration_token;
    await router.push(localePath("/auth/signup"));
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}

async function resendOtp() {
  if (!canResend.value) {
    return;
  }

  resending.value = true;
  fieldErrors.value = {};

  try {
    await resendCode({
      phone_code: "966",
      phone: pendingPhone.value,
    });
    otp.value = "";
    startTimer();
  } catch (error) {
    setError(error);
  } finally {
    resending.value = false;
  }
}

onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>

<template>
  <form
    class="flex w-full max-w-[603px] flex-col items-end justify-center rounded-lg border border-black/5 bg-white/80 p-5 shadow-[0_24px_80px_rgba(9,9,9,0.06)] backdrop-blur sm:p-6 lg:min-h-[420px] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
    @submit.prevent="submitOtp"
  >
    <div class="flex w-full flex-col items-center gap-4">
      <div class="flex w-full items-center">
        <BaseIconButton
          variant="ghost"
          size="md"
          :to="localePath('/auth/login')"
          :ariaLabel="t('auth.verifyPage.form.backToLogin')"
          class="text-black-normal! hover:bg-transparent! active:bg-transparent!"
        >
          <template #icon>
            <svg
              :class="arrowDirectionClass"
              class="size-6 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M14.43 5.93 20.5 12l-6.07 6.07"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3.5 12h16.83"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
        </BaseIconButton>
      </div>

      <div class="flex w-full flex-col gap-0.5">
        <h2 class="w-full text-lg font-bold leading-6 text-[#121217]">
          {{ t("auth.verifyPage.form.title") }}
        </h2>

        <div class="flex w-full flex-col items-end">
          <p class="w-full text-sm leading-6 text-grey-darker">
            {{ t("auth.verifyPage.form.subtitle") }}
          </p>

          <p
            v-if="formattedPhone"
            class="w-full text-sm leading-6 text-grey-darker"
            dir="ltr"
          >
            {{ formattedPhone }}
          </p>
        </div>
      </div>

      <div class="flex w-full flex-col gap-3">
        <AuthOtpInput
          v-model="otp"
          :disabled="loading"
          :error="otpError"
          @complete="submitOtp"
        />

        <div class="flex w-full flex-col items-center justify-center gap-3">
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
            {{ t("auth.verifyPage.form.submit") }}
          </BaseButton>

          <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center gap-1 rounded-full bg-[#F7F7F8] px-4 py-2 text-sm transition-colors hover:bg-grey-normal disabled:cursor-not-allowed"
            :disabled="!canResend"
            @click="resendOtp"
          >
            <span
              :class="canResend ? 'text-blue-normal' : 'text-[#A9ADB4]'"
              class="font-medium leading-6"
            >
              {{ t("auth.verifyPage.form.resend") }}
            </span>

            <span
              v-if="resendRemaining > 0"
              class="w-[30px] font-sans leading-none text-black-normal"
              dir="ltr"
            >
              {{ timerLabel }}
            </span>
          </button>
        </div>

        <p v-if="generalError" class="w-full text-sm text-status-canceled-text">
          {{ generalError }}
        </p>
      </div>
    </div>
  </form>
</template>
