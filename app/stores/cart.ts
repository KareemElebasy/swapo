import { defineStore } from 'pinia'
import type { ApiCart } from '~/types/api-cart'
import { apiFetch } from '~/composables/useApi'

interface CartState {
  cart: ApiCart | null
  open: boolean
  loading: boolean
  actionLoading: boolean
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    cart: null,
    open: false,
    loading: false,
    actionLoading: false,
  }),

  getters: {
    totalItems: (state): number => state.cart?.total_quantity ?? 0,
    totalPrice: (state): number => state.cart?.cart_total ?? 0,
  },

  actions: {
    async fetchCart() {
      this.loading = true
      try {
        const response = await apiFetch<{ data: ApiCart }>('cart')
        this.cart = response.data
      } finally {
        this.loading = false
      }
    },

    async addToCart(productId: number, quantity: number = 1) {
      this.actionLoading = true
      try {
        await apiFetch('cart', {
          method: 'POST',
          body: { product_id: productId, quantity },
        })
        await this.fetchCart()
      } finally {
        this.actionLoading = false
      }
    },

    async updateCartItem(cartItemId: number, quantity: number) {
      this.actionLoading = true
      try {
        await apiFetch(`cart/update/${cartItemId}`, {
          method: 'PATCH',
          body: { quantity },
        })
        await this.fetchCart()
      } finally {
        this.actionLoading = false
      }
    },

    async deleteCartItem(cartItemId: number) {
      this.actionLoading = true
      try {
        await apiFetch('cart/delete', {
          method: 'DELETE',
          body: { cart_items_id: [cartItemId] },
        })
        await this.fetchCart()
      } finally {
        this.actionLoading = false
      }
    },

    openCart() {
      this.open = true
    },

    closeCart() {
      this.open = false
    },
  },
})
