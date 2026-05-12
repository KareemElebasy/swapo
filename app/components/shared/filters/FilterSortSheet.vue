<script setup lang="ts">
import type { FilterPrimitive, FilterSortValue } from '~/types/filter'
import type { FilterSection, SortOption } from '~/types/filter'

type SheetMode = 'responsive' | 'desktop' | 'drawer'

interface Props {
  open?: boolean
  modelValue?: FilterSortValue
  sections?: FilterSection[]
  sortOptions?: SortOption[]
  title?: string
  mode?: SheetMode
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  modelValue: () => ({ filters: {} }),
  sections: () => [],
  sortOptions: () => [],
  title: undefined,
  mode: 'responsive',
  loading: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:modelValue': [value: FilterSortValue]
  apply: [value: FilterSortValue]
  reset: []
}>()

const { t } = useI18n()

const draft = ref<FilterSortValue>(cloneValue(props.modelValue))

watch(
  () => props.modelValue,
  (value) => {
    draft.value = cloneValue(value)
  },
  { deep: true },
)

watch(
  () => props.open,
  (open) => {
    if (open) draft.value = cloneValue(props.modelValue)
  },
)

function cloneFilterValue(value: FilterSortValue['filters'][string]) {
  if (Array.isArray(value)) return [...value] as FilterPrimitive[]
  if (value && typeof value === 'object') return { ...value }
  return value
}

function cloneValue(value: FilterSortValue): FilterSortValue {
  return {
    sort: value.sort,
    filters: Object.fromEntries(
      Object.entries(value.filters ?? {}).map(([key, filterValue]) => [
        key,
        cloneFilterValue(filterValue),
      ]),
    ),
  }
}

function close() {
  emit('update:open', false)
}

function apply() {
  const value = cloneValue(draft.value)
  emit('update:modelValue', value)
  emit('apply', value)
  close()
}

function reset() {
  draft.value = { filters: {} }
  emit('reset')
}
</script>

<template>
  <aside
    v-if="mode !== 'drawer'"
    :class="[
      'w-full max-w-[334px] shrink-0',
      mode === 'responsive' ? 'hidden md:block' : '',
    ]"
  >
    <FilterSortPanel
      v-model="draft"
      :sections="sections"
      :sort-options="sortOptions"
      :title="title"
      :loading="loading"
      @apply="apply"
      @reset="reset"
    >
      <template #section="slotProps">
        <slot name="section" v-bind="slotProps" />
      </template>
    </FilterSortPanel>
  </aside>

  <BaseDrawer
    v-if="mode !== 'desktop'"
    :open="open"
    side="bottom"
    :title="title ?? t('filters.title')"
    :close-label="t('common.close')"
    body-class="p-0"
    footer-class="hidden"
    @update:open="emit('update:open', $event)"
  >
    <FilterSortPanel
      v-model="draft"
      :sections="sections"
      :sort-options="sortOptions"
      :loading="loading"
      @apply="apply"
      @reset="reset"
    >
      <template #section="slotProps">
        <slot name="section" v-bind="slotProps" />
      </template>
    </FilterSortPanel>
  </BaseDrawer>
</template>
