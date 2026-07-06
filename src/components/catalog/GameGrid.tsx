import type { Game } from "../../data/types"
import { GameCard } from "./GameCard"

export function GameGrid({ games, onOpen }: { games: Game[]; onOpen: (game: Game) => void }) {
  if (games.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-cosmic-850 py-16 text-center text-white/50">
        No encontramos juegos con esa búsqueda. Probá con otro nombre.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} onOpen={onOpen} />
      ))}
    </div>
  )
}
