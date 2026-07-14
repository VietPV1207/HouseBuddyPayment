import { useState } from 'react'
import type { AdminCustomer, AdminHelper } from '../../services/adminApi'

interface CustomerStatusModalProps {
  customer: AdminCustomer
  onClose: () => void
  onSave: (status: string, notes: string) => Promise<void>
}

export function CustomerStatusModal({ customer, onClose, onSave }: CustomerStatusModalProps) {
  const [status, setStatus] = useState(customer.accountStatus)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSave(status, notes)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-brand-900">Thay đổi trạng thái khách hàng</h3>
        <p className="text-xs text-gray-500 mt-1">Khách hàng: {customer.fullName} ({customer.phoneNumber})</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Trạng thái mới</label>
            <select
              className="mt-1 w-full rounded-lg border border-[#cde0dc] bg-white px-3 py-2 text-sm focus:border-brand-500 outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active (Hoạt động)</option>
              <option value="locked">Locked (Khóa nợ/Tài chính)</option>
              <option value="banned">Banned (Cấm tài khoản)</option>
              <option value="inactive">Inactive (Không hoạt động)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Lý do thay đổi (notes)</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm focus:border-brand-500 outline-none"
              rows={3}
              placeholder="Nhập lý do..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 text-sm">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 font-bold hover:bg-gray-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="rounded-lg bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface HelperStatusModalProps {
  helper: AdminHelper
  onClose: () => void
  onSave: (status: string, notes: string) => Promise<void>
}

export function HelperStatusModal({ helper, onClose, onSave }: HelperStatusModalProps) {
  const [status, setStatus] = useState(helper.accountStatus)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSave(status, notes)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-brand-900">Thay đổi trạng thái Helper</h3>
        <p className="text-xs text-gray-500 mt-1">Người giúp việc: {helper.fullName}</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Trạng thái mới</label>
            <select
              className="mt-1 w-full rounded-lg border border-[#cde0dc] bg-white px-3 py-2 text-sm focus:border-brand-500 outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active (Hoạt động)</option>
              <option value="locked">Locked (Khóa tài khoản)</option>
              <option value="banned">Banned (Cấm vĩnh viễn)</option>
              <option value="inactive">Inactive (Hủy kích hoạt)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Lý do thay đổi (notes)</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm focus:border-brand-500 outline-none"
              rows={3}
              placeholder="Nhập lý do..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 text-sm">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 font-bold hover:bg-gray-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="rounded-lg bg-brand-600 px-4 py-2 font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface HelperRejectModalProps {
  onClose: () => void
  onSave: (notes: string) => Promise<void>
}

export function HelperRejectModal({ onClose, onSave }: HelperRejectModalProps) {
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSave(notes)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-brand-900">Từ chối hồ sơ ứng viên</h3>
        <p className="text-xs text-gray-500 mt-1">Lý do từ chối hồ sơ CV người giúp việc.</p>

        <div className="mt-4">
          <label className="text-xs font-bold text-gray-500">Ghi chú từ chối</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm focus:border-brand-500 outline-none"
            rows={3}
            placeholder="Nhập lý do chi tiết..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2 text-sm">
          <button
            className="rounded-lg border border-gray-200 px-4 py-2 font-bold hover:bg-gray-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Từ chối'}
          </button>
        </div>
      </div>
    </div>
  )
}
