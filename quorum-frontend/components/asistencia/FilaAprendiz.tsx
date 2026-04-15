"use client";

// Fila compacta: avatar, datos, selector de horas si parcial, botones de estado con iconos (paleta QUORUM)

import { Check, Clock, FileText, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import type { AprendizAsistencia, MarcaAprendiz, TipoAsistencia } from "../../types/asistencia";

interface FilaAprendizProps {
  aprendiz: AprendizAsistencia;
  /** Máximo de horas seleccionables en parcial (= horas_programadas - 1) */
  maxHorasParcial: number;
  marca: MarcaAprendiz;
  onCambio: (marca: MarcaAprendiz) => void;
}

const BOTONES: {
  tipo: TipoAsistencia;
  Icon: typeof Check;
  titulo: string;
  activo: string;
  inactivo: string;
}[] = [
  {
    tipo: "presente",
    Icon: Check,
    titulo: "Presente",
    activo: "bg-verde text-white border-verde shadow-sm hover:bg-verdeOscuro",
    inactivo:
      "border-gray-200 bg-white text-grisOscuro hover:bg-grisClaro hover:border-gray-300",
  },
  {
    tipo: "falla",
    Icon: X,
    titulo: "Falla",
    activo: "bg-error text-white border-error shadow-sm hover:bg-red-700",
    inactivo:
      "border-gray-200 bg-white text-grisOscuro hover:bg-grisClaro hover:border-gray-300",
  },
  {
    tipo: "parcial",
    Icon: Clock,
    titulo: "Inasistencia parcial",
    activo: "bg-info text-white border-info shadow-sm hover:bg-blue-700",
    inactivo:
      "border-gray-200 bg-white text-grisOscuro hover:bg-grisClaro hover:border-gray-300",
  },
  {
    tipo: "excusa",
    Icon: FileText,
    titulo: "Excusa",
    activo: "bg-advertencia text-white border-advertencia shadow-sm hover:bg-amber-600",
    inactivo:
      "border-gray-200 bg-white text-grisOscuro hover:bg-grisClaro hover:border-gray-300",
  },
];

const FILA_POR_TIPO: Partial<Record<TipoAsistencia, string>> = {
  presente: "bg-verdeClaro/40 border-verde/25",
  falla: "bg-red-50 border-error/20",
  parcial: "bg-blue-50 border-info/25",
  excusa: "bg-amber-50 border-advertencia/30",
};

export default function FilaAprendiz({
  aprendiz,
  maxHorasParcial,
  marca,
  onCambio,
}: FilaAprendizProps) {
  const nombreCompleto = `${aprendiz.nombre} ${aprendiz.apellido}`.trim();

  function elegirTipo(tipo: TipoAsistencia) {
    if (tipo === "parcial") {
      onCambio({
        tipo,
        horas_inasistencia: marca.horas_inasistencia ?? (maxHorasParcial >= 1 ? 1 : null),
      });
    } else {
      onCambio({ tipo, horas_inasistencia: null });
    }
  }

  const opcionesHoras =
    maxHorasParcial >= 1 ? Array.from({ length: maxHorasParcial }, (_, i) => i + 1) : [];

  const filaTint = marca.tipo ? FILA_POR_TIPO[marca.tipo] : "bg-white border-gray-200";

  return (
    <div
      className={`
        flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border-2 p-2.5 sm:p-3 transition-colors
        ${filaTint}
      `}
    >
      <Avatar nombre={nombreCompleto} id={aprendiz.id} size="md" />

      <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
        <p className="font-medium text-grisOscuro text-sm leading-tight truncate">{nombreCompleto}</p>
        <p className="text-xs text-grisMedio leading-tight mt-0.5 truncate">
          Cédula: {aprendiz.documento}
        </p>
      </div>

      {marca.tipo === "parcial" && opcionesHoras.length > 0 && (
        <div className="flex items-center gap-2 shrink-0 order-3 sm:order-none w-full sm:w-auto justify-end sm:justify-start">
          <label htmlFor={`hrs-${aprendiz.id}`} className="sr-only">
            Horas de inasistencia
          </label>
          <select
            id={`hrs-${aprendiz.id}`}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-grisOscuro bg-white min-w-[4.5rem] text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-verde/25 focus:border-verde"
            value={marca.horas_inasistencia ?? ""}
            onChange={(e) =>
              onCambio({
                tipo: "parcial",
                horas_inasistencia: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">—</option>
            {opcionesHoras.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="text-xs text-grisMedio hidden sm:inline whitespace-nowrap">
            Horas no asistidas
          </span>
          <span className="text-xs text-grisMedio sm:hidden whitespace-nowrap">Hrs.</span>
        </div>
      )}

      <div className="flex gap-1 shrink-0 ml-auto order-2 sm:order-none">
        {BOTONES.map(({ tipo, Icon, titulo, activo, inactivo }) => {
          const sel = marca.tipo === tipo;
          return (
            <button
              key={tipo}
              type="button"
              title={titulo}
              aria-label={titulo}
              aria-pressed={sel}
              onClick={() => elegirTipo(tipo)}
              className={`
                inline-flex items-center justify-center h-9 w-9 rounded-lg border-2 transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-verde/35 focus-visible:ring-offset-1
                ${sel ? activo : inactivo}
              `}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
