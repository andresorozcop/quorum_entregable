"use client";

// Tabla reutilizable con paginación y scroll horizontal (Módulo 5)

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ColumnaDataTable<T> {
  clave: string;
  etiqueta: string;
  /** Ancho mínimo opcional para columnas anchas */
  anchoMinimo?: string;
  render?: (fila: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columnas: ColumnaDataTable<T>[];
  datos: T[];
  /** Identificador estable por fila */
  getClaveFila: (fila: T) => string | number;
  paginacion?: {
    paginaActual: number;
    totalPaginas: number;
    total: number;
    alCambiarPagina: (pagina: number) => void;
  };
  vacioTexto?: string;
}

export default function DataTable<T>({
  columnas,
  datos,
  getClaveFila,
  paginacion,
  vacioTexto = "No hay registros para mostrar.",
}: DataTableProps<T>) {
  return (
    <div className="min-w-0 space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm text-grisOscuro dark:text-gray-100">
          <thead className="border-b border-gray-200 bg-grisClaro dark:border-slate-700 dark:bg-slate-800">
            <tr>
              {columnas.map((col) => (
                <th
                  key={col.clave}
                  scope="col"
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                  style={
                    col.anchoMinimo
                      ? { minWidth: col.anchoMinimo }
                      : undefined
                  }
                >
                  {col.etiqueta}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="px-4 py-8 text-center text-grisMedio dark:text-gray-400"
                >
                  {vacioTexto}
                </td>
              </tr>
            ) : (
              datos.map((fila) => (
                <tr
                  key={String(getClaveFila(fila))}
                  className="border-b border-gray-100 last:border-0 hover:bg-grisClaro/60 dark:border-slate-800 dark:hover:bg-slate-800/80"
                >
                  {columnas.map((col) => (
                    <td
                      key={col.clave}
                      className="px-4 py-3 align-middle whitespace-nowrap"
                      style={
                        col.anchoMinimo
                          ? { minWidth: col.anchoMinimo }
                          : undefined
                      }
                    >
                      {col.render
                        ? col.render(fila)
                        : String(
                            (fila as Record<string, unknown>)[col.clave] ?? ""
                          )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginacion && paginacion.totalPaginas > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-grisMedio dark:text-gray-400">
          <p>
            Mostrando página {paginacion.paginaActual} de{" "}
            {paginacion.totalPaginas} ({paginacion.total} registros)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-grisClaro disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800"
              disabled={paginacion.paginaActual <= 1}
              onClick={() =>
                paginacion.alCambiarPagina(paginacion.paginaActual - 1)
              }
            >
              <ChevronLeft size={18} aria-hidden />
              Anterior
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-grisClaro disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800"
              disabled={
                paginacion.paginaActual >= paginacion.totalPaginas
              }
              onClick={() =>
                paginacion.alCambiarPagina(paginacion.paginaActual + 1)
              }
            >
              Siguiente
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
