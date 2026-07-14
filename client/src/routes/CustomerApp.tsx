import { useState } from 'react'
import type { BottomNavTab } from '../components/ui/BottomNav'
import { AccountPage } from '../pages/AccountPage'
import { ActivityPage } from '../pages/ActivityPage'
import { BookingDetailPage } from '../pages/BookingDetailPage'
import { BookingSuccessPage } from '../pages/BookingSuccessPage'
import { ChildPickupBookingPage } from '../pages/ChildPickupBookingPage'
import { ChildPickupDetailPage } from '../pages/ChildPickupDetailPage'
import { ClaimsPage } from '../pages/ClaimsPage'
import { CreateBookingPage } from '../pages/CreateBookingPage'
import { HomePage } from '../pages/HomePage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { PaymentPage } from '../pages/PaymentPage'
import { ServiceDetailPage } from '../pages/ServiceDetailPage'
import type { AuthUser } from '../types/auth'
import type { ApiBooking, ChildPickupSelections, ServiceOption } from '../types/booking'

type CustomerScreen =
  | 'home'
  | 'service-detail'
  | 'child-pickup-detail'
  | 'child-pickup-booking'
  | 'create-booking'
  | 'booking-success'
  | 'activity'
  | 'booking-detail'
  | 'payment'
  | 'notifications'
  | 'account'
  | 'claims'

const defaultChildPickupSelections: ChildPickupSelections = {
  direction: 'Đưa',
  vehicle: 'Xe máy',
  childCount: 1,
  plan: 'Dịch vụ lẻ',
}

type CustomerAppProps = {
  user: AuthUser
  services: ServiceOption[]
  onLogout: () => void
}

export function CustomerApp({ user, services, onLogout }: CustomerAppProps) {
  const [screen, setScreen] = useState<CustomerScreen>('home')
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>()
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([])
  const [childPickupSelections, setChildPickupSelections] = useState<ChildPickupSelections>(
    defaultChildPickupSelections,
  )
  const [createdBooking, setCreatedBooking] = useState<ApiBooking | undefined>()
  const [selectedBooking, setSelectedBooking] = useState<ApiBooking | undefined>()

  const selectedService =
    services.find((service) => service.id === selectedServiceId) || services[0]

  const handleNavigate = (tab: BottomNavTab) => {
    setScreen(tab === 'orders' ? 'activity' : (tab as CustomerScreen))
  }

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    const service = services.find((item) => item.id === serviceId)
    setScreen(service?.isChildPickup ? 'child-pickup-detail' : 'service-detail')
  }

  const handleBookingSuccess = (booking: ApiBooking) => {
    setCreatedBooking(booking)
    setScreen('booking-success')
  }

  if (screen === 'service-detail') {
    return (
      <ServiceDetailPage
        service={selectedService}
        onBack={() => setScreen('home')}
        onBook={(_id, addOnIds) => {
          setSelectedAddOnIds(addOnIds)
          setScreen('create-booking')
        }}
      />
    )
  }

  if (screen === 'child-pickup-detail') {
    return (
      <ChildPickupDetailPage
        service={selectedService}
        onBack={() => setScreen('home')}
        onBook={(selections) => {
          setChildPickupSelections(selections)
          setScreen('child-pickup-booking')
        }}
      />
    )
  }

  if (screen === 'child-pickup-booking') {
    return (
      <ChildPickupBookingPage
        service={selectedService}
        user={user}
        initialSelections={childPickupSelections}
        onBack={() => setScreen('child-pickup-detail')}
        onSuccess={handleBookingSuccess}
      />
    )
  }

  if (screen === 'create-booking') {
    return (
      <CreateBookingPage
        user={user}
        services={services}
        initialServiceId={selectedServiceId}
        initialAddOnIds={selectedAddOnIds}
        onBack={() => setScreen('home')}
        onLogout={onLogout}
        onManageAddresses={() => setScreen('account')}
        onSuccess={handleBookingSuccess}
      />
    )
  }

  if (screen === 'booking-success' && createdBooking) {
    return (
      <BookingSuccessPage
        booking={createdBooking}
        onViewOrders={() => setScreen('activity')}
        onGoHome={() => setScreen('home')}
      />
    )
  }

  if (screen === 'activity') {
    return (
      <ActivityPage
        onNavigate={handleNavigate}
        onOpenBooking={(booking) => {
          setSelectedBooking(booking)
          setScreen('booking-detail')
        }}
      />
    )
  }

  if (screen === 'booking-detail' && selectedBooking) {
    return (
      <BookingDetailPage
        booking={selectedBooking}
        onBack={() => setScreen('activity')}
        onPay={(booking) => {
          setSelectedBooking(booking)
          setScreen('payment')
        }}
      />
    )
  }

  if (screen === 'payment' && selectedBooking) {
    return (
      <PaymentPage
        booking={selectedBooking}
        onBack={() => setScreen('booking-detail')}
        onPaid={(booking) => {
          setSelectedBooking(booking)
          setScreen('activity')
        }}
      />
    )
  }

  if (screen === 'notifications') {
    return <NotificationsPage onNavigate={handleNavigate} />
  }

  if (screen === 'account') {
    return (
      <AccountPage
        user={user}
        onNavigate={handleNavigate}
        onOpenClaims={() => setScreen('claims')}
        onLogout={onLogout}
      />
    )
  }

  if (screen === 'claims') {
    return <ClaimsPage onNavigate={handleNavigate} onBack={() => setScreen('account')} />
  }

  return (
    <HomePage
      user={user}
      services={services}
      onNavigate={handleNavigate}
      onSelectService={handleSelectService}
    />
  )
}
