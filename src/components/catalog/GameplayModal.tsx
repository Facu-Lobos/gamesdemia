import { useEffect } from "react"
import type { Game } from "../../data/types"
import { buildGameWhatsAppUrl } from "../../lib/whatsapp"
import { PlatformBadge } from "../common/PlatformBadge"
import { PriceTag } from "../common/PriceTag"
import { WhatsAppButton } from "../common/WhatsAppButton"

export function GameplayModal({ game, onClose }: { game: Game; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fire-frame w-full max-w-2xl rounded-2xl bg-cosmic-900 p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <PlatformBadge platform={game.platform} />
            <h3 className="mt-2 font-display text-2xl tracking-wide text-white">{game.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full border border-white/15 p-2 text-white/60 hover:border-white/30 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-cosmic-800">
          {game.videoId ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${game.videoId}?autoplay=1`}
              title={`Gameplay de ${game.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white/40">
              <span className="font-display text-lg tracking-wide">Gameplay no disponible por ahora</span>
              <span className="text-xs">Pronto vamos a sumar el video de este juego.</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <PriceTag priceArs={game.priceArs} size="lg" />
          <WhatsAppButton href={buildGameWhatsAppUrl(game)}>Consultar por WhatsApp</WhatsAppButton>
        </div>
      </div>
    </div>
  )
}
