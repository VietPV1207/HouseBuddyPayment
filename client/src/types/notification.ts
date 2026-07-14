export type NotificationType =
  | 'booking'
  | 'payment'
  | 'schedule'
  | 'reminder'
  | 'support'
  | 'promotion'
  | 'system'

export type ApiNotification = {
  _id: string
  type: NotificationType
  title: string
  message: string
  relatedBookingId?: string | null
  isRead: boolean
  createdAt: string
}
