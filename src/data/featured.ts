import { normalize } from "../lib/search"
import type { Game } from "./types"

// Los más llamativos del stock actual (lista_proveedor.txt): rearmar en cada actualización de la lista.
// Se matchea por substring normalizado; si ninguna coincide, esa entrada simplemente no aparece.
// Juegos fijos al principio de destacados (por id), en este orden.
const PINNED_IDS = ["gta-6-standard", "gta-6-ultimate", "ea-sports-fc-27-ps5", "ea-sports-fc-27-ps4"]

const FEATURED_KEYWORDS = [
  "resident evil requiem",
  "spider-man 2",
  "red dead redemption 2: ultimate",
  "final fantasy vii rebirth",
  "hogwarts legacy",
  "horizon forbidden west",
  "the last of us part i",
  "cyberpunk 2077",
  "monster hunter wilds",
  "tekken 8",
  "mortal kombat 1: definitive",
  "grand theft auto v",
  "indiana jones",
  "silent hill 2",
  "pragmata",
  "kingdom come: deliverance ii",
  "dying light: the beast",
  "days gone remastered",
  "death stranding",
  "demons souls",
  "bloodborne",
  "ratchet & clank",
  "uncharted",
  "star wars jedi: survivor",
  "assassins creed valhalla ragn",
  "persona 5 royal",
  "lies of p",
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
