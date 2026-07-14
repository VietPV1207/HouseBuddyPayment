import { useState } from 'react'
import type { HelperNavTab } from '../components/ui/HelperBottomNav'
import { CompleteJobPage } from '../pages/CompleteJobPage'
import { HelperAccountPage } from '../pages/HelperAccountPage'
import { HelperEarningsPage } from '../pages/HelperEarningsPage'
import { HelperHomePage } from '../pages/HelperHomePage'
import { HelperJobDetailPage } from '../pages/HelperJobDetailPage'
import { JobOffersPage } from '../pages/JobOffersPage'
import { MyJobsPage } from '../pages/MyJobsPage'
import type { AuthUser } from '../types/auth'
import type { ApiBooking } from '../types/booking'

type HelperScreen =
  | 'home'
  | 'schedule'
  | 'jobs'
  | 'earnings'
  | 'account'
  | 'job-offers'
  | 'job-detail'
  | 'complete-job'

type HelperAppProps = {
  user: AuthUser
  onLogout: () => void
}

export function HelperApp({ user, onLogout }: HelperAppProps) {
  const [screen, setScreen] = useState<HelperScreen>('home')
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>()
  const [jobToComplete, setJobToComplete] = useState<ApiBooking | undefined>()

  const handleNavigate = (tab: HelperNavTab) => {
    setScreen(tab as HelperScreen)
  }

  const openJob = (bookingId: string) => {
    setSelectedJobId(bookingId)
    setScreen('job-detail')
  }

  if (screen === 'job-offers') {
    return (
      <JobOffersPage onBack={() => setScreen('home')} onAccepted={openJob} />
    )
  }

  if (screen === 'schedule' || screen === 'jobs') {
    return (
      <MyJobsPage
        scope={screen === 'schedule' ? 'schedule' : 'jobs'}
        onNavigate={handleNavigate}
        onOpenJob={openJob}
      />
    )
  }

  if (screen === 'job-detail' && selectedJobId) {
    return (
      <HelperJobDetailPage
        bookingId={selectedJobId}
        onBack={() => setScreen('schedule')}
        onOpenComplete={(job) => {
          setJobToComplete(job)
          setScreen('complete-job')
        }}
      />
    )
  }

  if (screen === 'complete-job' && jobToComplete) {
    return (
      <CompleteJobPage
        job={jobToComplete}
        onBack={() => setScreen('job-detail')}
        onCompleted={() => {
          setJobToComplete(undefined)
          setScreen('jobs')
        }}
      />
    )
  }

  if (screen === 'earnings') {
    return <HelperEarningsPage onNavigate={handleNavigate} />
  }

  if (screen === 'account') {
    return <HelperAccountPage user={user} onNavigate={handleNavigate} onLogout={onLogout} />
  }

  return (
    <HelperHomePage
      user={user}
      onNavigate={handleNavigate}
      onOpenOffers={() => setScreen('job-offers')}
      onOpenJob={openJob}
    />
  )
}
