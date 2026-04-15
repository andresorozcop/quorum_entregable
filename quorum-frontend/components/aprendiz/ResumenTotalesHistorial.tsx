// Tarjetas de resumen de horas y % asistencia (M9 y M10)

import type { MiHistorialTotales } from "../../types/miHistorial";

interface ResumenTotalesHistorialProps {
  totales: MiHistorialTotales;
  /** Texto si las horas de inasistencia superan el 20 % del total programado */
  mensajeAlertaInasistencia: string;
}

export default function ResumenTotalesHistorial({
  totales,
  mensajeAlertaInasistencia,
}: ResumenTotalesHistorialProps) {
  const haySesiones = totales.total_sesiones > 0;
  const ratioInasistencia =
    totales.total_horas_programadas > 0
      ? totales.total_horas_inasistencia / totales.total_horas_programadas
      : 0;
  const inasistenciaAlta = haySesiones && ratioInasistencia > 0.2;

  const pct = totales.porcentaje_asistencia;
  const pctColorClass =
    pct == null ? "text-grisMedio" : pct >= 80 ? "text-verde" : "text-error";

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 mb-6 shadow-sm"
      aria-label="Resumen de asistencia"
    >
      <h2 className="text-sm font-semibold text-grisOscuro mb-4">Resumen</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-grisMedio uppercase tracking-wide">
            Horas de inasistencia
          </p>
          <p
            className={`text-3xl font-bold tabular-nums ${
              inasistenciaAlta ? "text-error" : "text-grisOscuro"
            }`}
          >
            {totales.total_horas_inasistencia}
          </p>
          {inasistenciaAlta ? (
            <p className="text-xs text-error mt-1">{mensajeAlertaInasistencia}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs text-grisMedio uppercase tracking-wide">
            Asistencia (horas)
          </p>
          <p className={`text-3xl font-bold tabular-nums ${pctColorClass}`}>
            {pct != null ? `${pct} %` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-grisMedio uppercase tracking-wide">
            Sesiones registradas
          </p>
          <p className="text-3xl font-bold text-grisOscuro tabular-nums">
            {totales.total_sesiones}
          </p>
        </div>
      </div>
    </section>
  );
}
