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

const BOTON_INACTIVO =
  "border-borderSubtle bg-surface text-foreground transition-colors hover:bg-surfaceMuted hover:border-borderSubtle";

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
    inactivo: BOTON_INACTIVO,
  },
  {
    tipo: "falla",
    Icon: X,
    titulo: "Falla",
    activo: "bg-error text-white border-error shadow-sm hover:bg-red-700",
    inactivo: BOTON_INACTIVO,
  },
  {
    tipo: "parcial",
    Icon: Clock,
    titulo: "Inasistencia parcial",
    activo: "bg-info text-white border-info shadow-sm hover:bg-blue-700",
    inactivo: BOTON_INACTIVO,
  },
  {
    tipo: "excusa",
    Icon: FileText,
    titulo: "Excusa",
    activo: "bg-advertencia text-white border-advertencia shadow-sm hover:bg-amber-600",
    inactivo: BOTON_INACTIVO,
  },
];

const FILA_POR_TIPO: Partial<Record<TipoAsistencia, string>> = {
  presente: "bg-verdeClaro/40 border-verde/25 dark:bg-verdeOscuro/25 dark:border-verde/35",
  falla: "bg-red-50 border-error/20 dark:bg-red-950/35 dark:border-error/40",
  parcial: "bg-blue-50 border-info/25 dark:bg-blue-950/40 dark:border-info/35",
  excusa: "bg-amber-50 border-advertencia/30 dark:bg-amber-950/35 dark:border-advertencia/40",
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
        excusa_motivo: null,
        excusa_archivo: null,
      });
    } else if (tipo === "excusa") {
      onCambio({
        tipo,
        horas_inasistencia: null,
        excusa_motivo: marca.excusa_motivo ?? "",
        excusa_archivo: marca.excusa_archivo ?? null,
      });
    } else {
      onCambio({
        tipo,
        horas_inasistencia: null,
        excusa_motivo: null,
        excusa_archivo: null,
      });
    }
  }

  const opcionesHoras =
    maxHorasParcial >= 1 ? Array.from({ length: maxHorasParcial }, (_, i) => i + 1) : [];

  const filaTint = marca.tipo ? FILA_POR_TIPO[marca.tipo] : "bg-surface border-borderSubtle";

  return (
    <div
      className={`
        flex flex-wrap items-center gap-2 sm:gap-3 rounded-lg border-2 p-2.5 sm:p-3 transition-colors
        ${filaTint}
      `}
    >
      <Avatar nombre={nombreCompleto} id={aprendiz.id} size="md" />

      <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
        <p className="truncate text-sm font-medium leading-tight text-foreground">{nombreCompleto}</p>
        <p className="mt-0.5 truncate text-xs leading-tight text-muted">
          Cédula: {aprendiz.documento}
        </p>
      </div>

      {marca.tipo === "excusa" && (
        <div className="order-3 w-full space-y-2 sm:order-none sm:max-w-md">
          <label htmlFor={`exc-motivo-${aprendiz.id}`} className="block text-xs font-medium text-muted">
            Motivo de la excusa <span className="text-error">*</span>
          </label>
          <textarea
            id={`exc-motivo-${aprendiz.id}`}
            rows={2}
            className="w-full rounded-lg border border-borderSubtle bg-input px-2.5 py-1.5 text-xs text-foreground shadow-sm focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/25"
            placeholder="Describe brevemente el motivo (ej. cita médica, calamidad…)"
            value={marca.excusa_motivo ?? ""}
            onChange={(e) =>
              onCambio({
                tipo: "excusa",
                horas_inasistencia: null,
                excusa_motivo: e.target.value,
                excusa_archivo: marca.excusa_archivo ?? null,
              })
            }
          />
          <div>
            <label
              htmlFor={`exc-file-${aprendiz.id}`}
              className="mb-1 block text-xs text-muted"
            >
              Evidencia (opcional, máx. 10&nbsp;MB)
            </label>
            <input
              id={`exc-file-${aprendiz.id}`}
              type="file"
              accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full max-w-full text-xs text-foreground file:mr-2 file:rounded file:border-0 file:bg-surfaceMuted file:px-2 file:py-1"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                onCambio({
                  tipo: "excusa",
                  horas_inasistencia: null,
                  excusa_motivo: marca.excusa_motivo ?? "",
                  excusa_archivo: f,
                });
              }}
            />
            {marca.excusa_archivo && (
              <p className="mt-1 truncate text-xs text-muted" title={marca.excusa_archivo.name}>
                {marca.excusa_archivo.name}
              </p>
            )}
          </div>
        </div>
      )}

      {marca.tipo === "parcial" && opcionesHoras.length > 0 && (
        <div className="order-3 flex w-full shrink-0 items-center justify-end gap-2 sm:order-none sm:w-auto sm:justify-start">
          <label htmlFor={`hrs-${aprendiz.id}`} className="sr-only">
            Horas de inasistencia
          </label>
          <select
            id={`hrs-${aprendiz.id}`}
            className="min-w-[4.5rem] rounded-lg border border-borderSubtle bg-input px-2 py-1.5 text-xs text-foreground shadow-sm focus:border-verde focus:outline-none focus:ring-2 focus:ring-verde/25"
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
          <span className="hidden whitespace-nowrap text-xs text-muted sm:inline">
            Horas no asistidas
          </span>
          <span className="whitespace-nowrap text-xs text-muted sm:hidden">Hrs.</span>
        </div>
      )}

      <div className="order-2 ml-auto flex shrink-0 gap-1 sm:order-none">
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
                inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all
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
