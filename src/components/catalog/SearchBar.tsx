interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscá tu juego..."
        className="w-full rounded-full border border-white/10 bg-cosmic-800 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-flame-500/60 focus:ring-1 focus:ring-flame-500/40"
      />
    </div>
  )
}
