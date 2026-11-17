import { normalize } from "../lib/search"
import type { Game } from "./types"

// Los más llamativos del stock actual (lista_proveedor.txt): rearmar en cada actualización de la lista.
// Se matchea por substring normalizado; si ninguna coincide, esa entrada simplemente no aparece.
// Juegos fijos al principio de destacados (por id), en este orden.
const PINNED_IDS = ["gta-6-standard", "gta-6-ultimate", "ea-fc-27"]

const FEATURED_KEYWORDS = [
  "wolverine",
  "007 first light",
  "death stranding 2",
  "astro bot",
  "god of war ragnar",
  "horizon forbidden west",
  "silent hill f",
  "silent hill 2",
  "tekken 8",
  "mafia: the old country",
  "miles morales",
  "nioh 3",
  "mortal shell ii",
  "dark souls iii",
  "hitman",
  "dispatch",
  "lost soul aside",
  "dragon ball z: kakarot",
  "rise of the ronin",
  "sackboy",
  "diablo",
  "the last of us",
  "ratchet & clank",
  "yakuza kiwami",
]

export function getFeaturedGames(games: Game[]): Game[] {
  const featured: Game[] = []
  const seen = new Set<string>()

  for (const id of PINNED_IDS) {
    const match = games.find((game) => game.id === id)
    if (match) {
      featured.push(match)
      seen.add(match.id)
    }
  }

  for (const keyword of FEATURED_KEYWORDS) {
    const match = games.find((game) => !seen.has(game.id) && normalize(game.title).includes(keyword))
    if (match) {
      featured.push(match)
      seen.add(match.id)
    }
  }

  return featured
}
