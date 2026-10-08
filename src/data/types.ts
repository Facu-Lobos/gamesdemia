export type Platform = "PS4" | "PS5" | "PS4/PS5"

export interface Game {
  id: string
  title: string
  platform: Platform
  priceArs: number
  description?: string
  videoId?: string
  coverImageUrl?: string
}

export interface CatalogMeta {
  offerExpiration: string | null
  totalCount: number
  generatedAt: string
  sourceFile: string
}

export interface Catalog {
  meta: CatalogMeta
  games: Game[]
}
