import { MaterialIcon } from './MaterialIcon'

export type HelperNavTab = 'home' | 'schedule' | 'jobs' | 'earnings' | 'account'

type HelperNavItem = {
  tab: HelperNavTab
  label: string
  icon: string
}

const items: HelperNavItem[] = [
  { tab: 'home', label: 'Trang chủ', icon: 'home' },
  { tab: 'schedule', label: 'Lịch làm việc', icon: 'calendar_month' },
  { tab: 'jobs', label: 'Đơn của tôi', icon: 'assignment' },
  { tab: 'earnings', label: 'Thu nhập', icon: 'payments' },
  { tab: 'account', label: 'Tài khoản', icon: 'person' },
]

type HelperBottomNavProps = {
  active: HelperNavTab
  onChange: (tab: HelperNavTab) => void
}

export function HelperBottomNav({ active, onChange }: HelperBottomNavProps) {
  return (
    <nav className="safe-area-bottom fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl bg-surface-container-lowest px-1 pt-2 shadow-[0_-4px_20px_rgba(17,24,39,0.06)]">
      {items.map((item) => {
        const isActive = item.tab === active
        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => onChange(item.tab)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 transition-transform duration-150 active:scale-90 ${
              isActive
                ? 'bg-primary-container/10 text-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <MaterialIcon name={item.icon} filled={isActive} />
            <span className="whitespace-nowrap text-[10px] font-label-md">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
