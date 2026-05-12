<script setup lang="ts">
definePageMeta({
  layout: "public",
});

const route = useRoute();

const categoryId = computed(() => {
  const value = route.params.categoryId;
  return Array.isArray(value) ? value[0] : value;
});
</script>

<template>
  <SharedCatalogProductListingView :category-id="categoryId" />
</template>
