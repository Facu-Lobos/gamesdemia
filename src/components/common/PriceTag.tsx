import { formatArs } from "../../lib/format"

export function PriceTag({ priceArs, size = "md" }: { priceArs: number; size?: "md" | "lg" }) {
  return (
    <span
      className={`font-display tracking-wide text-white text-glow-red ${size === "lg" ? "text-4xl" : "text-2xl"}`}
    >
      {formatArs(priceArs)}
    </span>
  )
}
