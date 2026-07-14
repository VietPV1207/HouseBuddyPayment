export type SavedAddress = {
  label?: string
  street: string
  ward?: string
  district?: string
  city: string
}

export type CustomerProfile = {
  _id: string
  fullName: string
  email: string
  address: SavedAddress[]
  age?: number
  gender?: string
  avatarUrl?: string
  gPointBalance: number
}

export type CustomerClaimStatus = 'PENDING' | 'REVIEWING' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED'

export type CustomerClaim = {
  _id: string
  bookingId: string
  reason: string
  description: string
  evidenceUrls: string[]
  status: CustomerClaimStatus
  createdAt: string
}
