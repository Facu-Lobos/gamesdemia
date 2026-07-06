import { useState } from "react"
import type { Game } from "../../data/types"

function initials(title: string): string {
  const words = title.replace(/[^\p{L}\p{N} ]/gu, "").split(" ").filter(Boolean)
  return (words[0]?.[0] ?? "?") + (words[1]?.[0] ?? "")
}

export function GameThumbnail({ game, className = "" }: { game: Game; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (game.coverImageUrl && !failed) {
    return (
      <img
        src={game.coverImageUrl}
        alt={game.title}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-cosmic-800 to-cosmic-700 ${className}`}
    >
      <span className="font-display text-3xl tracking-widest text-white/25 group-hover:text-flame-500/60">
        {initials(game.title)}
      </span>
    </div>
  )
}
