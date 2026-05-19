import { defineStore } from 'pinia'
import type { ApiNegotiationListItem, ApiNegotiationDetail } from '~/types/api-negotiation'
import { apiFetch } from '~/composables/useApi'

interface DrawerProduct {
  id: number
  product_name: string
  price: number
  cover: string | null
  seller_name: string
}

interface NegotiationState {
  negotiations: ApiNegotiationListItem[]
  currentNegotiation: ApiNegotiationDetail | null
  loading: boolean
  detailLoading: boolean
  actionLoading: boolean
  drawerOpen: boolean
  drawerView: 'offer' | 'chat'
  drawerProduct: DrawerProduct | null
}

export const useNegotiationStore = defineStore('negotiation', {
  state: (): NegotiationState => ({
    negotiations: [],
    currentNegotiation: null,
    loading: false,
    detailLoading: false,
    actionLoading: false,
    drawerOpen: false,
    drawerView: 'offer',
    drawerProduct: null,
  }),

  actions: {
    async fetchNegotiations(role: 'buyer' | 'seller', status?: string) {
      this.loading = true
      try {
        const response = await apiFetch<{ data: ApiNegotiationListItem[] }>('negotiation', {
          query: { role, ...(status ? { status } : {}) },
        })
        this.negotiations = response.data
      } finally {
        this.loading = false
      }
    },

    async fetchNegotiation(id: number | string) {
      this.detailLoading = true
      try {
        const response = await apiFetch<{ data: ApiNegotiationDetail }>(`negotiation/${id}`)
        this.currentNegotiation = response.data
      } finally {
        this.detailLoading = false
      }
    },

    async startNegotiation(productId: number, price: number) {
      this.actionLoading = true
      try {
        return await apiFetch<{ data: { id: number } }>('negotiation', {
          method: 'POST',
          body: { product_id: productId, price },
        })
      } finally {
        this.actionLoading = false
      }
    },

    async sendOffer(negotiationId: number | string, price: number) {
      this.actionLoading = true
      try {
        const result = await apiFetch(`negotiation/${negotiationId}/offers`, {
          method: 'POST',
          body: { price },
        })
        await this.fetchNegotiation(negotiationId)
        return result
      } finally {
        this.actionLoading = false
      }
    },

    async sendMessage(negotiationId: number | string, message: string) {
      this.actionLoading = true
      try {
        const result = await apiFetch(`negotiation/${negotiationId}/messages`, {
          method: 'POST',
          body: { message },
        })
        await this.fetchNegotiation(negotiationId)
        return result
      } finally {
        this.actionLoading = false
      }
    },

    async acceptOffer(negotiationId: number | string, offerId: number) {
      this.actionLoading = true
      try {
        const result = await apiFetch(
          `negotiation/${negotiationId}/accept/${offerId}`,
          { method: 'POST' },
        )
        await this.fetchNegotiation(negotiationId)
        return result
      } finally {
        this.actionLoading = false
      }
    },

    async rejectOffer(negotiationId: number | string, offerId: number) {
      this.actionLoading = true
      try {
        const result = await apiFetch(
          `negotiation/${negotiationId}/reject/${offerId}`,
          { method: 'POST' },
        )
        await this.fetchNegotiation(negotiationId)
        return result
      } finally {
        this.actionLoading = false
      }
    },

    async cancelOffer(negotiationId: number | string, offerId: number) {
      this.actionLoading = true
      try {
        const result = await apiFetch(
          `negotiation/${negotiationId}/cancel/${offerId}`,
          { method: 'POST' },
        )
        await this.fetchNegotiation(negotiationId)
        return result
      } finally {
        this.actionLoading = false
      }
    },

    openNewOfferDrawer(product: { id: number; product_name: string; price: number; cover: string; seller_data: { store_name: string } }) {
      this.currentNegotiation = null
      this.drawerProduct = {
        id: product.id,
        product_name: product.product_name,
        price: product.price,
        cover: product.cover ?? null,
        seller_name: product.seller_data.store_name,
      }
      this.drawerView = 'offer'
      this.drawerOpen = true
    },

    async openChatDrawer(product: { id: number; product_name: string; price: number; cover: string; seller_data: { store_name: string } }) {
      this.drawerProduct = {
        id: product.id,
        product_name: product.product_name,
        price: product.price,
        cover: product.cover ?? null,
        seller_name: product.seller_data.store_name,
      }
      this.drawerView = 'chat'
      this.drawerOpen = true
      this.detailLoading = true
      try {
        const response = await apiFetch<{ data: ApiNegotiationListItem[] }>('negotiation', {
          query: { role: 'buyer' },
        })
        const found = response.data.find(n => n.product_data.id === product.id)
        if (found) {
          const detail = await apiFetch<{ data: ApiNegotiationDetail }>(`negotiation/${found.id}`)
          this.currentNegotiation = detail.data
        }
      } finally {
        this.detailLoading = false
      }
    },

    async openDrawerFromListItem(item: ApiNegotiationListItem) {
      this.drawerProduct = {
        id: item.product_data.id,
        product_name: item.product_data.product_name,
        price: item.product_data.price,
        cover: item.product_data.cover ?? null,
        seller_name: item.seller_data.store_name ?? item.seller_data.full_name,
      }
      this.drawerView = 'chat'
      this.drawerOpen = true
      this.detailLoading = true
      try {
        const detail = await apiFetch<{ data: ApiNegotiationDetail }>(`negotiation/${item.id}`)
        this.currentNegotiation = detail.data
      } finally {
        this.detailLoading = false
      }
    },

    closeDrawer() {
      this.drawerOpen = false
    },

    switchDrawerView(view: 'offer' | 'chat') {
      this.drawerView = view
    },
  },
})
