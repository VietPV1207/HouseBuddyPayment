import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { MaterialIcon } from '../components/ui/MaterialIcon'
import { TopAppBar } from '../components/ui/TopAppBar'
import { createBooking } from '../services/bookingApi'
import { getCustomerProfile } from '../services/customerApi'
import { formatCurrency } from '../utils/currency'
import type { ApiBooking, BookingDraft, ServiceOption } from '../types/booking'
import type { AuthUser } from '../types/auth'
import type { SavedAddress } from '../types/customer'

type CreateBookingPageProps = {
  user: AuthUser
  services: ServiceOption[]
  initialServiceId?: string
  initialAddOnIds?: string[]
  onBack: () => void
  onLogout: () => void
  onManageAddresses: () => void
  onSuccess: (booking: ApiBooking) => void
}

const EARLIEST_HOUR = 6
const LATEST_HOUR = 20
const MIN_ADVANCE_MS = 2 * 60 * 60 * 1000

function validateSchedule(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return ''
  const scheduled = new Date(`${dateStr}T${timeStr}`)
  if (Number.isNaN(scheduled.getTime())) return 'Ngày giờ không hợp lệ.'

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const scheduledDay = new Date(
    scheduled.getFullYear(),
    scheduled.getMonth(),
    scheduled.getDate(),
  )
  if (scheduledDay < startOfToday) return 'Không thể đặt cho ngày trong quá khứ.'

  const hour = scheduled.getHours()
  if (hour < EARLIEST_HOUR || hour >= LATEST_HOUR) {
    return `Chỉ nhận đặt trong khung ${EARLIEST_HOUR}:00 - ${LATEST_HOUR}:00.`
  }

  if (scheduled.getTime() - now.getTime() < MIN_ADVANCE_MS) {
    return 'Đơn phải được đặt trước ít nhất 2 giờ.'
  }

  return ''
}

function getVoucherDiscount(code: string) {
  const normalized = code.trim().toUpperCase()
  if (normalized === 'HB20') return 0.2
  if (normalized === 'SPRINT2') return 0.15
  return 0
}

export function CreateBookingPage({
  user,
  services,
  initialServiceId,
  initialAddOnIds,
  onBack,
  onLogout: _onLogout,
  onManageAddresses,
  onSuccess,
}: CreateBookingPageProps) {
  const fallbackService = useMemo(
    () => services.find((service) => !service.isChildPickup) || services[0],
    [services],
  )

  const [draft, setDraft] = useState<BookingDraft>(() => {
    const preselected = services.find(
      (service) => service.id === initialServiceId && !service.isChildPickup,
    )
    const initialService = preselected || fallbackService

    return {
      serviceId: initialService.id,
      duration: initialService.durationHours[0],
      address: '',
      ward: '',
      district: '',
      scheduledDate: '',
      scheduledTime: '',
      note: '',
      voucherCode: '',
    }
  })
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>(initialAddOnIds || [])
  const [selectedAreaTierIndex, setSelectedAreaTierIndex] = useState(0)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
  const [submittedMessage, setSubmittedMessage] = useState('')
  const [voucherMessage, setVoucherMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getCustomerProfile(user._id)
      .then((profile) => setSavedAddresses(profile.address))
      .catch(() => {
      })
  }, [user._id])

  const selectedAddress = savedAddresses[selectedAddressIndex]
  const scheduleError = validateSchedule(draft.scheduledDate, draft.scheduledTime)

  const selectedService = useMemo(
    () => services.find((service) => service.id === draft.serviceId) || fallbackService,
    [services, draft.serviceId, fallbackService],
  )

  const usesAreaPricing = selectedService.areaTiers.length > 0
  const selectedAreaTier = selectedService.areaTiers[selectedAreaTierIndex]

  const selectedAddOns = selectedService.addOns.filter((addOn) =>
    selectedAddOnIds.includes(addOn.id),
  )
  const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0)
  const baseAmount = usesAreaPricing
    ? selectedAreaTier?.price || 0
    : selectedService.basePrice * draft.duration
  const discountRate = getVoucherDiscount(draft.voucherCode)
  const subtotal = baseAmount + addOnsTotal
  const discount = Math.round(subtotal * discountRate)
  const total = subtotal - discount

  const updateDraft = (nextDraft: Partial<BookingDraft>) => {
    setSubmittedMessage('')
    setDraft((current) => ({ ...current, ...nextDraft }))
  }

  const toggleAddOn = (addOnId: string) => {
    setSubmittedMessage('')
    setSelectedAddOnIds((current) =>
      current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId],
    )
  }

  const handleApplyVoucher = () => {
    if (!draft.voucherCode.trim()) {
      setVoucherMessage('Nhập mã voucher trước đã nhé.')
      return
    }

    setVoucherMessage(
      discountRate > 0
        ? `Đã áp dụng voucher: giảm ${Math.round(discountRate * 100)}%.`
        : 'Mã voucher không áp dụng được cho đơn này.',
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (scheduleError) {
      setSubmittedMessage(scheduleError)
      return
    }
    if (!selectedAddress) {
      setSubmittedMessage('Vui lòng chọn địa chỉ làm việc.')
      return
    }

    setIsSubmitting(true)
    const scheduledTime = new Date(
      `${draft.scheduledDate}T${draft.scheduledTime}`,
    ).toISOString()

    const areaNote = usesAreaPricing && selectedAreaTier
      ? `Diện tích: ${selectedAreaTier.label}.`
      : ''
    const addOnsNote = selectedAddOns.length
      ? `Dịch vụ thêm: ${selectedAddOns.map((addOn) => addOn.name).join(', ')}.`
      : ''
    const combinedNote = [areaNote, addOnsNote, draft.note].filter(Boolean).join(' ')

    createBooking({
      serviceId: selectedService.id,
      serviceSnapshot: {
        name: selectedService.name,
        category: selectedService.category,
        basePrice: selectedService.basePrice,
      },
      // Area-priced services book as a single visit; duration stays nominal
      // (BE requires >= 1) since the tier price already covers the job.
      duration: usesAreaPricing ? 2 : draft.duration,
      scheduledTime,
      address: {
        street: selectedAddress.street,
        ward: selectedAddress.ward || undefined,
        district: selectedAddress.district || undefined,
        city: selectedAddress.city || 'Hà Nội',
      },
      note: combinedNote || undefined,
      voucherCode: draft.voucherCode || undefined,
      addOnIds: selectedAddOnIds,
      areaTierIndex: usesAreaPricing ? selectedAreaTierIndex : undefined,
    })
      .then((data) => {
        onSuccess(data.booking)
      })
      .catch((error: unknown) => {
        setSubmittedMessage(
          error instanceof Error ? error.message : 'Không thể gửi yêu cầu lúc này.',
        )
        setIsSubmitting(false)
      })
  }

  return (
    <div className="min-h-dvh bg-background pb-40 text-on-surface">
      <TopAppBar title="Đặt dịch vụ" onBack={onBack} centered />

      <main className="mx-auto w-full max-w-md space-y-lg px-margin-mobile pt-lg">
        <section className="flex items-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-[0px_4px_20px_rgba(17,24,39,0.06)]">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container">
            <img
              src={selectedService.heroImage}
              alt={selectedService.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-title-md text-title-md text-on-surface">
              {selectedService.name}
            </h2>
            <div className="mt-1 flex items-center gap-1">
              <MaterialIcon
                name="star"
                filled
                className="text-[16px] text-secondary"
              />
              <span className="font-label-md text-label-md text-on-surface-variant">
                {selectedService.rating}
              </span>
            </div>
            <p className="mt-2 font-title-md text-title-md text-primary">
              {formatCurrency(selectedService.basePrice)}/{selectedService.priceUnit}
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-lg">
          <section className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="block px-1 font-label-md text-label-md text-on-surface-variant">
                  Ngày làm
                </span>
                <input
                  type="date"
                  min={new Date().toLocaleDateString('en-CA')}
                  className={`h-12 w-full rounded-xl border-2 bg-surface-container-lowest px-4 font-body-lg text-body-lg text-on-surface focus:outline-none ${
                    scheduleError ? 'border-error focus:border-error' : 'border-surface-variant focus:border-primary'
                  }`}
                  value={draft.scheduledDate}
                  onChange={(event) => updateDraft({ scheduledDate: event.target.value })}
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="block px-1 font-label-md text-label-md text-on-surface-variant">
                  Giờ bắt đầu
                </span>
                <input
                  type="time"
                  min="06:00"
                  max="20:00"
                  className={`h-12 w-full rounded-xl border-2 bg-surface-container-lowest px-4 font-body-lg text-body-lg text-on-surface focus:outline-none ${
                    scheduleError ? 'border-error focus:border-error' : 'border-surface-variant focus:border-primary'
                  }`}
                  value={draft.scheduledTime}
                  onChange={(event) => updateDraft({ scheduledTime: event.target.value })}
                  required
                />
              </label>
            </div>
            {scheduleError ? (
              <p className="flex items-center gap-1 px-1 font-label-sm text-label-sm text-error">
                <MaterialIcon name="error" className="text-[16px]" />
                {scheduleError}
              </p>
            ) : (
              <p className="px-1 font-label-sm text-label-sm text-outline">
                Nhận đặt trong khung 06:00 - 20:00, trước ít nhất 2 giờ.
              </p>
            )}
          </section>

          {usesAreaPricing ? (
            <section className="space-y-3">
              <span className="block px-1 font-label-md text-label-md text-on-surface-variant">
                Diện tích cần dọn
              </span>
              <div className="space-y-2">
                {selectedService.areaTiers.map((tier, index) => {
                  const active = index === selectedAreaTierIndex
                  return (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => {
                        setSubmittedMessage('')
                        setSelectedAreaTierIndex(index)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border-2 p-4 transition-colors ${
                        active ? 'border-primary bg-primary-container/5' : 'border-surface-variant'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MaterialIcon
                          name={active ? 'radio_button_checked' : 'radio_button_unchecked'}
                          className={active ? 'text-primary' : 'text-outline'}
                        />
                        <span className="font-body-lg text-on-surface">{tier.label}</span>
                      </div>
                      <span className="font-bold text-label-md text-primary">
                        {formatCurrency(tier.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : (
            selectedService.durationHours.length > 1 && (
              <section className="space-y-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    Thời lượng
                  </span>
                  <span className="font-title-md text-title-md text-primary">
                    {draft.duration} giờ
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedService.durationHours[0]}
                  max={selectedService.durationHours[selectedService.durationHours.length - 1]}
                  step={1}
                  value={draft.duration}
                  onChange={(event) => updateDraft({ duration: Number(event.target.value) })}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-variant accent-primary-container"
                />
                <div className="flex justify-between font-label-sm text-label-sm text-outline">
                  <span>{selectedService.durationHours[0]}h</span>
                  <span>
                    {selectedService.durationHours[selectedService.durationHours.length - 1]}h
                  </span>
                </div>
              </section>
            )
          )}

          {selectedService.addOns.length > 0 && (
            <section className="space-y-3">
              <span className="block px-1 font-label-md text-label-md text-on-surface-variant">
                Dịch vụ thêm
              </span>
              <div className="space-y-2">
                {selectedService.addOns.map((addOn) => {
                  const checked = selectedAddOnIds.includes(addOn.id)
                  return (
                    <label
                      key={addOn.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                        checked ? 'border-primary' : 'border-surface-variant'
                      } bg-surface-container-lowest`}
                    >
                      <div className="flex items-center gap-3">
                        <MaterialIcon name={addOn.icon} className="text-on-surface-variant" />
                        <div>
                          <p className="font-body-lg text-on-surface">{addOn.name}</p>
                          <p className="font-label-sm text-label-sm text-primary">
                            +{formatCurrency(addOn.price)}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-6 w-6 rounded-md border-2 border-surface-variant text-primary focus:ring-primary-container"
                        checked={checked}
                        onChange={() => toggleAddOn(addOn.id)}
                      />
                    </label>
                  )
                })}
              </div>
            </section>
          )}

          <section className="space-y-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Địa chỉ làm việc
              </span>
              <button
                type="button"
                onClick={onManageAddresses}
                className="font-bold text-label-sm text-primary hover:underline"
              >
                Quản lý địa chỉ
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <button
                type="button"
                onClick={onManageAddresses}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant/60 py-4 font-label-md text-label-md text-primary"
              >
                <MaterialIcon name="add_location_alt" />
                Thêm địa chỉ trong Tài khoản
              </button>
            ) : (
              <div className="space-y-2">
                {savedAddresses.map((address, index) => {
                  const active = index === selectedAddressIndex
                  return (
                    <button
                      key={`${address.street}-${index}`}
                      type="button"
                      onClick={() => setSelectedAddressIndex(index)}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                        active ? 'border-primary bg-primary-container/5' : 'border-surface-variant'
                      }`}
                    >
                      <MaterialIcon
                        name={active ? 'radio_button_checked' : 'radio_button_unchecked'}
                        className={active ? 'text-primary' : 'text-outline'}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-label-md text-on-surface">
                          {address.label || 'Địa chỉ'}
                        </p>
                        <p className="truncate font-body-md text-body-md text-on-surface-variant">
                          {[address.street, address.ward, address.district, address.city]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <span className="block px-1 font-label-md text-label-md text-on-surface-variant">
              Ghi chú cho người giúp việc (tùy chọn)
            </span>
            <textarea
              className="min-h-[100px] w-full resize-none rounded-xl border-2 border-surface-variant bg-surface-container-lowest p-4 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none"
              placeholder="Ví dụ: Nhà có thú cưng, để chìa khóa ở hòm thư..."
              value={draft.note}
              onChange={(event) => updateDraft({ note: event.target.value })}
            />
          </section>

          <section className="space-y-2">
            <span className="block px-1 font-label-md text-label-md text-on-surface-variant">
              Mã voucher (tùy chọn)
            </span>
            <div className="flex gap-2">
              <input
                className="h-12 min-w-0 flex-1 rounded-xl border-2 border-surface-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none"
                placeholder="HB20"
                value={draft.voucherCode}
                onChange={(event) =>
                  updateDraft({ voucherCode: event.target.value.toUpperCase() })
                }
              />
              <Button type="button" variant="secondary" fullWidth={false} onClick={handleApplyVoucher}>
                Áp dụng
              </Button>
            </div>
            {voucherMessage && (
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {voucherMessage}
              </p>
            )}
          </section>

          {submittedMessage && (
            <p className="rounded-xl bg-primary-container/10 px-4 py-3 font-label-md text-label-md text-on-primary-container">
              {submittedMessage}
            </p>
          )}

          <div className="fixed bottom-0 left-0 z-40 w-full border-t border-surface-container-low bg-surface-bright/95 px-margin-mobile pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
            <div className="mx-auto flex max-w-md items-center justify-between gap-4">
              <div className="flex flex-col">
                {discount > 0 && (
                  <span className="font-label-sm text-label-sm text-error">
                    Giảm giá -{formatCurrency(discount)}
                  </span>
                )}
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Tạm tính
                </span>
                <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || Boolean(scheduleError) || !selectedAddress}
                className="h-14 flex-1"
              >
                {isSubmitting ? 'Đang gửi...' : 'Tiếp tục'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
