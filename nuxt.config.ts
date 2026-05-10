// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  modules: [
    '@nuxt/image',
    '@nuxtjs/i18n',
  ],

  css: [
    '~/assets/styles/main.css',
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  i18n: {
    defaultLocale: 'ar',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    locales: [
      {
        code: 'ar',
        name: 'العربية',
        language: 'ar-SA',
        file: 'ar.json',
        dir: 'rtl',
      },
      {
        code: 'en',
        name: 'English',
        language: 'en-US',
        file: 'en.json',
        dir: 'ltr',
      },
    ],
  },
})
