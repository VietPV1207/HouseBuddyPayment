import React, { useState } from 'react'
import type { AdminCustomer, AdminVoucherPolicy } from '../../services/adminApi'

interface CreateVoucherModalProps {
  onClose: () => void
  onSave: (policyData: {
    code: string
    value: number
    discountType: 'value' | 'percentage'
    expiryDate: string
    usageLimit: number
    isTransferable: boolean
    stackingRule: 'allow' | 'disallow'
    isActive: boolean
  }) => Promise<void>
}

export function CreateVoucherModal({ onClose, onSave }: CreateVoucherModalProps) {
  const [code, setCode] = useState('')
  const [value, setValue] = useState(10000)
  const [discountType, setDiscountType] = useState<'value' | 'percentage'>('value')
  const [expiryDate, setExpiryDate] = useState('')
  const [usageLimit, setUsageLimit] = useState(100)
  const [isTransferable, setIsTransferable] = useState(false)
  const stackingRule = 'disallow'
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave({
        code,
        value,
        discountType,
        expiryDate,
        usageLimit,
        isTransferable,
        stackingRule,
        isActive: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold text-brand-900">Thêm quy tắc Voucher</h3>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500">Mã khuyến mãi</label>
              <input
                className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
                type="text"
                required
                placeholder="MÃ10K"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Giá trị giảm</label>
              <input
                className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
                type="number"
                required
                min={1}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500">Loại giảm giá</label>
              <select
                className="mt-1 w-full rounded-lg border border-[#cde0dc] bg-white px-3 py-2 text-sm outline-none"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'value' | 'percentage')}
              >
                <option value="value">Cố định (VND)</option>
                <option value="percentage">Phần trăm (%)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Ngày hết hạn</label>
              <input
                className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500">Giới hạn lượt dùng</label>
              <input
                className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
                type="number"
                required
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Cho phép chuyển nhượng</label>
              <select
                className="mt-1 w-full rounded-lg border border-[#cde0dc] bg-white px-3 py-2 text-sm outline-none"
                value={isTransferable ? 'true' : 'false'}
                onChange={(e) => setIsTransferable(e.target.value === 'true')}
              >
                <option value="false">Không (Thường là đền bù)</option>
                <option value="true">Có</option>
              </select>
            </div>
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
            {isSubmitting ? 'Đang tạo...' : 'Tạo quy tắc'}
          </button>
        </div>
      </form>
    </div>
  )
}

interface GrantVoucherModalProps {
  voucherPolicies: AdminVoucherPolicy[]
  customers: AdminCustomer[]
  onClose: () => void
  onSave: (policyId: string, customerId: string, notes: string) => Promise<void>
}

export function GrantVoucherModal({ voucherPolicies, customers, onClose, onSave }: GrantVoucherModalProps) {
  const [policyId, setPolicyId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!policyId || !customerId) return
    setIsSubmitting(true)
    try {
      await onSave(policyId, customerId, notes)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold text-brand-900">Cấp Voucher đền bù</h3>
        <p className="text-xs text-gray-500 mt-1">Cấp voucher trực tiếp từ chính sách vào ví của một khách hàng.</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Chọn Chính sách Voucher</label>
            <select
              className="mt-1 w-full rounded-lg border border-[#cde0dc] bg-white px-3 py-2 text-sm outline-none"
              required
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
            >
              <option value="">-- Chọn một chính sách --</option>
              {voucherPolicies.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code} (Giảm {p.discountType === 'value' ? `${p.value.toLocaleString()} VND` : `${p.value}%`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Chọn Khách hàng</label>
            <select
              className="mt-1 w-full rounded-lg border border-[#cde0dc] bg-white px-3 py-2 text-sm outline-none"
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">-- Chọn khách hàng nhận --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName || 'Khách vãng lai'} ({c.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">Ghi chú cấp phát</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-[#cde0dc] px-3 py-2 text-sm outline-none"
              rows={2}
              placeholder="Ghi chú đền bù cho sự cố..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            {isSubmitting ? 'Đang cấp...' : 'Cấp Voucher'}
          </button>
        </div>
      </form>
    </div>
  )
}
