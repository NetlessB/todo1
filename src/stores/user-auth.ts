/**
 * Pinia store: user-auth
 * Stores three strings: userJson, username, password
 */

import { defineStore } from 'pinia'

export interface UserAuthState {
  userJson: string
  username: string
  password: string
}

export const useUserAuthStore = defineStore('user-auth', {
  state: (): UserAuthState => ({
    userJson: '',
    username: '',
    password: '',
  }),
  actions: {
    setUserJson(value: string) { this.userJson = value },
    setUsername(value: string) { this.username = value },
    setPassword(value: string) { this.password = value },
    clear() { this.userJson = ''; this.username = ''; this.password = ''; },
  },
})
