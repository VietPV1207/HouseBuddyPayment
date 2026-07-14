import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-container text-on-primary-container shadow-[0px_4px_20px_rgba(18,184,134,0.3)] hover:opacity-90',
  secondary:
    'bg-white text-primary border-[1.5px] border-primary hover:bg-primary-container/5',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-low',
}

export function Button({
  variant = 'primary',
  fullWidth = true,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 font-label-md text-label-md transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
