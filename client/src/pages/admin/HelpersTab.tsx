import type { AdminHelper } from '../../services/adminApi'
import {
  HelperStatusModal,
  HelperRejectModal,
} from '../../components/admin/UserManagementModals'

interface HelpersTabProps {
  helpers: AdminHelper[]
  pendingHelpers: AdminHelper[]
  onApproveHelper: (id: string) => Promise<void>
  onRejectHelper: (notes: string) => Promise<void>
  onUpdateStatus: (status: string, notes: string) => Promise<void>
  selectedHelper: AdminHelper | null
  setSelectedHelper: (helper: AdminHelper | null) => void
  helperRejectId: string | null
  setHelperRejectId: (id: string | null) => void
}

export function HelpersTab({
  helpers,
  pendingHelpers,
  onApproveHelper,
  onRejectHelper,
  onUpdateStatus,
  selectedHelper,
  setSelectedHelper,
  helperRejectId,
  setHelperRejectId,
}: HelpersTabProps) {
  return (
    <div className="grid gap-8">
      {/* Approvals Grid */}
      <div className="rounded-2xl border border-[#d9e5e2] bg-white p-6 shadow-soft">
        <h3 className="text-lg font-bold text-brand-900">📂 Hồ sơ đăng ký Helper cần phê duyệt ({pendingHelpers.length})</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingHelpers.map((ph) => (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-5" key={ph._id}>
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-brand-900">{ph.helperInfo?.fullName || 'Ứng viên'}</p>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">CV Review</span>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-[#55656a]">
                <p>📞 Điện thoại: {ph.phoneNumber}</p>
                <p>📧 Email: {ph.email}</p>
                <p>📍 Địa chỉ: {ph.helperInfo?.address || 'Chưa cập nhật'}</p>
                <p>🎓 Kỹ năng: {ph.helperInfo?.skills?.join(', ') || 'Chưa cập nhật'}</p>
                <p>👤 Tuổi: {ph.helperInfo?.age} | Giới tính: {ph.helperInfo?.gender}</p>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  className="flex-1 rounded-[8px] bg-brand-600 py-2 text-xs font-bold text-white hover:bg-brand-700"
                  onClick={() => onApproveHelper(ph._id)}
                >
                  Phê duyệt
                </button>
                <button
                  className="flex-1 rounded-[8px] border border-red-200 bg-white py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setHelperRejectId(ph._id)
                  }}
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
          {pendingHelpers.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-gray-400">
              Không còn hồ sơ đăng ký nào chờ duyệt.
            </div>
          )}
        </div>
      </div>

      {/* All Helpers Table */}
      <div className="rounded-2xl border border-[#d9e5e2] bg-white p-6 shadow-soft overflow-x-auto">
        <h3 className="text-lg font-bold text-brand-900">👥 Danh sách tất cả người giúp việc</h3>
        <table className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="border-b border-[#e1e9e7] text-xs font-bold uppercase tracking-wider text-brand-500">
              <th className="py-3 px-4">Tên Helper</th>
              <th className="py-3 px-4">Liên hệ</th>
              <th className="py-3 px-4">Kỹ năng</th>
              <th className="py-3 px-4">Đánh giá</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {helpers.map((h) => (
              <tr key={h._id}>
                <td className="py-3.5 px-4 font-bold text-brand-900">{h.fullName || 'Helper'}</td>
                <td className="py-3.5 px-4">
                  <p>{h.phoneNumber}</p>
                  <p className="text-xs text-gray-400">{h.email}</p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-xs">{h.skills?.join(', ') || 'Chưa cập nhật'}</span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-amber-600">⭐ {h.rating?.toFixed(1) || '0.0'}</td>
                <td className="py-3.5 px-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    h.accountStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : h.accountStatus === 'locked'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {h.accountStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    className="rounded-[8px] border border-[#cde0dc] bg-white px-3 py-1.5 text-xs font-bold text-brand-900 transition hover:bg-brand-50"
                    onClick={() => {
                      setSelectedHelper(h)
                    }}
                  >
                    Đổi trạng thái
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: HELPER REJECT NOTE */}
      {helperRejectId && (
        <HelperRejectModal
          onClose={() => setHelperRejectId(null)}
          onSave={onRejectHelper}
        />
      )}

      {/* MODAL: HELPER STATUS */}
      {selectedHelper && (
        <HelperStatusModal
          helper={selectedHelper}
          onClose={() => setSelectedHelper(null)}
          onSave={onUpdateStatus}
        />
      )}
    </div>
  )
}
