import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { MaterialIcon } from '../components/ui/MaterialIcon'
import { TopAppBar } from '../components/ui/TopAppBar'
import { getBookingStatusMeta } from '../utils/bookingStatus'
import { formatCurrency } from '../utils/currency'
import { getServiceIcon } from '../utils/serviceIcon'
import type { ApiBooking } from '../types/booking'
import type { BookingStatusTone } from '../utils/bookingStatus'
import { reviewBooking } from '../services/bookingApi'

type BookingDetailPageProps = {
  booking: ApiBooking
  onBack: () => void
  onPay: (booking: ApiBooking) => void
}

const toneBadgeClasses: Record<BookingStatusTone, string> = {
  primary: 'bg-primary-container/15 text-primary',
  warning: 'bg-secondary-container/20 text-secondary',
  neutral: 'bg-surface-container-high text-on-surface-variant',
  error: 'bg-error-container/50 text-on-error-container',
}

const steps = [
  { label: 'Đã đặt', statuses: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'AWAITING_PAYMENT', 'PAID', 'REVIEWED'] },
  { label: 'Đã nhận', statuses: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'AWAITING_PAYMENT', 'PAID', 'REVIEWED'] },
  { label: 'Thực hiện', statuses: ['IN_PROGRESS', 'COMPLETED', 'AWAITING_PAYMENT', 'PAID', 'REVIEWED'] },
  { label: 'Hoàn thành', statuses: ['COMPLETED', 'AWAITING_PAYMENT', 'PAID', 'REVIEWED'] },
  { label: 'Thanh toán', statuses: ['PAID', 'REVIEWED'] },
]

function formatSchedule(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BookingDetailPage({ booking, onBack, onPay }: BookingDetailPageProps) {
  const [showHelper, setShowHelper] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const statusMeta = getBookingStatusMeta(booking.status)
  const orderCode = `#HB-${booking._id.slice(-6).toUpperCase()}`
  const activeStepIndex = steps.reduce(
    (acc, step, index) => (step.statuses.includes(booking.status) ? index : acc),
    0,
  )
  const address = [
    booking.address?.street,
    booking.address?.ward,
    booking.address?.district,
    booking.address?.city,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="min-h-dvh bg-background pb-32 text-on-surface">
      <TopAppBar title="Chi tiết đơn" onBack={onBack} centered />

      <main className="mx-auto w-full max-w-md space-y-4 px-margin-mobile pt-4">
        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-[0px_4px_20px_rgba(17,24,39,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
              {orderCode}
            </span>
            <span
              className={`rounded-full px-3 py-1 font-label-sm text-label-sm font-bold ${toneBadgeClasses[statusMeta.tone]}`}
            >
              {statusMeta.label}
            </span>
          </div>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`h-3 w-3 rounded-full ${
                    index <= activeStepIndex ? 'bg-primary ring-4 ring-primary/15' : 'bg-surface-variant'
                  }`}
                />
                <span
                  className={`text-center text-[10px] font-semibold ${index <= activeStepIndex ? 'text-primary' : 'text-outline'}`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-[0px_4px_20px_rgba(17,24,39,0.06)]">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-surface-container p-2">
              <MaterialIcon
                name={getServiceIcon(booking.serviceSnapshot?.category)}
                className="text-primary"
              />
            </div>
            <div>
              <h3 className="font-bold text-body-lg text-on-surface">
                {booking.serviceSnapshot?.name || 'Dịch vụ HouseBuddy'}
              </h3>
              <p className="text-body-md text-on-surface-variant">{booking.duration} giờ</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t border-surface-variant pt-3">
            <div className="rounded-lg bg-surface-container p-2">
              <MaterialIcon name="event" className="text-primary" />
            </div>
            <p className="font-body-md text-body-md text-on-surface">
              {formatSchedule(booking.scheduledTime)}
            </p>
          </div>
          <div className="flex items-start gap-3 border-t border-surface-variant pt-3">
            <div className="rounded-lg bg-surface-container p-2">
              <MaterialIcon name="location_on" className="text-primary" />
            </div>
            <p className="font-body-md text-body-md text-on-surface">{address}</p>
          </div>
        </section>

        {booking.helperId && booking.helperName && (
          <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-[0px_4px_20px_rgba(17,24,39,0.06)]">
            <button type="button" onClick={() => setShowHelper((value) => !value)} className="flex w-full items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/10">
                <MaterialIcon name="person" className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-body-md text-on-surface">{booking.helperName}</p>
                {typeof booking.helperRating === 'number' && (
                  <p className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                    <MaterialIcon name="star" filled className="text-[14px] text-secondary" />
                    {booking.helperRating.toFixed(1)} · Người giúp việc
                  </p>
                )}
              </div>
            </div>
            <MaterialIcon name={showHelper ? 'expand_less' : 'chevron_right'} className="text-primary" />
            </button>
            {showHelper && <div className="mt-4 border-t border-outline-variant/20 pt-4"><p className="text-label-md text-on-surface-variant">{booking.helperIdentityVerified ? 'Đã xác minh danh tính' : 'Hồ sơ người giúp việc'}</p>{!!booking.helperSkills?.length && <div className="mt-3 flex flex-wrap gap-2">{booking.helperSkills.map((skill) => <span key={skill} className="rounded-full bg-surface-container-high px-3 py-1 text-label-sm">{skill}</span>)}</div>}{booking.helperPhone && <a href={`tel:${booking.helperPhone}`} className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-white"><MaterialIcon name="call" />Gọi người giúp việc</a>}</div>}
          </section>
        )}

        {['PAID', 'FINISHED'].includes(booking.status) && !booking.reviewedAt && <section className="space-y-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4"><h3 className="font-bold">Đánh giá dịch vụ</h3><div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} sao`}><MaterialIcon name="star" filled={star <= rating} className={star <= rating ? 'text-3xl text-secondary' : 'text-3xl text-outline'} /></button>)}</div><textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Chia sẻ trải nghiệm của bạn" className="w-full rounded-xl border border-outline-variant bg-surface p-3" /><Button onClick={() => reviewBooking(booking._id, rating, comment).then((data) => setReviewMessage(data.message)).catch((error) => setReviewMessage(error instanceof Error ? error.message : 'Không thể gửi đánh giá'))}>Gửi đánh giá</Button>{reviewMessage && <p className="text-label-md text-primary">{reviewMessage}</p>}</section>}

        {booking.note && (
          <section className="rounded-r-xl border-l-4 border-primary bg-surface-container-low p-4">
            <h4 className="mb-1 font-label-md text-label-md uppercase tracking-wider text-primary">
              Ghi chú
            </h4>
            <p className="italic text-body-md text-on-surface-variant">{booking.note}</p>
          </section>
        )}

        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-[0px_4px_20px_rgba(17,24,39,0.06)]">
          <div className="flex items-center justify-between">
            <span className="font-title-md text-title-md text-on-surface">Tổng cộng</span>
            <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>
        </section>
      </main>

      {['COMPLETED', 'AWAITING_PAYMENT'].includes(booking.status) && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-container-low bg-surface-bright/95 px-margin-mobile pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center gap-4">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Cần thanh toán
              </span>
              <span className="font-title-md text-title-md text-primary">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
            <Button className="h-12 flex-1" onClick={() => onPay(booking)}>
              Thanh toán ngay
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
