import type { Game } from "../../data/types"
import { buildGameWhatsAppUrl } from "../../lib/whatsapp"
import { GameThumbnail } from "../common/GameThumbnail"
import { PlatformBadge } from "../common/PlatformBadge"
import { PriceTag } from "../common/PriceTag"
import { WhatsAppButton } from "../common/WhatsAppButton"

export function GameCard({ game, onOpen }: { game: Game; onOpen: (game: Game) => void }) {
  return (
    <div
      onClick={() => onOpen(game)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-cosmic-850 transition-all hover:-translate-y-1 hover:border-flame-500/50 hover:glow-red"
    >
      <div className="h-28">
        <GameThumbnail game={game} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-white">{game.title}</h3>
        </div>
        <PlatformBadge platform={game.platform} />
        {game.description && <p className="text-xs font-medium text-neon-blue">{game.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <PriceTag priceArs={game.priceArs} />
        </div>
        <WhatsAppButton
          href={buildGameWhatsAppUrl(game)}
          onClick={(e) => e.stopPropagation()}
          className="w-full !py-2 text-xs"
        >
          Consultar
        </WhatsAppButton>
      </div>
    </div>
  )
}
