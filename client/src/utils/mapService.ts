import { getCategoryPresentation, getTaskIcon } from '../data/servicePresentation'
import type { ApiService, ServiceOption } from '../types/booking'

export function mapApiServiceToOption(service: ApiService): ServiceOption {
  const presentation = getCategoryPresentation(
    `${service.categoryName} ${service.packageName}`,
  )
  const durationHours = service.durationTiers.map((tier) => tier.duration).sort((a, b) => a - b)

  return {
    id: service._id,
    name: service.packageName,
    category: service.categoryName,
    description: service.description || '',
    basePrice: service.basePrice,
    priceUnit: presentation.priceUnit,
    durationHours: durationHours.length > 0 ? durationHours : [1],
    heroImage: service.imageUrl || presentation.image,
    rating: presentation.rating,
    reviewCount: presentation.reviewCount,
    included: service.included.map((task) => task.taskName),
    excluded: presentation.excluded,
    addOns: service.addOns.map((task) => ({
      id: task._id,
      name: task.taskName,
      price: task.price,
      icon: getTaskIcon(task.taskName),
    })),
    areaTiers: (service.areaTiers || []).map((tier) => ({
      label: tier.label,
      minArea: tier.minArea,
      maxArea: tier.maxArea,
      price: tier.price,
    })),
    isChildPickup: presentation.isChildPickup,
  }
}
