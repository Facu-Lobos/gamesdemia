import { useState } from "react"
import catalog from "./data/games.json"
import { getFeaturedGames } from "./data/featured"
import type { Game } from "./data/types"
import { CatalogSection } from "./components/catalog/CatalogSection"
import { GameplayModal } from "./components/catalog/GameplayModal"
import { FeaturedSection } from "./components/featured/FeaturedSection"
import { Hero } from "./components/hero/Hero"
import { Footer } from "./components/layout/Footer"
import { Header } from "./components/layout/Header"

const games = catalog.games as Game[]
const featuredGames = getFeaturedGames(games)

export default function App() {
  const [activeGame, setActiveGame] = useState<Game | null>(null)

  return (
    <div className="min-h-screen">
      <Header />
      <Hero totalCount={catalog.meta.totalCount} offerExpiration={catalog.meta.offerExpiration} />
      <FeaturedSection games={featuredGames} onOpen={setActiveGame} />
      <CatalogSection games={games} onOpen={setActiveGame} />
      <Footer totalCount={catalog.meta.totalCount} offerExpiration={catalog.meta.offerExpiration} />
      {activeGame && <GameplayModal game={activeGame} onClose={() => setActiveGame(null)} />}
    </div>
  )
}
