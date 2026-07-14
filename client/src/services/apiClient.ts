import { API_BASE_URL } from './authApi'
import { getSavedToken } from './sessionStorage'

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getSavedToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed')
  }

  return data as T
}
