import { SITE_CONFIG } from "../config/site"
import type { Game } from "../data/types"
import { formatArs } from "./format"

export function buildGameWhatsAppUrl(game: Game): string {
  const message = `Hola! Quiero consultar por "${game.title}" (${game.platform}) — vi el precio ${formatArs(game.priceArs)} en la web.`
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export function buildGeneralWhatsAppUrl(): string {
  const message = "Hola! Quiero consultar por el catálogo de juegos de Gamesdemia."
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
}
