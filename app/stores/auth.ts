import { defineStore } from 'pinia'
import type { User } from '~/types/user'

interface AuthState {
  token: string
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: '',
    user: null,
  }),
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setUser(user: User | null) {
      this.user = user
    },
    logout() {
      this.token = ''
      this.user = null
    },
  },
})
