import type { AdminCustomer } from '../../services/adminApi'
import { CustomerStatusModal } from '../../components/admin/UserManagementModals'

interface CustomersTabProps {
  customers: AdminCustomer[]
  onUpdateStatus: (status: string, notes: string) => Promise<void>
  setSelectedCustomer: (customer: AdminCustomer | null) => void
  selectedCustomer: AdminCustomer | null
}

export function CustomersTab({
  customers,
  onUpdateStatus,
  setSelectedCustomer,
  selectedCustomer,
}: CustomersTabProps) {
  return (
    <div className="rounded-2xl border border-[#d9e5e2] bg-white p-6 shadow-soft overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#e1e9e7] text-xs font-bold uppercase tracking-wider text-brand-500">
            <th className="py-3 px-4">Tên Khách hàng</th>
            <th className="py-3 px-4">Liên hệ</th>
            <th className="py-3 px-4">Số dư G-Point</th>
            <th className="py-3 px-4">Trạng thái</th>
            <th className="py-3 px-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {customers.map((c) => (
            <tr key={c._id}>
              <td className="py-3.5 px-4 font-bold text-brand-900">{c.fullName || 'Khách vãng lai'}</td>
              <td className="py-3.5 px-4">
                <p>{c.phoneNumber}</p>
                <p className="text-xs text-gray-400">{c.email}</p>
              </td>
              <td className="py-3.5 px-4 font-semibold text-brand-700">{c.gPointBalance} GP</td>
              <td className="py-3.5 px-4">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  c.accountStatus === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : c.accountStatus === 'locked'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {c.accountStatus}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <button
                  className="rounded-[8px] border border-[#cde0dc] bg-white px-3 py-1.5 text-xs font-bold text-brand-900 transition hover:bg-brand-50"
                  onClick={() => setSelectedCustomer(c)}
                >
                  Đổi trạng thái
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCustomer && (
        <CustomerStatusModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onSave={onUpdateStatus}
        />
      )}
    </div>
  )
}
