import { getCategoryPresentation } from '../data/servicePresentation'

// Keyword-based so it stays correct when admins rename categories.
export function getServiceIcon(category?: string) {
  if (!category) return 'home_repair_service'
  return getCategoryPresentation(category).icon
}
