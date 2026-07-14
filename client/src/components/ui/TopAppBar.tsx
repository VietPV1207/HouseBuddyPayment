import type { ReactNode } from 'react'
import { MaterialIcon } from './MaterialIcon'

type TopAppBarProps = {
  title?: string
  onBack?: () => void
  centered?: boolean
  right?: ReactNode
}

export function TopAppBar({ title, onBack, centered, right }: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-20 w-full items-center bg-surface px-margin-mobile">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại"
          className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low active:scale-95"
        >
          <MaterialIcon name="arrow_back" />
        </button>
      )}
      {title && (
        <h1
          className={`font-headline-lg-mobile text-headline-lg-mobile text-primary ${onBack ? 'ml-2' : ''} ${centered ? 'flex-1 text-center' : ''}`}
        >
          {title}
        </h1>
      )}
      {centered && onBack && !right && <div className="w-10 shrink-0" />}
      {right && <div className="ml-auto shrink-0">{right}</div>}
    </header>
  )
}
