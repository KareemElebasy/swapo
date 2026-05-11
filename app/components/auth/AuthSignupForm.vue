<script setup lang="ts">
import type { Ref } from "vue";
import type { CompleteDataPayload } from "~/types/auth";
import { completeData } from "~/services/auth.service";

type Gender = CompleteDataPayload["gender"];

interface ServiceError {
  message?: string;
  errors?: Record<string, string[]>;
}

interface SignupField {
  key: "firstName" | "lastName" | "email" | "birthDate";
  model: Ref<string>;
  placeholderKey: string;
  type: string;
  autocomplete: string;
  inputmode?: "email" | "numeric" | "text";
  dir?: "ltr" | "rtl" | "auto";
}

interface SignupDetailField extends SignupField {
  labelKey: string;
}

const { locale, t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const birthDate = ref("");
const gender = ref<Gender | "">("");
const loading = ref(false);
const fieldErrors = ref<Record<string, string[]>>({});
const pendingPhone = useState<string>("auth.phone", () => "");
const registrationToken = useState<string>("auth.reg_token", () => "");

const nameFields: SignupField[] = [
  {
    key: "firstName",
    model: firstName,
    placeholderKey: "auth.signupPage.form.firstNamePlaceholder",
    type: "text",
    autocomplete: "given-name",
    dir: "auto",
  },
  {
    key: "lastName",
    model: lastName,
    placeholderKey: "auth.signupPage.form.lastNamePlaceholder",
    type: "text",
    autocomplete: "family-name",
    dir: "auto",
  },
];

const detailsFields: SignupDetailField[] = [
  {
    key: "email",
    model: email,
    labelKey: "auth.signupPage.form.emailLabel",
    placeholderKey: "auth.signupPage.form.emailPlaceholder",
    type: "email",
    autocomplete: "email",
    inputmode: "email",
    dir: "ltr",
  },
  {
    key: "birthDate",
    model: birthDate,
    labelKey: "auth.signupPage.form.birthDateLabel",
    placeholderKey: "auth.signupPage.form.birthDatePlaceholder",
    type: "text",
    autocomplete: "bday",
    inputmode: "numeric",
    dir: "ltr",
  },
];

const genderOptions: Array<{ value: Gender; labelKey: string }> = [
  { value: "male", labelKey: "auth.signupPage.form.genderMale" },
  { value: "female", labelKey: "auth.signupPage.form.genderFemale" },
];

const fieldErrorMap = computed<Record<string, string | undefined>>(() => ({
  firstName: fieldErrors.value.first_name?.[0],
  lastName: fieldErrors.value.last_name?.[0],
  email: fieldErrors.value.email?.[0],
  birthDate: fieldErrors.value.birth_date?.[0],
  gender: fieldErrors.value.gender?.[0],
}));

const generalError = computed(() => fieldErrors.value.general?.[0]);
const canSubmit = computed(
  () =>
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    email.value.trim().length > 0 &&
    birthDate.value.trim().length > 0 &&
    !!gender.value &&
    !loading.value,
);

const arrowDirectionClass = computed(() =>
  locale.value === "ar" ? "" : "rotate-180",
);

function updateField(field: SignupField, event: Event) {
  const target = event.target as HTMLInputElement;
  field.model.value = target.value;
}

function toApiBirthDate(value: string) {
  const trimmedValue = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);

  if (isoMatch) {
    return trimmedValue;
  }

  const displayMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmedValue);

  if (!displayMatch) {
    return trimmedValue;
  }

  const [, day = "", month = "", year = ""] = displayMatch;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function setError(error: unknown) {
  const serviceError = error as ServiceError;

  if (serviceError.errors) {
    fieldErrors.value = serviceError.errors;
    return;
  }

  fieldErrors.value = {
    general: [serviceError.message ?? t("auth.signupPage.form.generalError")],
  };
}

async function submitSignup() {
  if (!registrationToken.value) {
    fieldErrors.value = {
      general: [t("auth.signupPage.form.missingSession")],
    };
    return;
  }

  if (!canSubmit.value || !gender.value) {
    return;
  }

  loading.value = true;
  fieldErrors.value = {};

  try {
    const response = await completeData({
      phone_code: "966",
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      email: email.value.trim(),
      gender: gender.value,
      birth_date: toApiBirthDate(birthDate.value),
      device_type: "web",
      device_token: "web",
      registration_token: registrationToken.value,
    });

    if (typeof useAuthStore === "function") {
      const authStore = useAuthStore();

      authStore.setToken(response.data.access_token);
      authStore.setUser(response.data.user);
    }

    pendingPhone.value = "";
    registrationToken.value = "";
    await router.push(localePath("/"));
  } catch (error) {
    setError(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form
    class="flex w-full max-w-[603px] flex-col items-end justify-center pt-6"
    @submit.prevent="submitSignup"
  >
    <div class="flex w-full flex-col items-center gap-4">
      <div class="flex w-full items-center">
        <BaseIconButton
          variant="ghost"
          size="md"
          :to="localePath('/auth/verify')"
          :aria-label="t('auth.signupPage.form.backToVerify')"
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
        <h2 class="w-full text-lg font-bold leading-6 text-black-normal">
          {{ t("auth.signupPage.form.title") }}
        </h2>
        <p class="w-full text-sm leading-6 text-grey-darker">
          {{ t("auth.signupPage.form.subtitle") }}
        </p>
      </div>

      <div class="flex w-full flex-col gap-4">
        <div class="flex w-full flex-col gap-2">
          <div
            class="flex w-full items-center gap-0.5 text-sm font-medium leading-5 text-black-normal-hover"
          >
            <span>{{ t("auth.signupPage.form.nameLabel") }}</span>
            <span class="text-status-canceled-text" aria-hidden="true">*</span>
          </div>

          <div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            <div
              v-for="field in nameFields"
              :key="field.key"
              class="flex w-full flex-col gap-1.5"
            >
              <input
                :value="field.model.value"
                :type="field.type"
                :autocomplete="field.autocomplete"
                :placeholder="t(field.placeholderKey)"
                :dir="field.dir"
                :aria-invalid="!!fieldErrorMap[field.key] || undefined"
                :aria-describedby="
                  fieldErrorMap[field.key] ? `${field.key}-error` : undefined
                "
                class="h-12 w-full rounded-xl border border-grey-normal-hover bg-white ps-4 pe-4 text-sm leading-5 text-black-normal placeholder:text-grey-normal-active focus:border-blue-light-active focus:outline-none disabled:opacity-60"
                :disabled="loading"
                @input="updateField(field, $event)"
              />

              <p
                v-if="fieldErrorMap[field.key]"
                :id="`${field.key}-error`"
                class="text-xs text-status-canceled-text"
              >
                {{ fieldErrorMap[field.key] }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-for="field in detailsFields"
          :key="field.key"
          class="flex w-full flex-col gap-2"
        >
          <div
            class="flex w-full items-center gap-0.5 text-sm font-medium leading-5 text-black-normal-hover"
          >
            <label :for="`signup-${field.key}`">{{ t(field.labelKey) }}</label>
            <span class="text-status-canceled-text" aria-hidden="true">*</span>
          </div>

          <input
            :id="`signup-${field.key}`"
            :value="field.model.value"
            :type="field.type"
            :autocomplete="field.autocomplete"
            :inputmode="field.inputmode"
            :placeholder="t(field.placeholderKey)"
            :dir="field.dir"
            :aria-invalid="!!fieldErrorMap[field.key] || undefined"
            :aria-describedby="
              fieldErrorMap[field.key] ? `${field.key}-error` : undefined
            "
            class="h-12 w-full rounded-xl border border-grey-normal-hover bg-white ps-4 pe-4 text-sm leading-5 text-black-normal placeholder:text-grey-normal-active focus:border-blue-light-active focus:outline-none disabled:opacity-60"
            :disabled="loading"
            @input="updateField(field, $event)"
          />

          <p
            v-if="fieldErrorMap[field.key]"
            :id="`${field.key}-error`"
            class="text-xs text-status-canceled-text"
          >
            {{ fieldErrorMap[field.key] }}
          </p>
        </div>

        <fieldset class="flex w-full flex-col gap-2">
          <legend
            class="flex w-full items-center gap-0.5 text-sm font-medium leading-5 text-black-normal-hover"
          >
            <span>{{ t("auth.signupPage.form.genderLabel") }}</span>
            <span class="text-status-canceled-text" aria-hidden="true">*</span>
          </legend>

          <div class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <label
              v-for="option in genderOptions"
              :key="option.value"
              :class="[
                'flex h-12 cursor-pointer items-center justify-between rounded-xl border bg-white ps-4 pe-4 transition-colors',
                gender === option.value
                  ? 'border-blue-normal'
                  : 'border-grey-normal-hover',
                loading ? 'cursor-not-allowed opacity-60' : '',
              ]"
            >
              <input
                v-model="gender"
                class="sr-only"
                type="radio"
                name="gender"
                :value="option.value"
                :disabled="loading"
              />

              <span
                class="min-w-0 flex-1 text-sm leading-5 text-black-normal-hover"
              >
                {{ t(option.labelKey) }}
              </span>

              <span
                :class="[
                  'ms-2 flex size-4 shrink-0 items-center justify-center rounded-full border',
                  gender === option.value
                    ? 'border-blue-normal'
                    : 'border-grey-normal-active',
                ]"
                aria-hidden="true"
              >
                <span
                  v-if="gender === option.value"
                  class="size-2 rounded-full bg-blue-normal"
                />
              </span>
            </label>
          </div>

          <p
            v-if="fieldErrorMap.gender"
            id="gender-error"
            class="text-xs text-status-canceled-text"
          >
            {{ fieldErrorMap.gender }}
          </p>
        </fieldset>
      </div>

      <BaseButton
        class="h-12 rounded-lg! text-base! disabled:opacity-100!"
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
        {{ t("auth.signupPage.form.submit") }}
      </BaseButton>

      <p v-if="generalError" class="w-full text-sm text-status-canceled-text">
        {{ generalError }}
      </p>
    </div>
  </form>
</template>
