<script setup lang="ts">
interface FooterLink {
  label: string
  to: string
}

interface Props {
  links?: FooterLink[]
  showNewsletter?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  links: undefined,
  showNewsletter: true,
  compact: false,
})

const { t } = useI18n()
const localePath = useLocalePath()

const currentYear = new Date().getFullYear()
const email = ref('')

const defaultLinks = computed<FooterLink[]>(() => [
  { label: t('common.home'), to: '/' },
  { label: t('nav.negotiations'), to: '/negotiations' },
  { label: t('footer.about'), to: '/support' },
  { label: t('footer.policy'), to: '/profile/policy' },
  { label: t('footer.support'), to: '/profile/support' },
])

const links = computed(() => props.links ?? defaultLinks.value)
</script>

<template>
  <footer class="mt-auto bg-blue-normal text-grey-light">
    <div :class="['container-app', compact ? 'py-10' : 'py-12 lg:py-16']">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
        <div class="flex min-h-[150px] items-start">
          <NuxtLink :to="localePath('/')" :aria-label="t('common.brandName')" class="block">
            <img
              src="/images/auth/login/swapo-logo-form.svg"
              :alt="t('common.logoAlt')"
              class="h-auto w-[260px] max-w-full sm:w-[360px] lg:w-[420px]"
            >
          </NuxtLink>
        </div>

        <div class="flex flex-col gap-8">
          <form v-if="showNewsletter" class="flex flex-col gap-4" @submit.prevent>
            <label for="footer-newsletter" class="text-start text-2xl leading-8 lg:text-[28px]">
              {{ t('footer.newsletterTitle') }}
            </label>

            <div class="flex max-w-[420px] gap-3">
              <BaseIconButton
                :ariaLabel="t('footer.newsletterSubmit')"
                variant="primary"
                size="lg"
                class="bg-brand-cyan! text-blue-normal! hover:bg-brand-cyan-hover!"
              >
                <template #icon>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="rtl:rotate-180">
                    <path d="M11.25 4.5 6.75 9l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </template>
              </BaseIconButton>

              <input
                id="footer-newsletter"
                v-model="email"
                type="email"
                class="h-12 min-w-0 flex-1 rounded-md border border-grey-normal-hover bg-white px-4 text-sm text-black-normal outline-none transition-colors placeholder:text-grey-normal-active focus:border-brand-cyan"
                :placeholder="t('footer.emailPlaceholder')"
                dir="auto"
              >
            </div>
          </form>

          <nav class="grid max-w-[420px] grid-cols-2 gap-x-10 gap-y-4" :aria-label="t('footer.navLabel')">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="localePath(link.to)"
              class="text-start text-lg text-grey-light transition-colors hover:text-brand-cyan lg:text-xl"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>

      <div class="mt-14 flex flex-wrap items-center justify-between gap-6">
        <p class="text-sm uppercase text-grey-light">
          Swapo © {{ currentYear }}
        </p>

        <div class="flex items-center gap-4" :aria-label="t('footer.socialLabel')">
          <a
            v-for="social in ['instagram', 'facebook', 'linkedin']"
            :key="social"
            href="#"
            class="flex size-10 items-center justify-center rounded-full text-grey-light transition-colors hover:bg-blue-dark hover:text-brand-cyan"
            :aria-label="social"
          >
            <span class="text-sm font-bold uppercase">{{ social.slice(0, 2) }}</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
