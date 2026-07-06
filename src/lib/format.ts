const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function formatArs(price: number): string {
  return arsFormatter.format(price)
}
