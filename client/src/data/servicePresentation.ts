
type CategoryPresentation = {
  rating: number
  reviewCount: number
  excluded: string[]
  priceUnit: 'giờ' | 'lượt'
  isChildPickup?: boolean
  icon: string
  image: string
}

const cleaningPreset: CategoryPresentation = {
  rating: 4.8,
  reviewCount: 1200,
  excluded: ['Di chuyển đồ nội thất nặng', 'Sửa chữa điện/nước'],
  priceUnit: 'giờ',
  icon: 'cleaning_services',
  image: '/services/don-dep.jpg',
}

const cookingPreset: CategoryPresentation = {
  rating: 4.9,
  reviewCount: 120,
  excluded: ['Tiền nguyên liệu/thực phẩm (khách tự chi)', 'Nấu tiệc quy mô lớn'],
  priceUnit: 'giờ',
  icon: 'cooking',
  image: '/services/nau-an.jpg',
}

const childPickupPreset: CategoryPresentation = {
  rating: 4.9,
  reviewCount: 500,
  excluded: ['Trông giữ trẻ ngoài thời gian đưa đón', 'Điểm đến phát sinh ngoài lộ trình đã đặt'],
  priceUnit: 'lượt',
  isChildPickup: true,
  icon: 'school',
  image: '/services/dua-don-tre.jpg',
}

const defaultPresentation: CategoryPresentation = {
  rating: 5,
  reviewCount: 0,
  excluded: [],
  priceUnit: 'giờ',
  icon: 'home_repair_service',
  image: '/services/logo.jpg',
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
}

// `text` is category + package name concatenated, so keywords in either match.
export function getCategoryPresentation(text: string): CategoryPresentation {
  const t = normalize(text)
  if (t.includes('dua don') || t.includes('tre')) return childPickupPreset
  if (t.includes('nau')) return cookingPreset
  if (t.includes('don') || t.includes('lau') || t.includes('ve sinh')) return cleaningPreset
  return defaultPresentation
}

const taskIcons: Record<string, string> = {
  'Giặt là': 'dry_cleaning',
  'Vệ sinh tủ lạnh': 'kitchen',
  'Vệ sinh trong tủ bếp': 'shelves',
  'Rửa bát sau ăn': 'flatware',
  'Nấu món cầu kỳ/đại tiệc': 'restaurant_menu',
}

export function getTaskIcon(taskName: string): string {
  return taskIcons[taskName] || 'add_task'
}
