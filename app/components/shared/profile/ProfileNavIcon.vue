<script setup lang="ts">
interface Props {
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: 'overview',
})

const paths: Record<string, string[]> = {
  overview: ['M4 4h8v8H4z', 'M6 7h4M6 10h3'],
  user: ['M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M3 14c.6-2.5 2.5-4 5-4s4.4 1.5 5 4'],
  orders: ['M4 2.5h8l1 2v8.5H3V4.5l1-2Z', 'M5 6h6M5 9h6M5 12h4'],
  purchases: ['M4 2.5h8l1 2v8.5H3V4.5l1-2Z', 'M5 6h6M5 9h6M5 12h4'],
  negotiations: ['M3 4h10v6H7l-3 3v-3H3V4Z', 'M6 7h4'],
  favorites: ['M8 13s-5-2.8-5-6.2A2.8 2.8 0 0 1 8 5a2.8 2.8 0 0 1 5 1.8C13 10.2 8 13 8 13Z'],
  addresses: ['M2.8 4.5 6.2 3l3.6 1.5 3.4-1.5v8.5l-3.4 1.5-3.6-1.5-3.4 1.5v-8.5Z', 'M6.2 3v8.5M9.8 4.5V13'],
  phone: ['M6 2.5h4a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z', 'M7 11.5h2'],
  settings: ['M8 10.5A2.5 2.5 0 1 0 8 5a2.5 2.5 0 0 0 0 5.5Z', 'M8 1.8v1.4M8 12.8v1.4M3.6 3.6l1 1M11.4 11.4l1 1M1.8 8h1.4M12.8 8h1.4M3.6 12.4l1-1M11.4 4.6l1-1'],
  policy: ['M4 2.5h6l2 2v9H4v-11Z', 'M10 2.5v2h2', 'M6 8h4M6 10.5h4'],
  support: ['M3 8a5 5 0 1 1 9.5 2.2L13 14l-3.2-.8A5 5 0 0 1 3 8Z', 'M6.5 7a1.5 1.5 0 1 1 2.5 1.1c-.5.3-.8.7-.8 1.4M8 12h.01'],
  info: ['M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Z', 'M8 7.2v3.5M8 5.2h.01'],
  about: ['M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Z', 'M8 7.2v3.5M8 5.2h.01'],
  products: ['M3 5.5 8 2l5 3.5v5L8 14l-5-3.5v-5Z', 'M8 14V8.8M3.3 5.7 8 8.8l4.7-3.1'],
  wallet: ['M3 4h10v8H3z', 'M10.5 8h2.5'],
  bankAccount: ['M3 4h10v8H3V4Z', 'M3 6.5h10M5 10h2.5'],
  drafts: ['M4 2.5h8v11l-4-2-4 2v-11Z'],
  subscriptions: ['M3 4h10v8H3z', 'M5 7h6M5 10h3'],
  autoReplies: ['M3 4h10v7H6l-3 3V4Z', 'M6 7h4M6 9.5h3'],
  location: ['M8 14s4-3.6 4-7A4 4 0 0 0 4 7c0 3.4 4 7 4 7Z', 'M8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'],
  data: ['M4 3h8v10H4z', 'M6 6h4M6 8.5h4M6 11h2'],
  logout: ['M7 13H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3', 'M10 5l3 3-3 3M13 8H6'],
}

const iconPaths = computed(() => paths[props.name] ?? paths.overview)
</script>

<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      v-for="path in iconPaths"
      :key="path"
      :d="path"
      stroke="currentColor"
      stroke-width="1.3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
