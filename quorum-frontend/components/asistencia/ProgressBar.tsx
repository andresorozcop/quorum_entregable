"use client";

// Barra de progreso simple: cuántos aprendices ya tienen asistencia marcada

interface ProgressBarProps {
  /** Cuántos van completos (tipo elegido y, si es parcial, horas elegidas) */
  marcados: number;
  /** Total de aprendices en la lista */
  total: number;
}

export default function ProgressBar({ marcados, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((marcados / total) * 100) : 0;

  return (
    <div className="w-full" aria-live="polite">
      <div className="flex justify-between text-sm text-grisMedio mb-1">
        <span>Progreso</span>
        <span className="font-medium text-grisOscuro">
          {marcados} de {total} marcados
        </span>
      </div>
      <div
        className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden"
        role="progressbar"
        aria-valuenow={marcados}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-verde transition-all duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
