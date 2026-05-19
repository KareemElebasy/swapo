import { defineStore } from 'pinia'
import type { ApiProductListItem, ApiProductDetail, ProductFilters } from '~/types/api-product'
import { apiFetch } from '~/composables/useApi'

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface ProductState {
  products: ApiProductListItem[]
  currentProduct: ApiProductDetail | null
  pagination: PaginationMeta | null
  priceRange: { min: number; max: number }
  loading: boolean
  detailLoading: boolean
  error: string | null
}

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    products: [],
    currentProduct: null,
    pagination: null,
    priceRange: { min: 0, max: 10000 },
    loading: false,
    detailLoading: false,
    error: null,
  }),

  actions: {
    async fetchProducts(params: ProductFilters = {}, append = false) {
      this.loading = true
      this.error = null
      if (!append) this.products = []
      try {
        const response = await apiFetch<{
          data: ApiProductListItem[]
          meta: PaginationMeta
          min_price: number
          max_price: number
        }>('product', { query: params as Record<string, unknown> })

        this.products = append ? [...this.products, ...response.data] : response.data
        this.pagination = response.meta
        if (!append) {
          this.priceRange = { min: response.min_price, max: response.max_price }
        }
      } catch {
        this.error = 'load_error'
      } finally {
        this.loading = false
      }
    },

    async fetchProductDetail(id: number | string) {
      this.detailLoading = true
      this.error = null
      try {
        const response = await apiFetch<{ data: ApiProductDetail }>(`product/${id}`)
        this.currentProduct = response.data
      } catch {
        this.error = 'load_error'
        this.currentProduct = null
      } finally {
        this.detailLoading = false
      }
    },

    async toggleFavorite(productId: number) {
      const listProduct = this.products.find(p => p.id === productId)
      const inDetail = this.currentProduct?.id === productId

      if (listProduct) listProduct.is_favorite = !listProduct.is_favorite
      if (inDetail && this.currentProduct) this.currentProduct.is_favorite = !this.currentProduct.is_favorite

      try {
        await apiFetch(`favorite/${productId}`, { method: 'POST' })
      } catch {
        // revert on error
        if (listProduct) listProduct.is_favorite = !listProduct.is_favorite
        if (inDetail && this.currentProduct) this.currentProduct.is_favorite = !this.currentProduct.is_favorite
      }
    },
  },
})
