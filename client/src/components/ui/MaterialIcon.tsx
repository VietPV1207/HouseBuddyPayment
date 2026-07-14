type MaterialIconProps = {
  name: string
  filled?: boolean
  className?: string
}

export function MaterialIcon({ name, filled, className = '' }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
