import type { SortMode } from "../../lib/search"

const OPTIONS: { value: SortMode; label: string }[] = [
  { value: "ALPHA", label: "A-Z" },
  { value: "PRICE_ASC", label: "Precio: menor a mayor" },
  { value: "PRICE_DESC", label: "Precio: mayor a menor" },
]

interface SortControlProps {
  value: SortMode
  onChange: (value: SortMode) => void
}

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortMode)}
      className="rounded-full border border-white/10 bg-cosmic-800 px-3.5 py-2 text-xs font-semibold text-white/80 outline-none focus:border-flame-500/60"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
