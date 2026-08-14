import { normalize } from "../lib/search"
import type { Game } from "./types"

// Franquicias más reconocibles que efectivamente están en el catálogo actual (lista_proveedor.txt).
// Se matchea por substring normalizado; si ninguna coincide, esa entrada simplemente no aparece.
const FEATURED_KEYWORDS = [
  "god of war",
  "the last of us",
  "ghost of tsushima",
  "gran turismo",
  "horizon forbidden west",
  "tekken",
  "diablo",
  "assassins creed",
  "battlefield",
  "call of duty",
  "dragon ball",
  "ratchet & clank",
  "bloodborne",
  "rainbow six",
]

export function getFeaturedGames(games: Game[]): Game[] {
  const featured: Game[] = []
  const seen = new Set<string>()

  for (const keyword of FEATURED_KEYWORDS) {
    const match = games.find((game) => !seen.has(game.id) && normalize(game.title).includes(keyword))
    if (match) {
      featured.push(match)
      seen.add(match.id)
    }
  }

  return featured
}
