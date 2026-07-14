import type { FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { MaterialIcon } from '../ui/MaterialIcon'

type LoginScreenProps = {
  identifier: string
  isLoading: boolean
  error: string
  status: string
  onIdentifierChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onGoToRegister: () => void
  onBack?: () => void
}

export function LoginScreen({
  identifier,
  isLoading,
  error,
  status,
  onIdentifierChange,
  onSubmit,
  onGoToRegister,
  onBack,
}: LoginScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-on-background">
      <header className="relative flex h-20 w-full items-center justify-center px-margin-mobile">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="absolute left-margin-mobile flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low active:scale-95"
          >
            <MaterialIcon name="arrow_back" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container shadow-sm">
            <MaterialIcon name="home_health" filled className="text-on-primary-container" />
          </div>
          <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
            HouseBuddy
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-grow flex-col px-margin-mobile pt-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
            Đăng nhập / Đăng ký
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Chào mừng bạn đến với HouseBuddy - người bạn đồng hành tin cậy cho ngôi nhà của
            bạn.
          </p>
        </div>

        <div className="group relative mb-8 h-40 w-full overflow-hidden rounded-3xl shadow-sm">
          <img
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Không gian phòng khách ấm áp, hiện đại với ánh nắng tự nhiên"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyV0rYPoyMy38nnaXG11VYzIaWJF85vnBEOJpqlcMe6s-PHijmodbcjaZGs30QQzD3jSX_7YvcAH8M-yqXhPeBeLPLVGzeqUHtNkFRzrSqtEbd7CyigUvHRS--hcquqGBtGnZ8x8W1ek1-jPk9yyeEk51VMviDRJdGgrjZuPS0lGiDPlMvMCIi0Mr64AmPJXJqzPosW3MkJh9TeTyPB8cWZ_6sNfoFPvfxLZBEyCCbtYudYPwnX_Q8"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <Input
            id="identifier"
            label="Số điện thoại"
            leadingIcon="call"
            type="tel"
            placeholder="Nhập số điện thoại của bạn"
            autoComplete="tel"
            maxLength={11}
            value={identifier}
            onChange={(event) => onIdentifierChange(event.target.value.replace(/\D/g, ''))}
            required
          />

          {error && (
            <p className="rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
              {error}
            </p>
          )}
          {status && (
            <p className="rounded-xl bg-primary-container/10 px-4 py-3 text-label-md text-on-primary-container">
              {status}
            </p>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang gửi mã...' : 'Nhận mã OTP'}
            {!isLoading && <MaterialIcon name="arrow_forward" className="text-[20px]" />}
          </Button>
        </form>

        <div className="flex items-center gap-4 py-6">
          <div className="h-px flex-grow bg-outline-variant/30" />
          <span className="font-label-sm text-label-sm text-outline-variant">Hoặc</span>
          <div className="h-px flex-grow bg-outline-variant/30" />
        </div>

        <p className="text-center font-body-md text-body-md text-on-surface-variant">
          Đăng ký tài khoản mới với đầy đủ thông tin?{' '}
          <button
            type="button"
            onClick={onGoToRegister}
            className="font-bold text-primary hover:underline"
          >
            Đăng ký ngay
          </button>
        </p>
      </main>

      <footer className="mt-auto px-margin-mobile py-8 text-center">
        <p className="mx-auto max-w-[280px] font-label-sm text-label-sm leading-relaxed text-on-surface-variant">
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <a className="font-bold text-primary hover:underline" href="#">
            Điều khoản
          </a>{' '}
          &amp;{' '}
          <a className="font-bold text-primary hover:underline" href="#">
            Chính sách
          </a>{' '}
          của chúng tôi
        </p>
      </footer>
    </div>
  )
}
