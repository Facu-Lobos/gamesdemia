import type { Platform } from "../../data/types"

const LABELS: Record<Platform, string> = {
  PS4: "PS4",
  PS5: "PS5",
  "PS4/PS5": "PS4 y PS5",
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neon-blue/40 bg-neon-blue/10 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-neon-blue">
      {LABELS[platform]}
    </span>
  )
}
