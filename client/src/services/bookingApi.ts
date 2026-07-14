import type { ApiBooking, CreateBookingPayload } from '../types/booking'
import { apiRequest } from './apiClient'

type CreateBookingResponse = {
  message: string
  booking: ApiBooking
}

type MessageResponse = {
  message: string
}

export function createBooking(payload: CreateBookingPayload) {
  return apiRequest<CreateBookingResponse>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCustomerBookings() {
  return apiRequest<ApiBooking[]>('/api/bookings/customer/me')
}

export function payBooking(bookingId: string) {
  return apiRequest<CreateBookingResponse>(`/api/bookings/customer/${bookingId}/pay`, {
    method: 'PUT',
  })
}

export function reviewBooking(bookingId: string, rating: number, comment?: string) {
  return apiRequest<{ message: string }>(`/api/bookings/customer/${bookingId}/review`, {
    method: 'POST', body: JSON.stringify({ rating, comment }),
  })
}

export function getHelperOffers() {
  return apiRequest<ApiBooking[]>('/api/bookings/helper/offers')
}

export function getHelperJobs() {
  return apiRequest<ApiBooking[]>('/api/bookings/helper/jobs')
}

export function acceptOffer(bookingId: string) {
  return apiRequest<CreateBookingResponse>(
    `/api/bookings/helper/offers/${bookingId}/accept`,
    { method: 'PUT' },
  )
}

export function rejectOffer(bookingId: string) {
  return apiRequest<MessageResponse>(
    `/api/bookings/helper/offers/${bookingId}/reject`,
    { method: 'PUT' },
  )
}

export function startJob(bookingId: string) {
  return apiRequest<CreateBookingResponse>(`/api/bookings/helper/jobs/${bookingId}/start`, {
    method: 'PUT',
  })
}

export function completeJob(bookingId: string, completionNote?: string) {
  return apiRequest<CreateBookingResponse>(`/api/bookings/helper/jobs/${bookingId}/complete`, {
    method: 'PUT',
    body: JSON.stringify({ completionNote }),
  })
}
