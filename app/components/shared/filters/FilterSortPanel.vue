<script setup lang="ts">
import type { FilterPrimitive, FilterSection, FilterSortValue, FilterValue, SortOption } from '~/types/filter'

interface Props {
  modelValue: FilterSortValue
  sections?: FilterSection[]
  sortOptions?: SortOption[]
  title?: string
  resetLabel?: string
  applyLabel?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  sortOptions: () => [],
  title: undefined,
  resetLabel: undefined,
  applyLabel: undefined,
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: FilterSortValue]
  apply: []
  reset: []
}>()

const { t } = useI18n()

function updateValue(value: FilterSortValue) {
  emit('update:modelValue', value)
}

function updateFilter(key: string, value: FilterSortValue['filters'][string]) {
  updateValue({
    ...props.modelValue,
    filters: {
      ...props.modelValue.filters,
      [key]: value,
    },
  })
}

function setSort(value: string | number) {
  updateValue({
    ...props.modelValue,
    sort: value,
  })
}

function isSelected(section: FilterSection, value: FilterPrimitive) {
  const current = props.modelValue.filters[section.key]

  if (Array.isArray(current)) {
    return current.includes(value)
  }

  return current === value
}

function selectSingle(section: FilterSection, value: FilterPrimitive) {
  updateFilter(section.key, value)
}

function toggleMulti(section: FilterSection, value: FilterPrimitive) {
  const current = props.modelValue.filters[section.key]
  const values = Array.isArray(current) ? [...current] : []
  const index = values.indexOf(value)

  if (index >= 0) values.splice(index, 1)
  else values.push(value)

  updateFilter(section.key, values)
}

function priceValue(section: FilterSection, side: 'min' | 'max') {
  const current = props.modelValue.filters[section.key]
  if (!current || Array.isArray(current) || typeof current !== 'object') return ''
  return current[side] ?? ''
}

function updatePrice(section: FilterSection, side: 'min' | 'max', value: string) {
  const current = props.modelValue.filters[section.key]
  const next = !current || Array.isArray(current) || typeof current !== 'object'
    ? {}
    : { ...current }

  const numeric = value === '' ? undefined : Number(value)
  next[side] = Number.isFinite(numeric) ? numeric : undefined
  updateFilter(section.key, next)
}

function slotUpdate(section: FilterSection) {
  return (value: FilterValue) => updateFilter(section.key, value)
}

function ratingOptions(section: FilterSection) {
  if (section.options?.length) return section.options
  return [1, 2, 3, 4, 5].map((value) => ({ label: String(value), value }))
}
</script>

<template>
  <section class="flex h-full w-full flex-col bg-white">
    <div v-if="title" class="border-b border-grey-normal px-4 py-4">
      <h2 class="text-lg font-medium text-black-normal">{{ title }}</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-3">
      <details
        v-if="sortOptions.length"
        open
        class="mb-4 rounded-sm bg-grey-light-active p-3"
      >
        <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-bold text-black-normal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ t('filters.sort') }}</span>
        </summary>

        <div class="mt-2 border-t border-grey-normal-hover">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            class="flex min-h-[52px] w-full items-center justify-between gap-3 px-1 py-4 text-end text-base text-[#3B3D3F] transition-colors hover:text-blue-normal"
            @click="setSort(option.value)"
          >
            <span class="flex size-5 items-center justify-center text-brand-cyan">
              <svg v-if="modelValue.sort === option.value" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="m3.5 8 3 3 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
          </button>
        </div>
      </details>

      <details
        v-for="section in sections"
        :key="section.key"
        :open="!section.collapsed"
        class="mb-4 rounded-sm bg-grey-light-active p-3"
      >
        <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-bold text-black-normal">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ section.title }}</span>
        </summary>

        <div class="mt-2 border-t border-grey-normal-hover">
          <slot
            v-if="section.type === 'custom'"
            name="section"
            :section="section"
            :value="modelValue.filters[section.key]"
            :update="slotUpdate(section)"
          />

          <div v-else-if="section.type === 'price'" class="flex flex-col gap-4 p-4">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-2 text-end text-base text-[#3B3D3F]">
                <span>{{ t('filters.max') }}</span>
                <input
                  :value="priceValue(section, 'max')"
                  type="number"
                  :min="section.min"
                  :max="section.max"
                  :step="section.step ?? 1"
                  class="h-8 border-b border-brand-cyan bg-grey-normal px-2 text-sm text-black-normal outline-none"
                  @input="updatePrice(section, 'max', ($event.target as HTMLInputElement).value)"
                >
              </label>
              <label class="flex flex-col gap-2 text-end text-base text-[#3B3D3F]">
                <span>{{ t('filters.min') }}</span>
                <input
                  :value="priceValue(section, 'min')"
                  type="number"
                  :min="section.min"
                  :max="section.max"
                  :step="section.step ?? 1"
                  class="h-8 border-b border-brand-cyan bg-grey-normal px-2 text-sm text-black-normal outline-none"
                  @input="updatePrice(section, 'min', ($event.target as HTMLInputElement).value)"
                >
              </label>
            </div>
          </div>

          <div v-else-if="section.type === 'rating'" class="flex flex-col gap-3 p-4">
            <p class="text-end text-base text-[#3B3D3F]">{{ t('filters.rating') }}</p>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="option in ratingOptions(section)"
                :key="option.value"
                type="button"
                :class="[
                  'flex h-8 items-center justify-center gap-1 rounded-sm border px-2 text-sm text-blue-normal transition-colors',
                  isSelected(section, option.value)
                    ? 'border-brand-cyan-light-active bg-brand-cyan-light-active'
                    : 'border-grey-normal-hover bg-white hover:bg-grey-normal',
                ]"
                @click="selectSingle(section, option.value)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="m7 1.5 1.55 3.15 3.48.5-2.52 2.46.6 3.46L7 9.43 3.89 11.07l.6-3.46-2.52-2.45 3.48-.51L7 1.5Z" />
                </svg>
                <span>{{ option.label }}</span>
              </button>
            </div>
          </div>

          <div v-else class="flex flex-col">
            <button
              v-for="option in section.options"
              :key="option.value"
              type="button"
              class="flex min-h-[52px] w-full items-center justify-between gap-3 px-1 py-4 text-end text-base text-[#3B3D3F] transition-colors hover:text-blue-normal"
              @click="section.type === 'multi' ? toggleMulti(section, option.value) : selectSingle(section, option.value)"
            >
              <span class="flex size-5 items-center justify-center text-brand-cyan">
                <svg v-if="isSelected(section, option.value)" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="m3.5 8 3 3 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="min-w-0 flex-1 truncate">
                {{ option.label }}
                <span v-if="option.count !== undefined" class="text-grey-dark-active">({{ option.count }})</span>
              </span>
            </button>
          </div>
        </div>
      </details>
    </div>

    <div class="grid grid-cols-2 gap-3 border-t border-grey-normal p-4">
      <BaseButton variant="secondary" full-width :disabled="loading" @click="emit('reset')">
        {{ resetLabel ?? t('filters.reset') }}
      </BaseButton>
      <BaseButton full-width :loading="loading" @click="emit('apply')">
        {{ applyLabel ?? t('filters.apply') }}
      </BaseButton>
    </div>
  </section>
</template>
