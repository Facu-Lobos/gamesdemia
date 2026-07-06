import { buildGeneralWhatsAppUrl } from "../../lib/whatsapp"
import { WhatsAppButton } from "../common/WhatsAppButton"

interface HeroProps {
  totalCount: number
  offerExpiration: string | null
}

export function Hero({ totalCount, offerExpiration }: HeroProps) {
  return (
    <section id="top" className="cosmic-dust relative overflow-hidden px-4 py-16 text-center sm:px-6 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(255,35,64,0.25), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <img
          src="/logo/logo-transparente.png"
          alt="Gamesdemia"
          className="mx-auto mb-6 h-40 w-auto drop-shadow-[0_0_28px_rgba(255,35,64,0.55)] sm:h-48"
        />
        <h1 className="font-display text-4xl leading-tight tracking-wide text-white text-glow-red sm:text-6xl">
          ¡LOS MEJORES PRECIOS DE PS4/PS5 ESTÁN ACÁ! 🎮🔥
        </h1>
        <p className="mt-4 text-base text-white/70 sm:text-lg">
          Catálogo completo de más de {totalCount} juegos digitales. Buscá el tuyo y consultá al toque por WhatsApp.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#catalogo"
            className="inline-flex items-center justify-center rounded-full border border-neon-blue/50 px-6 py-3 text-sm font-bold uppercase tracking-wide text-neon-blue transition-transform hover:scale-105 hover:bg-neon-blue/10"
          >
            Ver catálogo
          </a>
          <WhatsAppButton href={buildGeneralWhatsAppUrl()}>Consultar ahora</WhatsAppButton>
        </div>
        {offerExpiration && (
          <p className="mt-6 inline-block rounded-full border border-flame-500/40 bg-flame-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-flame-400">
            Ofertas exclusivas hasta el {offerExpiration}
          </p>
        )}
      </div>
    </section>
  )
}
