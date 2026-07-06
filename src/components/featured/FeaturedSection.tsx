import type { Game } from "../../data/types"
import { FeaturedCard } from "./FeaturedCard"

export function FeaturedSection({ games, onOpen }: { games: Game[]; onOpen: (game: Game) => void }) {
  if (games.length === 0) return null

  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl tracking-wide text-white text-glow-red sm:text-4xl">Destacados</h2>
        <p className="mt-1 text-sm text-white/50">Los más pedidos, al mejor precio.</p>
        <div className="scrollbar-thin mt-6 flex gap-4 overflow-x-auto pb-4">
          {games.map((game) => (
            <FeaturedCard key={game.id} game={game} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  )
}
