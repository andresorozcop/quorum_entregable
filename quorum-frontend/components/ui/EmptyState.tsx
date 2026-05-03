// Estado vacío — cuando no hay datos que mostrar (Módulo 4)

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icono: LucideIcon;
  titulo: string;
  descripcion?: string;
}

export default function EmptyState({
  Icono,
  titulo,
  descripcion,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-borderSubtle bg-surface px-4 py-10 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surfaceMuted text-muted">
        <Icono size={28} aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      {descripcion ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{descripcion}</p>
      ) : null}
    </div>
  );
}
