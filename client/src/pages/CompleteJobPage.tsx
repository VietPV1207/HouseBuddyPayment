import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { MaterialIcon } from '../components/ui/MaterialIcon'
import { TopAppBar } from '../components/ui/TopAppBar'
import { completeJob } from '../services/bookingApi'
import { formatCurrency } from '../utils/currency'
import type { ApiBooking } from '../types/booking'

type CompleteJobPageProps = {
  job: ApiBooking
  onBack: () => void
  onCompleted: (booking: ApiBooking) => void
}

export function CompleteJobPage({ job, onBack, onCompleted }: CompleteJobPageProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const orderCode = `#HB-${job._id.slice(-6).toUpperCase()}`

  const handleSubmit = () => {
    setIsSubmitting(true)
    setError('')
    completeJob(job._id, note || undefined)
      .then((data) => onCompleted(data.booking))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể xác nhận hoàn thành')
        setIsSubmitting(false)
      })
  }

  return (
    <div className="min-h-dvh bg-background pb-10 text-on-surface">
      <TopAppBar title="Xác nhận hoàn thành" onBack={onBack} />

      <main className="mx-auto w-full max-w-md space-y-6 px-margin-mobile py-lg">
        <section className="rounded-xl border border-[#F3F4F6] bg-surface p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                Mã đơn hàng
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">{orderCode}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-label-md text-label-md text-on-surface-variant">Dịch vụ</p>
              <p className="font-semibold text-body-md">
                {job.serviceSnapshot?.name || 'Dịch vụ HouseBuddy'}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="font-label-md text-label-md text-on-surface-variant">Khách hàng</p>
              <p className="font-semibold text-body-md">{job.customerName || 'Khách hàng'}</p>
            </div>
            <div className="col-span-2 space-y-1 border-t border-surface-variant pt-3 text-right">
              <p className="font-label-md text-label-md text-on-surface-variant">Thu nhập</p>
              <p className="font-bold text-primary">{formatCurrency(job.totalAmount)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#F3F4F6] bg-surface p-4">
          <label className="flex cursor-pointer items-start gap-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 h-6 w-6 rounded border-outline text-primary focus:ring-primary-container"
            />
            <span className="text-body-md text-on-surface">
              Tôi xác nhận đã hoàn thành tất cả công việc theo thỏa thuận với khách hàng.
            </span>
          </label>
        </section>

        <section className="space-y-2">
          <label className="font-label-md text-label-md uppercase text-on-surface-variant">
            Ghi chú (nếu có)
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="Nhập thêm thông tin ghi chú cho khách hàng hoặc hệ thống..."
            className="w-full resize-none rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-body-md focus:border-primary focus:outline-none"
          />
        </section>

        {error && (
          <p className="rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        <section className="space-y-4 pt-2">
          <Button onClick={handleSubmit} disabled={!confirmed || isSubmitting}>
            {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận hoàn thành'}
          </Button>
          <div className="flex items-start gap-3 rounded-xl border border-[#F3F4F6] bg-surface-container-low p-4">
            <MaterialIcon name="qr_code_2" className="text-primary" />
            <p className="text-body-md text-on-surface-variant">
              Sau khi xác nhận, khách hàng sẽ nhận được thông báo để thanh toán qua QR PayOS.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
