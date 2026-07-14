import type { AuthSession, AuthUser } from '../types/auth'

const TOKEN_KEY = 'housebuddy_token'
const USER_KEY = 'housebuddy_user'

export function getSavedUser() {
  const saved = localStorage.getItem(USER_KEY)
  return saved ? (JSON.parse(saved) as AuthUser) : undefined
}

export function getSavedSession(): AuthSession | undefined {
  const user = getSavedUser()
  const token = localStorage.getItem(TOKEN_KEY) || undefined

  return user ? { token, user } : undefined
}

export function getSavedToken() {
  return localStorage.getItem(TOKEN_KEY) || undefined
}

export function saveSession(token?: string, user?: AuthUser) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
