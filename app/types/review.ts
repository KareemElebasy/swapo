export interface Review {
  id: string
  authorId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface RatingSummary {
  average: number
  count: number
}
