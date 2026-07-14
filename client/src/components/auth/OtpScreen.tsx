import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../ui/Button'
import { MaterialIcon } from '../ui/MaterialIcon'
import { OtpInputGroup } from '../ui/OtpInputGroup'
import { TopAppBar } from '../ui/TopAppBar'

const OTP_EXPIRY_SECONDS = 60

type OtpScreenProps = {
  identifier: string
  otpCode: string
  isLoading: boolean
  isResending: boolean
  error: string
  resendStatus: string
  onChange: (otpCode: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onResend: () => void
  onBack: () => void
}

export function OtpScreen({
  identifier,
  otpCode,
  isLoading,
  isResending,
  error,
  resendStatus,
  onChange,
  onSubmit,
  onResend,
  onBack,
}: OtpScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const canResend = secondsLeft <= 0 && !isResending

  const handleResend = () => {
    onResend()
    setSecondsLeft(OTP_EXPIRY_SECONDS)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center bg-background text-on-surface">
      <TopAppBar title="HouseBuddy" onBack={onBack} centered />

      <main className="flex w-full max-w-md flex-1 flex-col px-margin-mobile pt-lg">
        <section className="mb-xl">
          <h2 className="mb-sm font-headline-lg text-headline-lg-mobile text-on-surface">
            Nhập mã OTP
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Mã xác thực đã được gửi đến{' '}
            <span className="font-semibold text-on-surface">{identifier}</span>
          </p>
        </section>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col">
          <section className="flex flex-col gap-lg">
            <OtpInputGroup
              value={otpCode}
              onChange={onChange}
              error={Boolean(error)}
              disabled={isLoading}
            />

            {error && (
              <div className="flex items-center gap-2 text-error">
                <MaterialIcon name="error" className="text-[18px]" />
                <p className="font-label-md text-label-md">{error}</p>
              </div>
            )}
          </section>

          <section className="mt-xl flex flex-col items-center gap-md">
            <div className="flex flex-col items-center gap-1">
              {secondsLeft > 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Mã hết hạn sau{' '}
                  <span className="font-bold text-secondary">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                </p>
              ) : (
                <p className="font-body-md text-body-md text-error">Mã OTP đã hết hạn</p>
              )}
              <button
                type="button"
                disabled={!canResend}
                onClick={handleResend}
                className="font-label-md text-label-md text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:text-outline"
              >
                {isResending ? 'Đang gửi lại...' : 'Gửi lại mã'}
              </button>
              {resendStatus && (
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {resendStatus}
                </p>
              )}
            </div>
          </section>

          <div className="mt-auto pb-10 pt-lg">
            <Button type="submit" disabled={isLoading || otpCode.length < 6}>
              {isLoading ? 'Đang xác nhận...' : 'Xác nhận'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
