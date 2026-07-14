import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { BottomNav } from '../components/ui/BottomNav'
import type { BottomNavTab } from '../components/ui/BottomNav'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { MaterialIcon } from '../components/ui/MaterialIcon'
import {
  addSavedAddress,
  deleteSavedAddress,
  editSavedAddress,
  getCustomerProfile,
  updateCustomerProfile,
} from '../services/customerApi'
import type { AuthUser } from '../types/auth'
import type { CustomerProfile, SavedAddress } from '../types/customer'

type AccountPageProps = {
  user: AuthUser
  onNavigate: (tab: BottomNavTab) => void
  onOpenClaims: () => void
  onLogout: () => void
}

const emptyAddress: SavedAddress = {
  label: 'Nhà',
  street: '',
  ward: '',
  district: '',
  city: 'Hà Nội',
}

function addressIcon(label?: string) {
  if (label === 'Văn phòng') return 'business_center'
  return 'home'
}

export function AccountPage({ user, onNavigate, onOpenClaims, onLogout }: AccountPageProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [formState, setFormState] = useState<SavedAddress | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState({ fullName: '', email: '', age: '', gender: '', avatarUrl: '' })

  const loadProfile = () => {
    setIsLoading(true)
    getCustomerProfile(user._id)
      .then((data) => {
        setProfile(data)
        setProfileDraft({
          fullName: data.fullName || '', email: data.email || '', age: data.age?.toString() || '',
          gender: data.gender || '', avatarUrl: data.avatarUrl || '',
        })
        setError('')
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ'))
      .finally(() => setIsLoading(false))
  }

  useEffect(loadProfile, [user._id])

  const startAdd = () => {
    setEditingIndex(null)
    setFormState(emptyAddress)
  }

  const startEdit = (index: number, address: SavedAddress) => {
    setEditingIndex(index)
    setFormState(address)
  }

  const cancelForm = () => {
    setEditingIndex(null)
    setFormState(null)
  }

  const handleSubmitAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formState) return
    setIsSaving(true)
    setError('')

    try {
      if (editingIndex === null) {
        await addSavedAddress(user._id, formState)
      } else {
        await editSavedAddress(user._id, editingIndex, formState)
      }
      cancelForm()
      loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu địa chỉ')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (index: number) => {
    setError('')
    try {
      await deleteSavedAddress(user._id, index)
      loadProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa địa chỉ')
    }
  }

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const data = await updateCustomerProfile(user._id, {
        fullName: profileDraft.fullName.trim(), email: profileDraft.email.trim(),
        age: profileDraft.age ? Number(profileDraft.age) : undefined,
        gender: profileDraft.gender || undefined, avatarUrl: profileDraft.avatarUrl.trim() || undefined,
      })
      setProfile(data.profile)
      setIsEditingProfile(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu thông tin cá nhân')
    } finally { setIsSaving(false) }
  }

  return (
    <div className="min-h-dvh bg-background pb-24 text-on-surface">
      <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-surface px-margin-mobile">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
          Tài khoản
        </h1>
        <MaterialIcon name="favorite" className="text-primary" />
      </header>

      <main className="px-margin-mobile pt-4">
        <section className="mb-6 flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-surface-container-lowest bg-primary-container/10 shadow-md">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <MaterialIcon name="person" className="text-4xl text-primary" />
              )}
            </div>
          </div>
          <h2 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            {isLoading ? '...' : profile?.fullName || 'Người dùng HouseBuddy'}
          </h2>
          <p className="text-body-md text-on-surface-variant">{user.phoneNumber}</p>
          <button type="button" onClick={() => setIsEditingProfile((value) => !value)} className="mt-3 rounded-full border border-primary px-4 py-2 font-label-md text-primary">
            {isEditingProfile ? 'Đóng chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
          </button>
        </section>

        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mb-6 space-y-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
            <Input label="Họ và tên" value={profileDraft.fullName} onChange={(e) => setProfileDraft({ ...profileDraft, fullName: e.target.value })} required />
            <Input label="Email" type="email" value={profileDraft.email} onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Tuổi" type="number" min="16" max="120" value={profileDraft.age} onChange={(e) => setProfileDraft({ ...profileDraft, age: e.target.value })} />
              <label className="space-y-2"><span className="block font-label-md text-on-surface-variant">Giới tính</span><select value={profileDraft.gender} onChange={(e) => setProfileDraft({ ...profileDraft, gender: e.target.value })} className="h-12 w-full rounded-xl border border-outline-variant bg-surface px-3"><option value="">Chưa chọn</option><option value="female">Nữ</option><option value="male">Nam</option><option value="other">Khác</option></select></label>
            </div>
            <Input label="Đường dẫn ảnh đại diện" type="url" value={profileDraft.avatarUrl} onChange={(e) => setProfileDraft({ ...profileDraft, avatarUrl: e.target.value })} />
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}</Button>
          </form>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-error-container px-4 py-3 text-label-md text-on-error-container">
            {error}
          </p>
        )}

        <section className="mb-6">
          <h3 className="mb-3 font-label-md text-label-md uppercase tracking-[0.04em] text-on-surface-variant">
            Sổ địa chỉ
          </h3>
          <div className="space-y-3">
            {profile?.address.map((address, index) => (
              <div
                key={`${address.street}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-[0_4px_20px_rgba(17,24,39,0.06)]"
              >
                <div className="rounded-xl bg-primary-container/10 p-2 text-primary">
                  <MaterialIcon name={addressIcon(address.label)} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-body-md">{address.label || 'Địa chỉ'}</h4>
                  <p className="truncate text-label-sm text-on-surface-variant">
                    {[address.street, address.ward, address.district, address.city]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(index, address)}
                  className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
                  aria-label="Sửa địa chỉ"
                >
                  <MaterialIcon name="edit" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  disabled={(profile?.address.length ?? 0) <= 1}
                  title={
                    (profile?.address.length ?? 0) <= 1
                      ? 'Bạn cần giữ lại ít nhất 1 địa chỉ'
                      : undefined
                  }
                  className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Xóa địa chỉ"
                >
                  <MaterialIcon name="delete" className="text-[20px]" />
                </button>
              </div>
            ))}

            {formState && (
              <form
                onSubmit={handleSubmitAddress}
                className="space-y-3 rounded-2xl border border-primary-container/40 bg-surface-container-lowest p-4"
              >
                <Input
                  label="Nhãn (Nhà, Văn phòng...)"
                  value={formState.label || ''}
                  onChange={(e) => setFormState({ ...formState, label: e.target.value })}
                />
                <Input
                  label="Số nhà, đường"
                  value={formState.street}
                  onChange={(e) => setFormState({ ...formState, street: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Phường/Xã"
                    value={formState.ward || ''}
                    onChange={(e) => setFormState({ ...formState, ward: e.target.value })}
                  />
                  <Input
                    label="Quận/Huyện"
                    value={formState.district || ''}
                    onChange={(e) => setFormState({ ...formState, district: e.target.value })}
                  />
                </div>
                <p className="text-label-sm text-on-surface-variant">
                  Hiện chỉ hỗ trợ địa chỉ tại Hà Nội.
                </p>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={cancelForm}>
                    Hủy
                  </Button>
                </div>
              </form>
            )}

            {!formState && (
              <button
                type="button"
                onClick={startAdd}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/50 py-4 font-label-md text-label-md text-primary transition-colors hover:bg-primary-container/5"
              >
                <MaterialIcon name="add_location_alt" />
                Thêm địa chỉ mới
              </button>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-3 font-label-md text-label-md uppercase tracking-[0.04em] text-on-surface-variant">
            Cài đặt chung
          </h3>
          <div className="divide-y divide-outline-variant/20 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-variant"
            >
              <MaterialIcon name="confirmation_number" className="text-primary" />
              <span className="flex-1 font-body-md text-body-md">Voucher của tôi</span>
              <MaterialIcon name="chevron_right" className="text-on-surface-variant" />
            </button>
            <button
              type="button"
              onClick={onOpenClaims}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-variant"
            >
              <MaterialIcon name="gavel" className="text-primary" />
              <span className="flex-1 font-body-md text-body-md">Yêu cầu bồi thường</span>
              <MaterialIcon name="chevron_right" className="text-on-surface-variant" />
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-variant"
            >
              <MaterialIcon name="description" className="text-primary" />
              <span className="flex-1 font-body-md text-body-md">Điều khoản sử dụng</span>
              <MaterialIcon name="chevron_right" className="text-on-surface-variant" />
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-4 text-left text-error transition-colors hover:bg-error-container/40"
            >
              <MaterialIcon name="logout" />
              <span className="flex-1 font-bold text-body-md">Đăng xuất</span>
            </button>
          </div>
        </section>
      </main>

      <BottomNav active="account" onChange={onNavigate} />
    </div>
  )
}
