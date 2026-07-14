import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { MaterialIcon } from '../ui/MaterialIcon'
import { SegmentedControl } from '../ui/SegmentedControl'
import { TopAppBar } from '../ui/TopAppBar'
import type { RegisterForm as RegisterFormValues, RegisterRole } from '../../types/auth'

type RegisterScreenProps = {
  form: RegisterFormValues
  isLoading: boolean
  error: string
  onChange: (form: RegisterFormValues) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onBack: () => void
}

const roleOptions: [
  { value: RegisterRole; label: string },
  { value: RegisterRole; label: string },
] = [
  { value: 'customer', label: 'Người dùng' },
  { value: 'helper', label: 'Người giúp việc' },
]

export function RegisterScreen({
  form,
  isLoading,
  error,
  onChange,
  onSubmit,
  onBack,
}: RegisterScreenProps) {
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (form.password !== confirmPassword) {
      event.preventDefault()
      setLocalError('Mật khẩu nhập lại không khớp')
      return
    }
    if (!agreedToTerms) {
      event.preventDefault()
      setLocalError('Vui lòng đồng ý với Điều khoản & Chính sách để tiếp tục')
      return
    }
    setLocalError('')
    onSubmit(event)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-on-background">
      <TopAppBar title="Đăng ký" onBack={onBack} />

      <main className="mx-auto w-full max-w-md flex-grow px-margin-mobile pb-xl pt-lg">
        <div className="mb-xl text-center">
          <div className="mb-md inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container/10">
            <MaterialIcon name="person_add" filled className="text-3xl text-primary-container" />
          </div>
          <h2 className="mb-xs font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            Tạo tài khoản mới
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Tham gia HouseBuddy để trải nghiệm dịch vụ gia đình tốt nhất.
          </p>
        </div>

        <form className="space-y-gutter" onSubmit={handleSubmit}>
          <div className="mb-md space-y-xs">
            <label className="ml-1 block font-label-md text-label-md text-on-surface-variant">
              Bạn là
            </label>
            <SegmentedControl
              ariaLabel="Chọn vai trò đăng ký"
              options={roleOptions}
              value={form.role}
              onChange={(role) => onChange({ ...form, role })}
            />
          </div>

          <Input
            id="full-name"
            label="Họ và tên"
            leadingIcon="person"
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            value={form.fullName}
            onChange={(event) => onChange({ ...form, fullName: event.target.value })}
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            leadingIcon="mail"
            placeholder="example@email.com"
            autoComplete="email"
            value={form.email}
            onChange={(event) => onChange({ ...form, email: event.target.value })}
            required={form.role === 'customer'}
          />

          <Input
            id="phone"
            label="Số điện thoại"
            type="tel"
            leadingIcon="call"
            placeholder="0987654321"
            autoComplete="tel"
            value={form.phoneNumber}
            onChange={(event) => onChange({ ...form, phoneNumber: event.target.value })}
            required
          />

          <Input
            id="password"
            label="Mật khẩu"
            type="password"
            leadingIcon="lock"
            placeholder="••••••••"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => onChange({ ...form, password: event.target.value })}
            required
          />

          <Input
            id="confirm-password"
            label="Nhập lại mật khẩu"
            type="password"
            leadingIcon="lock_reset"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {form.role === 'customer' ? (
            <div className="grid gap-gutter md:grid-cols-[1.3fr_0.7fr]">
              <Input
                id="address"
                label="Địa chỉ"
                leadingIcon="home"
                placeholder="Số nhà, đường, phường/xã"
                value={form.address}
                onChange={(event) => onChange({ ...form, address: event.target.value })}
                required
              />
              <Input
                id="age"
                label="Tuổi"
                type="number"
                min="1"
                leadingIcon="cake"
                placeholder="25"
                value={form.age}
                onChange={(event) => onChange({ ...form, age: event.target.value })}
              />
            </div>
          ) : (
            <div className="grid gap-gutter md:grid-cols-[1.3fr_0.7fr]">
              <Input
                id="identity-number"
                label="Số CCCD"
                leadingIcon="badge"
                placeholder="012345678901"
                value={form.identityNumber}
                onChange={(event) =>
                  onChange({ ...form, identityNumber: event.target.value })
                }
              />
              <Input
                id="experience"
                label="Kinh nghiệm"
                leadingIcon="work_history"
                placeholder="2 năm"
                value={form.experience}
                onChange={(event) => onChange({ ...form, experience: event.target.value })}
              />
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 py-2">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) => setAgreedToTerms(event.target.checked)}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-outline-variant text-primary-container focus:ring-primary-container"
            />
            <span className="font-body-md text-body-md text-on-surface-variant">
              Tôi đồng ý với{' '}
              <a className="font-semibold text-primary hover:underline" href="#">
                Điều khoản
              </a>{' '}
              và{' '}
              <a className="font-semibold text-primary hover:underline" href="#">
                Chính sách
              </a>{' '}
              của HouseBuddy.
            </span>
          </label>

          {(localError || error) && (
            <p className="rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
              {localError || error}
            </p>
          )}

          <Button type="submit" disabled={isLoading} className="mt-lg">
            {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            {!isLoading && <MaterialIcon name="arrow_forward" className="text-[20px]" />}
          </Button>
        </form>

        <div className="mt-xl pb-lg text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Bạn đã có tài khoản?{' '}
            <button
              type="button"
              onClick={onBack}
              className="ml-1 font-bold text-primary hover:underline"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
