<script setup lang="ts">
interface Props {
  variant?: 'pill' | 'compact' | 'softPill'
  inverted?: boolean
}

type LocaleCode = 'ar' | 'en'

interface LocaleOption {
  code: LocaleCode
  name: string
  dir?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'pill',
  inverted: false,
})

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

function isLocaleOption(entry: { code?: string; name?: string; dir?: string }): entry is LocaleOption {
  return (entry.code === 'ar' || entry.code === 'en') && typeof entry.name === 'string'
}

const availableLocales = computed<LocaleOption[]>(() =>
  (locales.value as Array<{ code?: string; name?: string; dir?: string }>)
    .filter(isLocaleOption)
    .filter((l) => l.code !== locale.value),
)

const currentLocale = computed(() =>
  (locales.value as LocaleOption[]).find(
    (l) => l.code === locale.value,
  ),
)

const softPillLocales = computed(() => [
  { code: 'en' as const, label: t('common.localeShort.en') },
  { code: 'ar' as const, label: t('common.localeShort.ar') },
])
</script>

<template>
  <div
    :class="[
      'inline-flex items-center',
      variant === 'softPill'
        ? 'h-7 gap-[5px] rounded-full bg-grey-normal p-0.5'
        : variant === 'pill'
        ? 'rounded-sm border border-blue-light-active overflow-hidden'
        : 'gap-2',
    ]"
    :dir="variant === 'softPill' ? 'ltr' : undefined"
    role="group"
    :aria-label="$t('common.language')"
  >
    <template v-if="variant === 'softPill'">
      <template
        v-for="loc in softPillLocales"
        :key="loc.code"
      >
        <span
          v-if="loc.code === locale"
          class="inline-flex h-6 w-[37px] items-center justify-center rounded-full bg-white px-1 text-sm leading-[19px] text-grey-darker"
          aria-current="true"
        >
          {{ loc.label }}
        </span>

        <NuxtLink
          v-else
          :to="switchLocalePath(loc.code)"
          class="inline-flex h-6 w-[37px] items-center justify-center rounded-full bg-grey-normal px-1 text-sm leading-[19px] text-grey-darker transition-colors hover:bg-white/70"
        >
          {{ loc.label }}
        </NuxtLink>
      </template>
    </template>

    <!-- Current locale (active, non-interactive display in pill mode) -->
    <template v-else-if="variant === 'pill'">
      <span
        class="px-3 py-1.5 text-sm font-medium bg-blue-normal text-green-normal"
        aria-current="true"
      >
        {{ currentLocale?.name }}
      </span>

      <NuxtLink
        v-for="loc in availableLocales"
        :key="loc.code"
        :to="switchLocalePath(loc.code)"
        class="px-3 py-1.5 text-sm font-medium text-blue-normal hover:bg-blue-light transition-colors"
      >
        {{ loc.name }}
      </NuxtLink>
    </template>

    <!-- Compact: just show the other locale as a link -->
    <template v-else>
      <NuxtLink
        v-for="loc in availableLocales"
        :key="loc.code"
        :to="switchLocalePath(loc.code)"
        :class="[
          'text-sm font-medium transition-colors underline underline-offset-2',
          inverted
            ? 'text-green-normal hover:text-green-light-active'
            : 'text-blue-normal hover:text-blue-normal-hover',
        ]"
      >
        {{ loc.name }}
      </NuxtLink>
    </template>
  </div>
</template>
