import type { AdminCustomer, AdminVoucherPolicy } from '../../services/adminApi'
import {
  CreateVoucherModal,
  GrantVoucherModal,
} from '../../components/admin/VoucherModals'

interface VouchersTabProps {
  voucherPolicies: AdminVoucherPolicy[]
  customers: AdminCustomer[]
  onCreatePolicy: (policyData: any) => Promise<void>
  onGrantVoucher: (policyId: string, customerId: string, notes: string) => Promise<void>
  onToggleActive: (policyId: string, isActive: boolean) => Promise<void>
  showVoucherModal: boolean
  setShowVoucherModal: (show: boolean) => void
  showGrantModal: boolean
  setShowGrantModal: (show: boolean) => void
}

export function VouchersTab({
  voucherPolicies,
  customers,
  onCreatePolicy,
  onGrantVoucher,
  onToggleActive,
  showVoucherModal,
  setShowVoucherModal,
  showGrantModal,
  setShowGrantModal,
}: VouchersTabProps) {
  return (
    <div className="grid gap-6">
      <div className="flex gap-3 justify-end">
        <button
          className="rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
          onClick={() => setShowVoucherModal(true)}
        >
          ➕ Thêm quy tắc Voucher
        </button>
        <button
          className="rounded-[10px] bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
          onClick={() => setShowGrantModal(true)}
        >
          🎁 Phát voucher đền bù
        </button>
      </div>

      <div className="rounded-2xl border border-[#d9e5e2] bg-white p-6 shadow-soft overflow-x-auto">
        <h3 className="text-lg font-bold text-brand-900">🎟️ Danh sách chính sách khuyến mãi</h3>
        <table className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="border-b border-[#e1e9e7] text-xs font-bold uppercase tracking-wider text-brand-500">
              <th className="py-3 px-4">Mã Voucher</th>
              <th className="py-3 px-4">Giá trị giảm</th>
              <th className="py-3 px-4">Giới hạn sử dụng</th>
              <th className="py-3 px-4">Ngày hết hạn</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {voucherPolicies.map((vp) => (
              <tr key={vp._id}>
                <td className="py-3.5 px-4 font-mono font-bold text-brand-900">{vp.code}</td>
                <td className="py-3.5 px-4 font-semibold text-brand-700">
                  {vp.discountType === 'value' ? `${vp.value.toLocaleString()} VND` : `${vp.value}%`}
                </td>
                <td className="py-3.5 px-4">{vp.usageLimit} lần</td>
                <td className="py-3.5 px-4 text-xs">{new Date(vp.expiryDate).toLocaleDateString('vi-VN')}</td>
                <td className="py-3.5 px-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    vp.isActive && new Date(vp.expiryDate) > new Date()
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {vp.isActive && new Date(vp.expiryDate) > new Date() ? 'Hoạt động' : 'Hết hạn/Tắt'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    className="rounded-[8px] border border-[#cde0dc] bg-white px-3 py-1.5 text-xs font-bold text-brand-900 transition hover:bg-brand-50"
                    onClick={() => onToggleActive(vp._id, !vp.isActive)}
                  >
                    {vp.isActive ? 'Tắt' : 'Bật'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showVoucherModal && (
        <CreateVoucherModal
          onClose={() => setShowVoucherModal(false)}
          onSave={onCreatePolicy}
        />
      )}

      {showGrantModal && (
        <GrantVoucherModal
          voucherPolicies={voucherPolicies}
          customers={customers}
          onClose={() => setShowGrantModal(false)}
          onSave={onGrantVoucher}
        />
      )}
    </div>
  )
}
