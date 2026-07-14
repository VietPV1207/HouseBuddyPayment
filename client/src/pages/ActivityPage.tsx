import { useEffect, useState } from 'react'
import { BottomNav } from '../components/ui/BottomNav'
import type { BottomNavTab } from '../components/ui/BottomNav'
import { MaterialIcon } from '../components/ui/MaterialIcon'
import { getCustomerBookings } from '../services/bookingApi'
import { getBookingStatusMeta } from '../utils/bookingStatus'
import { formatCurrency } from '../utils/currency'
import type { ApiBooking } from '../types/booking'
import type { BookingStatusTone } from '../utils/bookingStatus'

type ActivityPageProps = {
  onNavigate: (tab: BottomNavTab) => void
  onOpenBooking: (booking: ApiBooking) => void
}

const toneBadgeClasses: Record<BookingStatusTone, string> = {
  primary: 'bg-primary-container/15 text-primary',
  warning: 'bg-secondary-container/20 text-secondary',
  neutral: 'bg-surface-container-high text-on-surface-variant',
  error: 'bg-error-container/50 text-on-error-container',
}

function formatSchedule(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ActivityPage({ onNavigate, onOpenBooking }: ActivityPageProps) {
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    getCustomerBookings()
      .then((data) => {
        if (!cancelled) setBookings(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-dvh bg-background pb-24 text-on-surface">
      <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-surface px-margin-mobile">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          Hoạt động
        </h1>
        <MaterialIcon name="favorite" className="text-primary" />
      </header>

      <main className="px-margin-mobile pt-4">
        {error && (
          <p className="mb-4 rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-28 animate-pulse rounded-2xl bg-surface-container-lowest" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-container-high">
              <MaterialIcon name="assignment" className="text-4xl text-outline" />
            </div>
            <p className="text-body-md text-on-surface-variant">
              Bạn chưa có đơn dịch vụ nào.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="font-bold text-label-md text-primary"
            >
              Khám phá dịch vụ
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusMeta = getBookingStatusMeta(booking.status)
              const needsPayment = ['COMPLETED', 'AWAITING_PAYMENT'].includes(booking.status)
              return (
                <button
                  key={booking._id}
                  type="button"
                  onClick={() => onOpenBooking(booking)}
                  className={`w-full rounded-2xl border bg-surface-container-lowest p-4 text-left shadow-[0_4px_20px_rgba(17,24,39,0.06)] transition-transform active:scale-[0.99] ${
                    needsPayment ? 'border-secondary-container' : 'border-outline-variant/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-body-md text-on-surface">
                        {booking.serviceSnapshot?.name || 'Dịch vụ HouseBuddy'}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-label-sm text-on-surface-variant">
                        <MaterialIcon name="event" className="text-[16px]" />
                        {formatSchedule(booking.scheduledTime)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 font-label-sm text-label-sm font-bold ${toneBadgeClasses[statusMeta.tone]}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  {booking.address?.street && (
                    <p className="mt-2 flex items-center gap-1 text-label-sm text-on-surface-variant">
                      <MaterialIcon name="location_on" className="text-[16px]" />
                      <span className="truncate">
                        {[booking.address.street, booking.address.district, booking.address.city]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-outline-variant/20 pt-3">
                    {needsPayment ? (
                      <span className="flex items-center gap-1 font-bold text-label-sm text-secondary">
                        <MaterialIcon name="payments" className="text-[16px]" />
                        Chờ thanh toán
                      </span>
                    ) : (
                      <span className="text-label-sm text-on-surface-variant">
                        {booking.duration} giờ
                      </span>
                    )}
                    <span className="font-bold text-body-md text-primary">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav active="orders" onChange={onNavigate} />
    </div>
  )
}
