export type FilterPrimitive = string | number | boolean

export type FilterValue =
  | FilterPrimitive
  | FilterPrimitive[]
  | {
      min?: number
      max?: number
    }
  | null
  | undefined

export interface FilterSortValue {
  sort?: string | number
  filters: Record<string, FilterValue>
}

export interface FilterOption {
  label: string
  value: string | number
  count?: number
}

export interface SortOption extends FilterOption {}

export interface FilterSection {
  key: string
  title: string
  type?: 'single' | 'multi' | 'price' | 'rating' | 'custom'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  collapsed?: boolean
}
