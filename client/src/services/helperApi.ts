import type { HelperProfile } from '../types/helper'
import { apiRequest } from './apiClient'

type UpdateHelperResponse = { message: string; profile: HelperProfile }

export function getHelperProfile(userId: string) {
  return apiRequest<HelperProfile>(`/api/helper/${userId}`)
}

export function updateHelperWorkStatus(userId: string, workStatus: 'available' | 'offline') {
  return apiRequest<UpdateHelperResponse>(`/api/helper/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ workStatus }),
  })
}
