export type BookingStatusTone = 'primary' | 'warning' | 'neutral' | 'error'

const statusMeta: Record<string, { label: string; tone: BookingStatusTone }> = {
  DRAFT: { label: 'Nháp', tone: 'neutral' },
  PENDING: { label: 'Đang tìm người giúp việc', tone: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'primary' },
  IN_PROGRESS: { label: 'Đang thực hiện', tone: 'primary' },
  PAUSED: { label: 'Tạm dừng', tone: 'neutral' },
  COMPLETED: { label: 'Đã hoàn thành', tone: 'primary' },
  AWAITING_PAYMENT: { label: 'Chờ thanh toán', tone: 'warning' },
  PAID: { label: 'Đã thanh toán', tone: 'primary' },
  FINISHED: { label: 'Hoàn tất', tone: 'primary' },
  REVIEWED: { label: 'Đã đánh giá', tone: 'neutral' },
  CANCELLED: { label: 'Đã hủy', tone: 'error' },
}

export function getBookingStatusMeta(status: string) {
  return statusMeta[status] || { label: status, tone: 'neutral' as BookingStatusTone }
}

export function formatBookingStatus(status: string) {
  return getBookingStatusMeta(status).label
}
