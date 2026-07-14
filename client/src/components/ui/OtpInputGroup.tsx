import { useRef } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'

type OtpInputGroupProps = {
  length?: number
  value: string
  onChange: (value: string) => void
  error?: boolean
  disabled?: boolean
}

export function OtpInputGroup({
  length = 6,
  value,
  onChange,
  error,
  disabled,
}: OtpInputGroupProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(length, ' ').split('')
    chars[index] = digit || ' '
    onChange(chars.join('').trimEnd())
  }

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setDigit(index, digit)
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      event.preventDefault()
      onChange(pasted)
      inputsRef.current[Math.min(pasted.length, length - 1)]?.focus()
    }
  }

  return (
    <div className="flex justify-between gap-2 md:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          aria-label={`Số thứ ${index + 1} của mã OTP`}
          className={`aspect-square w-full rounded-xl border-2 bg-surface-container-lowest text-center font-headline-lg text-headline-lg text-on-surface outline-none transition-all focus:border-primary-container disabled:opacity-60 ${
            error ? 'border-error' : 'border-outline-variant'
          }`}
        />
      ))}
    </div>
  )
}
