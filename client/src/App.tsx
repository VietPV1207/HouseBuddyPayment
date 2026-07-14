import { useEffect, useState } from 'react'
import { AdminApp } from './routes/AdminApp'
import { CustomerApp } from './routes/CustomerApp'
import { GuestApp } from './routes/GuestApp'
import { HelperApp } from './routes/HelperApp'
import { getServices } from './services/servicesApi'
import { clearSession, getSavedSession } from './services/sessionStorage'
import { mapApiServiceToOption } from './utils/mapService'
import type { AuthSession } from './types/auth'
import type { ServiceOption } from './types/booking'

function App() {
  const [session, setSession] = useState<AuthSession | undefined>(getSavedSession)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [servicesError, setServicesError] = useState('')
  const [isLoadingServices, setIsLoadingServices] = useState(true)

  useEffect(() => {
    getServices()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setServices(list.map(mapApiServiceToOption))
      })
      .catch((err) =>
        setServicesError(err instanceof Error ? err.message : 'Không thể tải danh sách dịch vụ'),
      )
      .finally(() => setIsLoadingServices(false))
  }, [])

  const handleLogout = () => {
    clearSession()
    setSession(undefined)
  }

  if (isLoadingServices) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="font-label-md text-label-md text-on-surface-variant">Đang tải...</p>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-margin-mobile text-center">
        <p className="font-body-md text-body-md text-on-error-container">
          {servicesError || 'Hiện chưa có dịch vụ nào khả dụng.'}
        </p>
      </div>
    )
  }

  if (!session?.user) {
    return <GuestApp services={services} onAuthenticated={setSession} />
  }

  const { user } = session

  if (user.role === 'helper') {
    return <HelperApp user={user} onLogout={handleLogout} />
  }

  if (user.role === 'admin') {
    return <AdminApp user={user} onLogout={handleLogout} />
  }

  return <CustomerApp user={user} services={services} onLogout={handleLogout} />
}

export default App
