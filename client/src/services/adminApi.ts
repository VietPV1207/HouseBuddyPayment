import { apiRequest } from './apiClient'

export interface AdminCustomer {
  _id: string
  phoneNumber: string
  email?: string
  accountStatus: string
  createdAt: string
  fullName: string
  gPointBalance: number
  gender?: string
  age?: number
  address?: Array<{
    label?: string
    street: string
    ward?: string
    district?: string
    city: string
  }>
}

export interface AdminHelper {
  _id: string
  phoneNumber: string
  email?: string
  accountStatus: string
  createdAt: string
  fullName: string
  skills: string[]
  rating: number
  workStatus: string
  identityVerified: boolean
  helperInfo?: {
    fullName?: string
    skills?: string[]
    age?: number
    gender?: string
    address?: string
  }
}

export interface AdminVoucherPolicy {
  _id: string
  code: string
  value: number
  discountType: 'value' | 'percentage'
  expiryDate: string
  usageLimit: number
  isTransferable: boolean
  stackingRule: 'allow' | 'disallow'
  isActive: boolean
  createdAt: string
}

export interface AdminServiceCategory {
  _id: string
  name: string
  description?: string
  isActive: boolean
}

export interface AdminDurationTier {
  _id?: string
  duration: number
  priceMultiplier?: number
  price?: number
}

export interface AdminServicePackage {
  _id: string
  categoryId?: string
  categoryName: string
  packageName: string
  basePrice: number
  description?: string
  imageUrl?: string
  isActive: boolean
  durationTiers: AdminDurationTier[]
}

export interface AdminTask {
  _id: string
  serviceId: string
  taskName: string
  price: number
  estimatedTime?: number
  note?: string
}

export interface AdminPricingRecord {
  _id: string
  serviceId: string
  zoneId: string
  basePrice: number
  priceAdjustment: number
  effectiveFrom: string
  effectiveTo: string
}

export interface AdminBooking {
  _id: string
  customerId: string
  customerName: string
  helperId?: string
  helperName?: string
  serviceId?: string
  serviceSnapshot?: {
    name: string
    category: string
    basePrice: number
  }
  scheduledTime: string
  duration: number
  totalAmount: number
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'AWAITING_PAYMENT' | 'PAID' | 'FINISHED' | 'REVIEWED' | 'CANCELLED'
  tasks: string[]
  note?: string
  voucherCode?: string
  address?: {
    street: string
    ward?: string
    district?: string
    city: string
  }
  createdAt: string
}

export function getBookings(): Promise<AdminBooking[]> {
  return apiRequest<AdminBooking[]>('/api/admin/bookings')
}

// ==========================================
// UC-21: Customer Account API
// ==========================================
export function getCustomers(status?: string): Promise<AdminCustomer[]> {
  const query = status ? `?status=${status}` : ''
  return apiRequest<AdminCustomer[]>(`/api/admin/customers${query}`)
}

export function updateCustomerStatus(
  customerId: string,
  status: string,
  notes?: string,
): Promise<{ message: string; user: Partial<AdminCustomer> }> {
  return apiRequest<{ message: string; user: Partial<AdminCustomer> }>(
    `/api/admin/customers/${customerId}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    },
  )
}

// ==========================================
// UC-22: Helper Record API
// ==========================================
export function getPendingHelpers(): Promise<AdminHelper[]> {
  return apiRequest<AdminHelper[]>('/api/admin/helpers/pending')
}

export function getAllHelpers(): Promise<AdminHelper[]> {
  return apiRequest<AdminHelper[]>('/api/admin/helpers')
}

export function approveHelper(
  userId: string,
): Promise<{ message: string; user: Partial<AdminHelper>; helper: { _id: string } }> {
  return apiRequest<{ message: string; user: Partial<AdminHelper>; helper: { _id: string } }>(
    `/api/admin/approve-helper/${userId}`,
    {
      method: 'PUT',
    },
  )
}

export function rejectHelper(
  userId: string,
  notes?: string,
): Promise<{ message: string; user: Partial<AdminHelper> }> {
  return apiRequest<{ message: string; user: Partial<AdminHelper> }>(
    `/api/admin/helpers/${userId}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ notes }),
    },
  )
}

export function updateHelperStatus(
  helperId: string,
  status: string,
  notes?: string,
): Promise<{ message: string; user: Partial<AdminHelper> }> {
  return apiRequest<{ message: string; user: Partial<AdminHelper> }>(
    `/api/admin/helpers/${helperId}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    },
  )
}

// ==========================================
// UC-24: Voucher Policy API
// ==========================================
export function getVoucherPolicies(activeOnly = false): Promise<AdminVoucherPolicy[]> {
  const query = activeOnly ? '?activeOnly=true' : ''
  return apiRequest<AdminVoucherPolicy[]>(`/api/admin/voucher-policies${query}`)
}

export function createVoucherPolicy(
  policy: Omit<AdminVoucherPolicy, '_id' | 'createdAt'>,
): Promise<{ message: string; policy: AdminVoucherPolicy }> {
  return apiRequest<{ message: string; policy: AdminVoucherPolicy }>(
    '/api/admin/voucher-policies',
    {
      method: 'POST',
      body: JSON.stringify(policy),
    },
  )
}

export function updateVoucherPolicy(
  policyId: string,
  updates: Partial<AdminVoucherPolicy>,
): Promise<{ message: string; policy: AdminVoucherPolicy }> {
  return apiRequest<{ message: string; policy: AdminVoucherPolicy }>(
    `/api/admin/voucher-policies/${policyId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
  )
}

export function grantVoucherToCustomer(
  policyId: string,
  customerId: string,
  notes?: string,
): Promise<{ message: string; voucher: unknown }> {
  return apiRequest<{ message: string; voucher: unknown }>('/api/admin/vouchers/grant', {
    method: 'POST',
    body: JSON.stringify({ policyId, customerId, notes }),
  })
}

// ==========================================
// UC-23: Service & Pricing API
// ==========================================

// Service Categories
export function getServiceCategories(): Promise<AdminServiceCategory[]> {
  return apiRequest<AdminServiceCategory[]>('/api/admin/service-categories')
}

export function createServiceCategory(
  category: { name: string; description?: string },
): Promise<{ message: string; category: AdminServiceCategory }> {
  return apiRequest<{ message: string; category: AdminServiceCategory }>(
    '/api/admin/service-categories',
    {
      method: 'POST',
      body: JSON.stringify(category),
    },
  )
}

export function updateServiceCategory(
  categoryId: string,
  updates: { name?: string; description?: string },
): Promise<{ message: string; category: AdminServiceCategory }> {
  return apiRequest<{ message: string; category: AdminServiceCategory }>(
    `/api/admin/service-categories/${categoryId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
  )
}

// Service Packages
export function getServicePackages(): Promise<AdminServicePackage[]> {
  return apiRequest<AdminServicePackage[]>('/api/admin/services')
}

export function createServicePackage(
  service: Omit<AdminServicePackage, '_id' | 'isActive'>,
): Promise<{ message: string; servicePackage: AdminServicePackage }> {
  return apiRequest<{ message: string; servicePackage: AdminServicePackage }>('/api/admin/services', {
    method: 'POST',
    body: JSON.stringify(service),
  })
}

export function updateServicePackage(
  serviceId: string,
  updates: Partial<AdminServicePackage>,
): Promise<{ message: string; servicePackage: AdminServicePackage }> {
  return apiRequest<{ message: string; servicePackage: AdminServicePackage }>(
    `/api/admin/services/${serviceId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
  )
}

export function deactivateServicePackage(
  serviceId: string,
  force = false,
): Promise<{ message: string; servicePackage: AdminServicePackage; hasFutureBookings?: boolean }> {
  const query = force ? '?force=true' : ''
  return apiRequest<{ message: string; servicePackage: AdminServicePackage; hasFutureBookings?: boolean }>(
    `/api/admin/services/${serviceId}/deactivate${query}`,
    {
      method: 'PUT',
    },
  )
}

export function updateDurationTiers(
  serviceId: string,
  durationTiers: AdminDurationTier[],
): Promise<{ message: string; servicePackage: AdminServicePackage }> {
  return apiRequest<{ message: string; servicePackage: AdminServicePackage }>(
    `/api/admin/services/${serviceId}/duration-tiers`,
    {
      method: 'PUT',
      body: JSON.stringify({ durationTiers }),
    },
  )
}

// Tasks & Add-ons
export function getTasksForService(serviceId: string): Promise<AdminTask[]> {
  // Can get them via getActiveServices in bookingApi, or here we can fetch lists
  return apiRequest<AdminTask[]>(`/api/admin/services/${serviceId}/tasks`)
}

export function createTaskOrAddon(
  serviceId: string,
  task: { taskName: string; price?: number; estimatedTime?: number; note?: string },
): Promise<{ message: string; task: AdminTask }> {
  return apiRequest<{ message: string; task: AdminTask }>(
    `/api/admin/services/${serviceId}/tasks`,
    {
      method: 'POST',
      body: JSON.stringify(task),
    },
  )
}

export function updateTaskOrAddon(
  taskId: string,
  updates: { taskName?: string; price?: number; estimatedTime?: number; note?: string },
): Promise<{ message: string; task: AdminTask }> {
  return apiRequest<{ message: string; task: AdminTask }>(`/api/admin/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function deleteTaskOrAddon(
  taskId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/admin/tasks/${taskId}`, {
    method: 'DELETE',
  })
}

// Zone Pricing
export function getPricingRecords(): Promise<AdminPricingRecord[]> {
  return apiRequest<AdminPricingRecord[]>('/api/admin/pricing-records')
}

export function updateZonePrice(
  record: Omit<AdminPricingRecord, '_id'>,
): Promise<{ message: string; pricingRecord: AdminPricingRecord }> {
  return apiRequest<{ message: string; pricingRecord: AdminPricingRecord }>(
    '/api/admin/pricing-records',
    {
      method: 'POST',
      body: JSON.stringify(record),
    },
  )
}
