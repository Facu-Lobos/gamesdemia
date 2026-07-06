import type { Game } from "../data/types"

export type PlatformFilterValue = "ALL" | "PS4" | "PS5" | "PS4/PS5"
export type SortMode = "ALPHA" | "PRICE_ASC" | "PRICE_DESC"

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’´`]/g, "")
}

export function filterAndSortGames(
  games: Game[],
  query: string,
  platform: PlatformFilterValue,
  sort: SortMode,
): Game[] {
  const normalizedQuery = normalize(query.trim())

  let result = normalizedQuery
    ? games.filter((game) => normalize(game.title).includes(normalizedQuery))
    : games

  if (platform !== "ALL") {
    result = result.filter((game) => game.platform === platform)
  }

  result = [...result]
  if (sort === "PRICE_ASC") {
    result.sort((a, b) => a.priceArs - b.priceArs)
  } else if (sort === "PRICE_DESC") {
    result.sort((a, b) => b.priceArs - a.priceArs)
  } else {
    result.sort((a, b) => a.title.localeCompare(b.title, "es"))
  }

  return result
}
