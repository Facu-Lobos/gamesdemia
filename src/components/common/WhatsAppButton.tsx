interface WhatsAppButtonProps {
  href: string
  children: React.ReactNode
  variant?: "solid" | "outline"
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export function WhatsAppButton({ href, children, variant = "solid", className = "", onClick }: WhatsAppButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-105"
  const style =
    variant === "solid"
      ? "bg-flame-500 text-white glow-red hover:bg-flame-400"
      : "border border-flame-500 text-flame-400 hover:bg-flame-500/10"

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`${base} ${style} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.13-2.9-7C17.19 3.03 14.7 2 12.04 2Zm5.8 14.13c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11a10.7 10.7 0 0 1-1.87-.7c-3.29-1.43-5.43-4.73-5.6-4.95-.16-.22-1.34-1.78-1.34-3.4 0-1.6.84-2.39 1.14-2.72.3-.32.65-.4.87-.4.22 0 .43 0 .62.01.2.01.47-.08.73.56.27.65.9 2.24.98 2.4.08.16.13.35.02.57-.1.22-.16.35-.31.54-.16.19-.33.42-.47.56-.16.16-.32.33-.14.65.19.32.83 1.37 1.78 2.22 1.22 1.09 2.25 1.43 2.57 1.59.32.16.5.13.68-.08.19-.21.8-.93 1.02-1.25.21-.32.43-.27.72-.16.29.11 1.86.88 2.18 1.04.32.16.53.24.61.37.08.13.08.75-.16 1.43Z" />
      </svg>
      {children}
    </a>
  )
}
