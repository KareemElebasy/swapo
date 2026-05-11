<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-blue-normal text-green-normal mt-auto">
    <div class="container-app py-10">
      <div class="flex flex-col sm:flex-row gap-8 sm:gap-16">
        <!-- Brand column -->
        <div class="shrink-0">
          <NuxtLink
            :to="localePath('/')"
            class="text-xl font-bold text-green-normal"
          >
            Swapo
          </NuxtLink>
        </div>

        <!-- Links -->
        <div class="flex flex-wrap gap-8 flex-1">
          <div class="flex flex-col gap-2 min-w-32">
            <NuxtLink
              :to="localePath('/legal/privacy')"
              class="text-sm text-green-light-active hover:text-green-normal transition-colors"
            >
              {{ t('footer.privacy') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/legal/terms')"
              class="text-sm text-green-light-active hover:text-green-normal transition-colors"
            >
              {{ t('footer.terms') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/contact')"
              class="text-sm text-green-light-active hover:text-green-normal transition-colors"
            >
              {{ t('footer.contact') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Language toggle -->
        <div class="shrink-0 self-start">
          <SharedI18nLanguageToggle variant="compact" :inverted="true" />
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-8 pt-6 border-t border-blue-dark flex items-center justify-between gap-4 flex-wrap">
        <p class="text-xs text-green-light-active">
          &copy; {{ currentYear }} Swapo. {{ t('footer.rights') }}.
        </p>
      </div>
    </div>
  </footer>
</template>
