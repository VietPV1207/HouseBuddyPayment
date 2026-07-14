import React, { useState } from 'react'
import type { AdminServiceCategory } from '../../services/adminApi'

interface CreateCategoryModalProps {
  onClose: () => void
  onSave: (name: string, description: string) => Promise<void>
}

export function CreateCategoryModal({ onClose, onSave }: CreateCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(name, description)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold text-brand-900">Thêm Danh mục Dịch vụ</h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Tên danh mục</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              type="text"
              required
              placeholder="Ví dụ: Nấu ăn"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Mô tả ngắn</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              rows={2}
              placeholder="Mô tả danh mục..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 text-sm">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 font-bold hover:bg-gray-50"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="rounded-lg bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  )
}

interface CreatePackageModalProps {
  categories: AdminServiceCategory[]
  onClose: () => void
  onSave: (categoryId: string, packageName: string, basePrice: number, description: string) => Promise<void>
}

export function CreatePackageModal({ categories, onClose, onSave }: CreatePackageModalProps) {
  const [categoryId, setCategoryId] = useState('')
  const [packageName, setPackageName] = useState('')
  const [basePrice, setBasePrice] = useState(100000)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) return
    setIsSubmitting(true)
    try {
      await onSave(categoryId, packageName, basePrice, description)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold text-brand-900">Thêm Gói dịch vụ mới</h3>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Danh mục cha</label>
            <select
              className="mt-1 w-full rounded-lg border border-[#cde0dc] bg-white px-3 py-2 text-sm outline-none"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Tên gói dịch vụ</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              type="text"
              required
              placeholder="Ví dụ: Dọn dẹp tổng thể"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Giá cơ sở (basePrice)</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              type="number"
              required
              min={1000}
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Mô tả dịch vụ</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              rows={2}
              placeholder="Ghi chú chi tiết gói..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 text-sm">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 font-bold hover:bg-gray-50"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo gói'}
          </button>
        </div>
      </form>
    </div>
  )
}

interface AddDurationTierModalProps {
  packageName: string
  onClose: () => void
  onSave: (duration: number, price: number) => Promise<void>
}

export function AddDurationTierModal({ packageName, onClose, onSave }: AddDurationTierModalProps) {
  const [duration, setDuration] = useState(2)
  const [price, setPrice] = useState(200000)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(duration, price)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold text-brand-900">Thêm Bậc thời gian</h3>
        <p className="text-xs text-gray-500 mt-1">Gói: {packageName}</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Thời lượng (Giờ, tối thiểu 2h - GB-21)</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              type="number"
              required
              min={2}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Giá trọn gói của bậc này (VND)</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              type="number"
              required
              min={1000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 text-sm">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 font-bold hover:bg-gray-50"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="rounded-lg bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        </div>
      </form>
    </div>
  )
}

interface AddTaskModalProps {
  packageName: string
  onClose: () => void
  onSave: (taskName: string, price: number, note: string) => Promise<void>
}

export function AddTaskModal({ packageName, onClose, onSave }: AddTaskModalProps) {
  const [taskName, setTaskName] = useState('')
  const [price, setPrice] = useState(0)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(taskName, price, note)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold text-brand-900">Thêm Add-on nhiệm vụ</h3>
        <p className="text-xs text-gray-500 mt-1">Gắn với gói: {packageName}</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Tên Add-on</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              type="text"
              required
              placeholder="Ví dụ: Đi chợ hộ, Là quần áo"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Đơn giá phụ thu (VND, 0 nếu miễn phí)</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              type="number"
              required
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Mô tả/Ghi chú</label>
            <input
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              type="text"
              placeholder="Mô tả công việc..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 text-sm">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 font-bold hover:bg-gray-50"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang thêm...' : 'Thêm Add-on'}
          </button>
        </div>
      </form>
    </div>
  )
}
