"use client";

import Image from "next/image";
import { quorumBrandFont } from "../../lib/quorumBrandFont";

const SRC_LOGO = "/branding/logo_quorum.png";

type LogoVariant = "hero" | "compact" | "sidebar";

/** Tamaños del logo (hero / barra / sidebar) */
const LOGO_SIZES: Record<
  LogoVariant,
  { width: number; height: number; className: string; priority?: boolean }
> = {
  hero: {
    width: 189,
    height: 189,
    className: "mx-auto h-[189px] w-[189px] max-w-[189px] object-contain",
    priority: true,
  },
  compact: {
    width: 57,
    height: 57,
    className: "h-[57px] w-[57px] shrink-0 object-contain",
  },
  sidebar: {
    width: 63,
    height: 63,
    className: "h-[63px] w-[63px] shrink-0 object-contain",
  },
};

export function QuorumLogo({
  variant,
  priority,
}: {
  variant: LogoVariant;
  priority?: boolean;
}) {
  const cfg = LOGO_SIZES[variant];
  return (
    <Image
      src={SRC_LOGO}
      alt="Quorum"
      width={cfg.width}
      height={cfg.height}
      className={cfg.className}
      priority={priority ?? cfg.priority ?? false}
    />
  );
}

/** Clases para el texto "QUORUM" al estilo wordmark (sin imagen) */
export const quorumNombreTextoClases =
  `${quorumBrandFont.className} font-bold uppercase tracking-[0.05em] antialiased`;
