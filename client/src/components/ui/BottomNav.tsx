import { MaterialIcon } from './MaterialIcon'

export type BottomNavTab = 'home' | 'orders' | 'notifications' | 'account'

type BottomNavItem = {
  tab: BottomNavTab
  label: string
  icon: string
}

const items: BottomNavItem[] = [
  { tab: 'home', label: 'Trang chủ', icon: 'home' },
  { tab: 'orders', label: 'Hoạt động', icon: 'assignment' },
  { tab: 'notifications', label: 'Thông báo', icon: 'notifications' },
  { tab: 'account', label: 'Tài khoản', icon: 'person' },
]

type BottomNavProps = {
  active: BottomNavTab
  onChange: (tab: BottomNavTab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="safe-area-bottom fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl bg-surface-container-lowest px-2 pt-2 shadow-[0_-4px_20px_rgba(17,24,39,0.06)]">
      {items.map((item) => {
        const isActive = item.tab === active
        return (
          <button
            key={item.tab}
            type="button"
            onClick={() => onChange(item.tab)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-1 transition-transform duration-150 active:scale-90 ${
              isActive
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <MaterialIcon name={item.icon} filled={isActive} />
            <span className="text-label-sm font-label-sm">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
