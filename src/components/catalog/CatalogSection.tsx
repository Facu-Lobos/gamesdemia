import { useMemo, useState } from "react"
import type { Game } from "../../data/types"
import { filterAndSortGames, type PlatformFilterValue, type SortMode } from "../../lib/search"
import { GameGrid } from "./GameGrid"
import { PlatformFilter } from "./PlatformFilter"
import { SearchBar } from "./SearchBar"
import { SortControl } from "./SortControl"

export function CatalogSection({ games, onOpen }: { games: Game[]; onOpen: (game: Game) => void }) {
  const [query, setQuery] = useState("")
  const [platform, setPlatform] = useState<PlatformFilterValue>("ALL")
  const [sort, setSort] = useState<SortMode>("ALPHA")

  const filtered = useMemo(
    () => filterAndSortGames(games, query, platform, sort),
    [games, query, platform, sort],
  )

  return (
    <section id="catalogo" className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl tracking-wide text-white sm:text-4xl">Catálogo completo</h2>
        <p className="mt-1 text-sm text-white/50">
          {filtered.length} de {games.length} juegos
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={query} onChange={setQuery} />
          <div className="flex flex-wrap items-center gap-3">
            <PlatformFilter value={platform} onChange={setPlatform} />
            <SortControl value={sort} onChange={setSort} />
          </div>
        </div>

        <div className="mt-6">
          <GameGrid games={filtered} onOpen={onOpen} />
        </div>
      </div>
    </section>
  )
}
