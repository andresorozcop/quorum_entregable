// Tarjeta de estadística — ícono Lucide, valor destacado y etiqueta (Módulo 4)

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  etiqueta: string;
  valor: string | number;
  Icono: LucideIcon;
  // Clase Tailwind para el color del ícono, ej. text-verde o text-info
  classNameIcono: string;
}

export default function StatCard({
  etiqueta,
  valor,
  Icono,
  classNameIcono,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-grisMedio mb-1">{etiqueta}</p>
          <p className="text-2xl font-bold text-grisOscuro tabular-nums">
            {valor}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl bg-grisClaro flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <Icono size={22} className={classNameIcono} />
        </div>
      </div>
    </div>
  );
}
