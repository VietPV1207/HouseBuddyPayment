import type { ApiNotification } from '../types/notification'
import { apiRequest } from './apiClient'

type MessageResponse = { message: string }

export function getNotifications() {
  return apiRequest<ApiNotification[]>('/api/notifications')
}

export function markNotificationRead(notificationId: string) {
  return apiRequest<MessageResponse>(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
  })
}

export function markAllNotificationsRead() {
  return apiRequest<MessageResponse>('/api/notifications/read-all', {
    method: 'PUT',
  })
}
