import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { MaterialIcon } from './MaterialIcon'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  leadingIcon?: string
  error?: string
  prefix?: ReactNode
}

export function Input({
  label,
  leadingIcon,
  error,
  prefix,
  id,
  type,
  className = '',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-xs">
      {label && (
        <label
          htmlFor={id}
          className="ml-1 block font-label-md text-label-md text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <div
        className={`flex h-tap-target-min items-center overflow-hidden rounded-xl border-[1.5px] bg-white transition-all focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container ${error ? 'border-error' : 'border-outline-variant'}`}
      >
        {prefix}
        <div className="flex flex-1 items-center px-4">
          {leadingIcon && (
            <MaterialIcon name={leadingIcon} className="mr-2 text-on-surface-variant/60" />
          )}
          <input
            id={id}
            type={resolvedType}
            className={`w-full border-none bg-transparent font-body-md text-body-md text-on-surface outline-none placeholder:text-outline-variant/60 focus:ring-0 ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="ml-2 shrink-0 text-on-surface-variant/60 transition-colors hover:text-primary"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <MaterialIcon name={showPassword ? 'visibility_off' : 'visibility'} />
            </button>
          )}
        </div>
      </div>
      {error && <p className="ml-1 text-label-sm text-error">{error}</p>}
    </div>
  )
}
