import type { PlatformFilterValue } from "../../lib/search"

const OPTIONS: { value: PlatformFilterValue; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PS4", label: "PS4" },
  { value: "PS5", label: "PS5" },
  { value: "PS4/PS5", label: "PS4 y PS5" },
]

interface PlatformFilterProps {
  value: PlatformFilterValue
  onChange: (value: PlatformFilterValue) => void
}

export function PlatformFilter({ value, onChange }: PlatformFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            value === opt.value
              ? "bg-flame-500 text-white"
              : "border border-white/15 text-white/60 hover:border-white/30 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
