export interface HomeResponse {
  banners: Banner[]
  quickServices: QuickService[]
  featuredEvent: FeaturedEvent
  unreadNotificationsCount: number
}

export interface Banner {
  id: number
  title: string
  subtitle: string
  imageUrl: string
  actionUrl: string | null
  type: string
}

export interface QuickService {
  id: number
  name: string
  description: string
  icon: string
  endpoint: string
  imageUrl: string | null
  isActive: boolean
  displayOrder: number
  type: string
}

export interface FeaturedEvent {
  id: number
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  imageUrl: string | null
  maxParticipants: number
  currentParticipants: number
  status: string
  countdown: any
}