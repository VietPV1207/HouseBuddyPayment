import type { ApiService } from '../types/booking'
import { apiRequest } from './apiClient'

export function getServices() {
  return apiRequest<ApiService[]>('/api/bookings/services')
}
