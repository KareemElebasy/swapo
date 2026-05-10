<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { getDirection, getLanguage } from "~/utils/direction";

type LocaleEntry =
  | string
  | {
      code?: string;
      language?: string;
      dir?: string;
    };

const { locale, locales } = useI18n();

const currentLocaleCode = computed(() => String(locale.value || "ar"));

const currentLocale = computed<LocaleEntry>(() => {
  const availableLocales = Array.isArray(locales.value) ? locales.value : [];

  return (
    availableLocales.find((entry) => {
      if (typeof entry === "string") {
        return entry === currentLocaleCode.value;
      }

      return entry.code === currentLocaleCode.value;
    }) || {
      code: "ar",
      language: "ar-SA",
      dir: "rtl",
    }
  );
});

useHead(() => ({
  htmlAttrs: {
    lang: getLanguage(currentLocale.value),
    dir: getDirection(currentLocale.value),
  },
}));
</script>
