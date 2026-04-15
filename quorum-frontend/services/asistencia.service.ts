// API tomar asistencia (M7) e historial matriz (M8)

import api from "./api";
import type {
  HistorialMatrizRespuesta,
  IniciarSesionRespuesta,
  TipoAsistencia,
} from "../types/asistencia";

// Pide cookie CSRF antes de POST (Sanctum SPA)
async function asegurarCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

export interface PayloadIniciarSesion {
  ficha_id: number;
  fecha: string;
  horario_id?: number;
}

/** Abre o recupera sesión abierta y devuelve aprendices */
export async function iniciarSesionAsistencia(
  payload: PayloadIniciarSesion
): Promise<IniciarSesionRespuesta> {
  await asegurarCsrf();
  const r = await api.post<IniciarSesionRespuesta>("/api/asistencia/iniciar-sesion", payload);
  return r.data;
}

export interface FilaRegistroGuardar {
  aprendiz_id: number;
  tipo: string;
  horas_inasistencia?: number | null;
}

/** Cierra la sesión y guarda todos los registros */
export async function guardarAsistencia(
  sesionId: number,
  registros: FilaRegistroGuardar[]
): Promise<void> {
  await asegurarCsrf();
  await api.post(`/api/asistencia/sesiones/${sesionId}/guardar`, { registros });
}

export interface FiltrosHistorialAsistencia {
  desde?: string;
  hasta?: string;
  tipos?: TipoAsistencia[];
  /** Solo sesiones de horarios de esta jornada (M10 / filtro opcional) */
  jornada_ficha_id?: number;
}

/** Construye query string con tipo[] repetido para Laravel */
function queryHistorialAsistencia(filtros: FiltrosHistorialAsistencia): string {
  const p = new URLSearchParams();
  if (filtros.desde) p.set("desde", filtros.desde);
  if (filtros.hasta) p.set("hasta", filtros.hasta);
  filtros.tipos?.forEach((t) => p.append("tipo[]", t));
  if (filtros.jornada_ficha_id != null) {
    p.set("jornada_ficha_id", String(filtros.jornada_ficha_id));
  }
  const qs = p.toString();

  return qs;
}

/** Matriz de historial por ficha (GET) */
export async function obtenerHistorialAsistencia(
  fichaId: number,
  filtros: FiltrosHistorialAsistencia = {}
): Promise<HistorialMatrizRespuesta> {
  const qs = queryHistorialAsistencia(filtros);
  const url =
    qs === ""
      ? `/api/asistencia/historial/${fichaId}`
      : `/api/asistencia/historial/${fichaId}?${qs}`;
  const r = await api.get<HistorialMatrizRespuesta>(url);
  return r.data;
}

export interface PayloadActualizarRegistro {
  tipo: TipoAsistencia;
  horas_inasistencia?: number | null;
  razon?: string | null;
}

/** Corrige un registro con sesión cerrada (PUT, backup en servidor) */
export async function actualizarRegistroAsistencia(
  registroId: number,
  payload: PayloadActualizarRegistro
): Promise<void> {
  await asegurarCsrf();
  await api.put(`/api/asistencia/registros/${registroId}`, payload);
}
