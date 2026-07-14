import type { AdminServiceCategory, AdminServicePackage } from '../../services/adminApi'
import {
  CreateCategoryModal,
  CreatePackageModal,
  AddDurationTierModal,
  AddTaskModal,
} from '../../components/admin/ServicePricingModals'

interface ServicesTabProps {
  categories: AdminServiceCategory[]
  services: AdminServicePackage[]
  onCreateCategory: (name: string, description: string) => Promise<void>
  onCreatePackage: (categoryId: string, packageName: string, basePrice: number, description: string) => Promise<void>
  onDeactivatePackage: (serviceId: string) => Promise<void>
  onAddDurationTier: (duration: number, price: number) => Promise<void>
  onAddTask: (taskName: string, price: number, note: string) => Promise<void>
  showCategoryModal: boolean
  setShowCategoryModal: (show: boolean) => void
  showPackageModal: boolean
  setShowPackageModal: (show: boolean) => void
  selectedPkgForTiers: AdminServicePackage | null
  setSelectedPkgForTiers: (pkg: AdminServicePackage | null) => void
  selectedPkgForTask: AdminServicePackage | null
  setSelectedPkgForTask: (pkg: AdminServicePackage | null) => void
}

export function ServicesTab({
  categories,
  services,
  onCreateCategory,
  onCreatePackage,
  onDeactivatePackage,
  onAddDurationTier,
  onAddTask,
  showCategoryModal,
  setShowCategoryModal,
  showPackageModal,
  setShowPackageModal,
  selectedPkgForTiers,
  setSelectedPkgForTiers,
  selectedPkgForTask,
  setSelectedPkgForTask,
}: ServicesTabProps) {
  return (
    <div className="grid gap-6">
      <div className="flex gap-3 justify-end">
        <button
          className="rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
          onClick={() => setShowCategoryModal(true)}
        >
          ➕ Thêm Danh mục
        </button>
        <button
          className="rounded-[10px] bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
          onClick={() => setShowPackageModal(true)}
        >
          ➕ Thêm Gói dịch vụ
        </button>
      </div>

      {/* Service Categories list */}
      <div className="rounded-2xl border border-[#d9e5e2] bg-white p-6 shadow-soft">
        <h3 className="text-lg font-bold text-brand-900">📂 Danh mục Dịch vụ</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {categories.map((cat) => (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4" key={cat._id}>
              <p className="font-extrabold text-brand-900">{cat.name}</p>
              <p className="text-xs text-gray-500 mt-1">{cat.description || 'Chưa cập nhật mô tả.'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Service Packages list */}
      <div className="rounded-2xl border border-[#d9e5e2] bg-white p-6 shadow-soft overflow-x-auto">
        <h3 className="text-lg font-bold text-brand-900">🛠️ Gói dịch vụ (Packages) & Biểu giá</h3>
        <table className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="border-b border-[#e1e9e7] text-xs font-bold uppercase tracking-wider text-brand-500">
              <th className="py-3 px-4">Gói dịch vụ</th>
              <th className="py-3 px-4">Danh mục</th>
              <th className="py-3 px-4">Giá cơ bản</th>
              <th className="py-3 px-4">Bậc thời gian</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {services.map((s) => (
              <tr key={s._id}>
                <td className="py-3.5 px-4 font-bold text-brand-900">{s.packageName}</td>
                <td className="py-3.5 px-4 text-xs text-gray-500">{s.categoryName}</td>
                <td className="py-3.5 px-4 font-semibold text-brand-800">{s.basePrice.toLocaleString()} VND</td>
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1.5">
                    {s.durationTiers?.map((t, idx) => (
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700" key={idx}>
                        {t.duration}h: {t.price ? `${t.price.toLocaleString()} VND` : `x${t.priceMultiplier}`}
                      </span>
                    ))}
                    {(!s.durationTiers || s.durationTiers.length === 0) && (
                      <span className="text-xs text-gray-400">Chưa cấu hình</span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {s.isActive ? 'Hoạt động' : 'Dừng'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    className="rounded-[8px] bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100"
                    onClick={() => setSelectedPkgForTiers(s)}
                  >
                    ⚙️ Thêm Bậc giờ
                  </button>
                  <button
                    className="rounded-[8px] bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                    onClick={() => {
                      setSelectedPkgForTask(s)
                    }}
                  >
                    ➕ Thêm Add-on
                  </button>
                  {s.isActive && (
                    <button
                      className="rounded-[8px] bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                      onClick={() => onDeactivatePackage(s._id)}
                    >
                      Dừng gói
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCategoryModal && (
        <CreateCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={onCreateCategory}
        />
      )}

      {showPackageModal && (
        <CreatePackageModal
          categories={categories}
          onClose={() => setShowPackageModal(false)}
          onSave={onCreatePackage}
        />
      )}

      {selectedPkgForTiers && (
        <AddDurationTierModal
          packageName={selectedPkgForTiers.packageName}
          onClose={() => setSelectedPkgForTiers(null)}
          onSave={onAddDurationTier}
        />
      )}

      {selectedPkgForTask && (
        <AddTaskModal
          packageName={selectedPkgForTask.packageName}
          onClose={() => setSelectedPkgForTask(null)}
          onSave={onAddTask}
        />
      )}
    </div>
  )
}
