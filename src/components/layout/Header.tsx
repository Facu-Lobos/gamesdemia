import { buildGeneralWhatsAppUrl } from "../../lib/whatsapp"
import { WhatsAppButton } from "../common/WhatsAppButton"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-cosmic-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <img src="/logo/logo-transparente.png" alt="Gamesdemia" className="h-12 w-auto sm:h-14" />
          <span className="font-display text-2xl tracking-wide text-white">
            GAMES<span className="text-flame-500">-</span>DEMIA
          </span>
        </a>
        <WhatsAppButton href={buildGeneralWhatsAppUrl()}>
          <span className="hidden sm:inline">Consultar</span>
          <span className="sr-only sm:hidden">Consultar por WhatsApp</span>
        </WhatsAppButton>
      </div>
    </header>
  )
}
