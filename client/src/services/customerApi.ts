import type { CustomerClaim, CustomerProfile, SavedAddress } from '../types/customer'
import { apiRequest } from './apiClient'

type MessageResponse = { message: string }
type AddressResponse = { message: string; address: SavedAddress }

export function getCustomerProfile(userId: string) {
  return apiRequest<CustomerProfile>(`/api/customer/${userId}`)
}

export function updateCustomerProfile(
  userId: string,
  profile: Pick<CustomerProfile, 'fullName' | 'email' | 'gender' | 'age' | 'avatarUrl'>,
) {
  return apiRequest<{ message: string; profile: CustomerProfile }>(`/api/customer/${userId}`, {
    method: 'PUT', body: JSON.stringify(profile),
  })
}

export function getMyClaims() {
  return apiRequest<CustomerClaim[]>('/api/customer/me/claims')
}

export function createClaim(payload: { bookingId: string; reason: string; description: string; evidenceUrls?: string[] }) {
  return apiRequest<{ message: string; claim: CustomerClaim }>('/api/customer/me/claims', {
    method: 'POST', body: JSON.stringify(payload),
  })
}

export function addSavedAddress(userId: string, address: SavedAddress) {
  return apiRequest<AddressResponse>(`/api/customer/${userId}/addresses`, {
    method: 'POST',
    body: JSON.stringify({ address }),
  })
}

export function editSavedAddress(
  userId: string,
  addressIndex: number,
  address: SavedAddress,
) {
  return apiRequest<AddressResponse>(
    `/api/customer/${userId}/addresses/${addressIndex}`,
    {
      method: 'PUT',
      body: JSON.stringify({ address }),
    },
  )
}

export function deleteSavedAddress(userId: string, addressIndex: number) {
  return apiRequest<MessageResponse>(
    `/api/customer/${userId}/addresses/${addressIndex}`,
    { method: 'DELETE' },
  )
}
