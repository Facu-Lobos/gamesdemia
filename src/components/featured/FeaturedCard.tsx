import type { Game } from "../../data/types"
import { buildGameWhatsAppUrl } from "../../lib/whatsapp"
import { GameThumbnail } from "../common/GameThumbnail"
import { PlatformBadge } from "../common/PlatformBadge"
import { PriceTag } from "../common/PriceTag"
import { WhatsAppButton } from "../common/WhatsAppButton"

export function FeaturedCard({ game, onOpen }: { game: Game; onOpen: (game: Game) => void }) {
  return (
    <div
      onClick={() => onOpen(game)}
      className="fire-frame group flex min-w-[240px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl transition-transform hover:-translate-y-1 sm:min-w-[260px]"
    >
      <div className="h-32">
        <GameThumbnail game={game} />
      </div>
      <div className="px-5 pt-4">
        <PlatformBadge platform={game.platform} />
        <h3 className="mt-3 font-display text-xl leading-tight tracking-wide text-white group-hover:text-flame-400">
          {game.title}
        </h3>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3 px-5 pb-5">
        <PriceTag priceArs={game.priceArs} />
        <WhatsAppButton
          href={buildGameWhatsAppUrl(game)}
          onClick={(e) => e.stopPropagation()}
          className="!px-3 !py-2 text-xs"
        >
          WhatsApp
        </WhatsAppButton>
      </div>
    </div>
  )
}
