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
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-white rounded-xl border border-dashed border-gray-200">
      <div className="w-14 h-14 rounded-full bg-grisClaro flex items-center justify-center text-grisMedio mb-3">
        <Icono size={28} aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-grisOscuro">{titulo}</p>
      {descripcion ? (
        <p className="text-sm text-grisMedio mt-1 max-w-sm">{descripcion}</p>
      ) : null}
    </div>
  );
}
