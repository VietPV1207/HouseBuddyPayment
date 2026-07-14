import type { ApiNotification, NotificationType } from '../types/notification'

export type NotificationTone = 'warning' | 'success' | 'neutral' | 'danger'

type NotificationDisplay = {
  icon: string
  tone: NotificationTone
  tag: string
}

const typeDisplay: Record<NotificationType, NotificationDisplay> = {
  booking: { icon: 'task_alt', tone: 'success', tag: 'Đặt lịch' },
  payment: { icon: 'payments', tone: 'warning', tag: 'Thanh toán' },
  schedule: { icon: 'event', tone: 'neutral', tag: 'Lịch hẹn' },
  reminder: { icon: 'schedule', tone: 'neutral', tag: 'Nhắc nhở' },
  support: { icon: 'gavel', tone: 'danger', tag: 'Hỗ trợ' },
  promotion: { icon: 'star', tone: 'warning', tag: 'Ưu đãi' },
  system: { icon: 'notifications', tone: 'neutral', tag: 'Hệ thống' },
}

export function getNotificationDisplay(type: NotificationType): NotificationDisplay {
  return typeDisplay[type] || typeDisplay.system
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function getNotificationGroup(createdAt: string): string {
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return 'Trước đó'

  const today = startOfDay(new Date())
  const createdDay = startOfDay(created)
  const dayMs = 24 * 60 * 60 * 1000

  if (createdDay === today) return 'Hôm nay'
  if (createdDay === today - dayMs) return 'Hôm qua'
  return created.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatNotificationTime(createdAt: string): string {
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return ''

  const group = getNotificationGroup(createdAt)
  const time = created.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  return group === 'Hôm nay' ? time : `${group}, ${time}`
}

export function groupNotifications(notifications: ApiNotification[]) {
  const groups = new Map<string, ApiNotification[]>()
  for (const item of notifications) {
    const group = getNotificationGroup(item.createdAt)
    const bucket = groups.get(group)
    if (bucket) {
      bucket.push(item)
    } else {
      groups.set(group, [item])
    }
  }
  return Array.from(groups.entries()).map(([group, items]) => ({ group, items }))
}
