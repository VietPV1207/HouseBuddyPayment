type SegmentedOption<T extends string> = { value: T; label: string }

type SegmentedControlProps<T extends string> = {
  options: [SegmentedOption<T>, SegmentedOption<T>]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      className="flex gap-1 rounded-xl bg-surface-container-low p-1"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`flex-grow rounded-lg px-4 py-2 font-label-md text-label-md transition-all ${
              active
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-white/50'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
