import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { MaterialIcon } from '../components/ui/MaterialIcon'
import { TopAppBar } from '../components/ui/TopAppBar'
import { createBooking } from '../services/bookingApi'
import { getCustomerProfile } from '../services/customerApi'
import { formatCurrency } from '../utils/currency'
import type {
  ApiBooking,
  ChildPickupDirection,
  ChildPickupPlan,
  ChildPickupSelections,
  ChildPickupVehicle,
  ServiceOption,
} from '../types/booking'
import type { AuthUser } from '../types/auth'
import type { SavedAddress } from '../types/customer'

type ChildPickupBookingPageProps = {
  service: ServiceOption
  initialSelections: ChildPickupSelections
  user: AuthUser
  onBack: () => void
  onSuccess: (booking: ApiBooking) => void
}

const directions: ChildPickupDirection[] = ['Đưa', 'Đón', 'Cả hai']
const vehicles: { value: ChildPickupVehicle; icon: string }[] = [
  { value: 'Xe máy', icon: 'two_wheeler' },
  { value: 'Ô tô', icon: 'directions_car' },
]
const plans: ChildPickupPlan[] = ['Dịch vụ lẻ', 'Theo tuần', 'Theo tháng']

export function ChildPickupBookingPage({
  service,
  initialSelections,
  user,
  onBack,
  onSuccess,
}: ChildPickupBookingPageProps) {
  const [direction, setDirection] = useState(initialSelections.direction)
  const [vehicle, setVehicle] = useState(initialSelections.vehicle)
  const [plan, setPlan] = useState(initialSelections.plan)
  const [childCount, setChildCount] = useState(initialSelections.childCount)
  const [date, setDate] = useState('')
  const [pickupTime, setPickupTime] = useState('07:00')
  const [returnTime, setReturnTime] = useState('07:30')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
  const [destination, setDestination] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedMessage, setSubmittedMessage] = useState('')

  const total = service.basePrice * childCount
  const selectedAddress = savedAddresses[selectedAddressIndex]
  const scheduled = date ? new Date(`${date}T${pickupTime}`) : null
  const scheduleError = scheduled && (
    scheduled.getTime() - Date.now() < 2 * 60 * 60 * 1000 ||
    scheduled.getHours() < 6 || scheduled.getHours() >= 20
  ) ? 'Chọn thời gian từ 06:00 đến 20:00 và trước ít nhất 2 giờ.' : ''

  useEffect(() => {
    getCustomerProfile(user._id).then((profile) => setSavedAddresses(profile.address)).catch(() => {})
  }, [user._id])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedAddress || scheduleError) {
      setSubmittedMessage(scheduleError || 'Vui lòng thiết lập địa chỉ đón trong hồ sơ.')
      return
    }
    setIsSubmitting(true)

    const scheduledTime = new Date(`${date}T${pickupTime}`).toISOString()
    const detailNote = [
      `Chiều đi: ${direction}`,
      `Điểm đến: ${destination}`,
      `Giờ trả: ${returnTime}`,
      `Loại xe: ${vehicle}`,
      `Gói: ${plan}`,
      `Số bé: ${childCount}`,
    ].join('; ')
    const combinedNote = note ? `${detailNote}. Ghi chú: ${note}` : `${detailNote}.`

    createBooking({
      serviceId: service.id,
      serviceSnapshot: {
        name: service.name,
        category: service.category,
        basePrice: service.basePrice,
      },
      duration: 1,
      scheduledTime,
      address: {
        street: selectedAddress.street,
        ward: selectedAddress.ward,
        district: selectedAddress.district,
        city: selectedAddress.city,
      },
      note: combinedNote,
    })
      .then((data) => onSuccess(data.booking))
      .catch((error: unknown) => {
        setSubmittedMessage(
          error instanceof Error ? error.message : 'Không thể gửi yêu cầu lúc này.',
        )
        setIsSubmitting(false)
      })
  }

  const chipClass = (active: boolean) =>
    `flex-1 rounded-full py-2 text-center font-label-md text-label-md transition-all ${
      active ? 'bg-primary-container text-white shadow-md' : 'text-on-surface-variant'
    }`

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-40 text-on-surface">
      <TopAppBar title="Đặt lịch đưa đón" onBack={onBack} />

      <main className="mx-auto w-full max-w-md flex-grow px-margin-mobile pt-lg">
        <section className="flex items-center gap-md rounded-xl border border-[#F3F4F6] bg-surface-container-lowest p-md shadow-[0px_4px_20px_rgba(17,24,39,0.06)]">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-primary-fixed">
            <img src={service.heroImage} alt={service.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="font-title-md text-title-md text-on-background">{service.name}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Dịch vụ an toàn, tin cậy cho bé
            </p>
            <div className="mt-1 flex items-center text-secondary">
              <MaterialIcon name="verified" filled className="mr-1 text-[18px]" />
              <span className="font-label-sm text-label-sm">Đã xác minh</span>
            </div>
          </div>
        </section>

        <div className="mt-lg flex items-center gap-3 rounded-lg border-l-4 border-error bg-error-container/30 px-4 py-3">
          <MaterialIcon name="info" className="text-error" />
          <p className="font-label-md text-label-md text-on-error-container">
            Lưu ý: Đặt trước ít nhất 2 giờ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-xl space-y-xl">
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant">
              Chiều đi
            </label>
            <div className="flex rounded-full bg-surface-container-high p-1">
              {directions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDirection(option)}
                  className={chipClass(direction === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant">
              Ngày thực hiện
            </label>
            <div className="relative">
              <MaterialIcon
                name="calendar_today"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
              />
              <input
                type="date"
                min={new Date().toLocaleDateString('en-CA')}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="w-full rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest py-3 pl-12 pr-4 font-body-lg text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">
                Giờ đón
              </label>
              <div className="relative">
                <MaterialIcon
                  name="schedule"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                />
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(event) => setPickupTime(event.target.value)}
                  required
                  className="w-full rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest py-3 pl-12 pr-4 font-body-lg text-on-surface focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-on-surface-variant">
                Giờ trả
              </label>
              <div className="relative">
                <MaterialIcon
                  name="history"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                />
                <input
                  type="time"
                  value={returnTime}
                  onChange={(event) => setReturnTime(event.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest py-3 pl-12 pr-4 font-body-lg text-on-surface focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-lg rounded-xl border border-outline-variant/30 bg-surface-container-low p-md">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                <span className="h-2 w-2 rounded-full bg-primary" /> Điểm đón
              </label>
              <select
                value={selectedAddressIndex}
                onChange={(event) => setSelectedAddressIndex(Number(event.target.value))}
                required
                className="w-full rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-lg text-on-surface focus:border-primary focus:outline-none"
              >
                {savedAddresses.map((address, index) => (
                  <option key={`${address.street}-${index}`} value={index}>
                    {address.label || 'Địa chỉ'}: {[address.street, address.ward, address.district].filter(Boolean).join(', ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                <span className="h-2 w-2 rounded-full bg-secondary-container" /> Điểm đến (trường)
              </label>
              <input
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Nhập tên trường học..."
                required
                className="w-full rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-lg text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {scheduleError && <p className="text-label-md text-error">{scheduleError}</p>}

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant">
              Loại xe
            </label>
            <div className="grid grid-cols-2 gap-md">
              {vehicles.map((option) => {
                const active = vehicle === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVehicle(option.value)}
                    className={`relative flex flex-col items-center justify-center rounded-xl border-[1.5px] p-md transition-all ${
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-outline-variant bg-surface-container-lowest opacity-70'
                    }`}
                  >
                    <MaterialIcon
                      name={option.icon}
                      className={`mb-1 ${active ? 'text-primary' : 'text-outline'}`}
                    />
                    <span className={active ? 'text-primary' : 'text-on-surface-variant'}>
                      {option.value}
                    </span>
                    {active && (
                      <MaterialIcon
                        name="check_circle"
                        filled
                        className="absolute right-2 top-2 text-[20px] text-primary"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant">
              Gói dịch vụ
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {plans.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPlan(option)}
                  className={`whitespace-nowrap rounded-full border-[1.5px] px-6 py-2 font-label-md transition-all ${
                    plan === option
                      ? 'border-primary bg-primary text-white'
                      : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                  }`}
                >
                  {option === 'Dịch vụ lẻ' ? 'Lẻ' : option === 'Theo tuần' ? 'Tuần' : 'Tháng'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md">
            <div>
              <p className="font-label-md text-label-md text-on-surface">Số bé</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Tối đa 3 bé</p>
            </div>
            <div className="flex items-center gap-lg">
              <button
                type="button"
                onClick={() => setChildCount((count) => Math.max(1, count - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-transform active:scale-90"
              >
                <MaterialIcon name="remove" />
              </button>
              <span className="w-4 text-center font-title-md text-title-md">{childCount}</span>
              <button
                type="button"
                onClick={() => setChildCount((count) => Math.min(3, count + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/20 text-primary transition-transform active:scale-90"
              >
                <MaterialIcon name="add" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface-variant">
              Ghi chú cho tài xế (Tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Lưu ý về đồ dùng, đặc điểm nhận dạng bé..."
              className="w-full resize-none rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-lg text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          {submittedMessage && (
            <p className="rounded-xl bg-primary-container/10 px-4 py-3 font-label-md text-label-md text-on-primary-container">
              {submittedMessage}
            </p>
          )}

          <div className="fixed bottom-0 left-0 z-40 w-full bg-surface px-margin-mobile pb-[calc(16px+env(safe-area-inset-bottom))] pt-md shadow-[0px_-4px_20px_rgba(17,24,39,0.06)]">
            <div className="mx-auto flex max-w-md items-center justify-between gap-lg">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Tạm tính ({childCount} bé)
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
                    {formatCurrency(total)}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    /lượt
                  </span>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} fullWidth={false} className="max-w-[200px] flex-grow">
                {isSubmitting ? 'Đang gửi...' : 'Tiếp tục'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
