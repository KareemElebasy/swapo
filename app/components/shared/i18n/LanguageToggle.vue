<script setup lang="ts">
interface Props {
  variant?: 'pill' | 'compact'
  inverted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'pill',
  inverted: false,
})

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() =>
  (locales.value as Array<{ code: string; name: string; dir?: string }>)
    .filter((l) => l.code !== locale.value),
)

const currentLocale = computed(() =>
  (locales.value as Array<{ code: string; name: string }>).find(
    (l) => l.code === locale.value,
  ),
)
</script>

<template>
  <div
    :class="[
      'inline-flex items-center',
      variant === 'pill'
        ? 'rounded-sm border border-blue-light-active overflow-hidden'
        : 'gap-2',
    ]"
    role="group"
    :aria-label="$t('common.language')"
  >
    <!-- Current locale (active, non-interactive display in pill mode) -->
    <template v-if="variant === 'pill'">
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
