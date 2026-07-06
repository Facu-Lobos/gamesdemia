import { SITE_CONFIG } from "../../config/site"
import { buildGeneralWhatsAppUrl } from "../../lib/whatsapp"
import { WhatsAppButton } from "../common/WhatsAppButton"

interface FooterProps {
  totalCount: number
  offerExpiration: string | null
}

export function Footer({ totalCount, offerExpiration }: FooterProps) {
  return (
    <footer className="border-t border-white/5 bg-cosmic-900 px-4 py-10 text-center sm:px-6">
      <img src="/logo/logo-transparente.png" alt="Gamesdemia" className="mx-auto mb-4 h-20 w-auto" />
      <p className="font-display text-2xl tracking-wide text-white">
        ¡LISTA COMPLETA DE MÁS DE {totalCount} JUEGOS DISPONIBLES YA!
      </p>
      {offerExpiration && (
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-flame-400">
          ¡Ofertas exclusivas hasta el {offerExpiration}!
        </p>
      )}
      <div className="mt-6 flex justify-center">
        <WhatsAppButton href={buildGeneralWhatsAppUrl()}>Escribinos por WhatsApp</WhatsAppButton>
      </div>
      <p className="mt-8 text-xs text-white/40">
        {SITE_CONFIG.businessName} · Contacto: {SITE_CONFIG.whatsappDisplay}
      </p>
      <p className="mx-auto mt-2 max-w-2xl text-[11px] leading-relaxed text-white/30">
        Los nombres, logos y marcas de los juegos mencionados pertenecen a sus respectivos dueños. Se mencionan solo a
        fines descriptivos del catálogo.
      </p>
    </footer>
  )
}
