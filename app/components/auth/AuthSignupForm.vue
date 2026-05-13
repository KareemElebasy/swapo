<script setup lang="ts">
import type { Ref } from "vue";

type Gender = "male" | "female";

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

const { complete, loading, fieldErrors, registrationToken } = useAuth();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const birthDate = ref("");
const gender = ref<Gender | "">("");

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

function toApiBirthDate(value: string): string {
  const trimmedValue = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);
  if (isoMatch) return trimmedValue;

  const displayMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmedValue);
  if (!displayMatch) return trimmedValue;

  const [, day = "", month = "", year = ""] = displayMatch;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

async function submitSignup() {
  if (!registrationToken.value) {
    fieldErrors.value = { general: [t("auth.signupPage.form.missingSession")] };
    return;
  }
  if (!canSubmit.value || !gender.value) return;

  await complete({
    first_name: firstName.value.trim(),
    last_name: lastName.value.trim(),
    email: email.value.trim(),
    gender: gender.value,
    birth_date: toApiBirthDate(birthDate.value),
  });
}
</script>

<template>
  <form
    class="flex w-full max-w-[603px] flex-col items-end justify-center rounded-lg border border-black/5 bg-white/80 p-5 shadow-[0_24px_80px_rgba(9,9,9,0.06)] backdrop-blur sm:p-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
    @submit.prevent="submitSignup"
  >
    <div class="flex w-full flex-col items-center gap-5">
      <div class="flex w-full items-center">
        <BaseIconButton
          variant="ghost"
          size="md"
          :to="localePath('/auth/verify')"
          :ariaLabel="t('auth.signupPage.form.backToVerify')"
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

      <div class="flex w-full flex-col gap-2">
        <p class="text-xs font-semibold uppercase leading-4 text-grey-darker">
          {{ t("auth.signupPage.form.accountTypeLabel") }}
        </p>

        <div
          class="grid w-full grid-cols-2 gap-2 rounded-lg border border-grey-normal-hover bg-white p-2"
        >
          <div
            class="flex min-h-[72px] flex-col justify-center gap-1 rounded-lg border border-blue-normal bg-green-light px-3 py-2"
          >
            <span class="text-sm font-semibold leading-5 text-blue-normal">
              {{ t("roles.buyer") }}
            </span>
            <span class="text-xs leading-5 text-black-normal-hover">
              {{ t("auth.signupPage.form.buyerStep") }}
            </span>
          </div>

          <div
            class="flex min-h-[72px] flex-col justify-center gap-1 rounded-lg border border-grey-normal-hover bg-grey-normal px-3 py-2"
          >
            <span class="text-sm font-semibold leading-5 text-black-normal-hover">
              {{ t("roles.seller") }}
            </span>
            <span class="text-xs leading-5 text-grey-darker">
              {{ t("auth.signupPage.form.sellerStep") }}
            </span>
          </div>
        </div>

        <p class="rounded-lg bg-[#F5FBFA] px-3 py-2 text-sm leading-6 text-grey-darker">
          {{ t("auth.signupPage.form.sellerUpgradeHint") }}
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
                class="h-12 w-full rounded-lg border border-grey-normal-hover bg-white ps-4 pe-4 text-sm leading-5 text-black-normal placeholder:text-grey-normal-active transition-colors focus:border-blue-normal focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
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
            class="h-12 w-full rounded-lg border border-grey-normal-hover bg-white ps-4 pe-4 text-sm leading-5 text-black-normal placeholder:text-grey-normal-active transition-colors focus:border-blue-normal focus:outline-none focus:ring-2 focus:ring-blue-light disabled:opacity-60"
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
                'flex h-12 cursor-pointer items-center justify-between rounded-lg border ps-4 pe-4 transition-colors',
                gender === option.value
                  ? 'border-blue-normal bg-green-light'
                  : 'border-grey-normal-hover bg-white hover:bg-grey-normal',
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

              <span class="min-w-0 flex-1 text-sm leading-5 text-black-normal-hover">
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
        class="h-12 rounded-lg! text-base! font-semibold! disabled:opacity-100!"
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
