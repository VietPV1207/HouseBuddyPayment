export type ServiceAddOn = {
  id: string
  name: string
  price: number
  icon: string
}

export type ServiceAreaTier = {
  label: string
  minArea: number
  maxArea?: number
  price: number
}

export type ServiceOption = {
  id: string
  name: string
  category: string
  description: string
  basePrice: number
  priceUnit: 'giờ' | 'lượt'
  durationHours: number[]
  heroImage: string
  rating: number
  reviewCount: number
  included: string[]
  excluded: string[]
  addOns: ServiceAddOn[]
  areaTiers: ServiceAreaTier[]
  isChildPickup?: boolean
}

export type ApiTask = {
  _id: string
  taskName: string
  price: number
  estimatedTime?: number
  note?: string
}

export type ApiDurationTier = {
  duration: number
  priceMultiplier?: number
  price?: number
}

export type ApiAreaTier = ServiceAreaTier

export type ApiService = {
  _id: string
  categoryName: string
  packageName: string
  basePrice: number
  description?: string
  imageUrl?: string
  isActive: boolean
  durationTiers: ApiDurationTier[]
  areaTiers?: ApiAreaTier[]
  included: ApiTask[]
  addOns: ApiTask[]
}

export type ChildPickupDirection = 'Đưa' | 'Đón' | 'Cả hai'
export type ChildPickupVehicle = 'Xe máy' | 'Ô tô'
export type ChildPickupPlan = 'Dịch vụ lẻ' | 'Theo tuần' | 'Theo tháng'

export type ChildPickupSelections = {
  direction: ChildPickupDirection
  vehicle: ChildPickupVehicle
  childCount: number
  plan: ChildPickupPlan
}

export type BookingDraft = {
  serviceId: string
  duration: number
  address: string
  ward: string
  district: string
  scheduledDate: string
  scheduledTime: string
  note: string
  voucherCode: string
}

export type ApiBooking = {
  _id: string
  serviceSnapshot?: {
    name?: string
    category?: string
    basePrice?: number
  }
  scheduledTime: string
  duration: number
  totalAmount: number
  status: string
  address?: {
    street?: string
    ward?: string
    district?: string
    city?: string
  }
  helperId?: string | null
  customerId?: string
  customerName?: string | null
  customerPhone?: string | null
  helperName?: string | null
  helperPhone?: string | null
  helperRating?: number | null
  helperAvatarUrl?: string | null
  helperSkills?: string[]
  helperIdentityVerified?: boolean
  voucherCode?: string
  note?: string
  createdAt?: string
  reviewedAt?: string
  areaTier?: ServiceAreaTier
  addOns?: Array<{ taskId?: string; name: string; price: number }>
}

export type CreateBookingPayload = {
  serviceId: string
  serviceSnapshot: {
    name: string
    category: string
    basePrice: number
  }
  duration: number
  scheduledTime: string
  address: {
    street: string
    ward?: string
    district?: string
    city: string
  }
  note?: string
  voucherCode?: string
  addOnIds?: string[]
  areaTierIndex?: number
}
