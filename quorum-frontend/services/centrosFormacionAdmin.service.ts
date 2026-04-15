// API administración centros de formación — solo admin

import api from "./api";

export interface CentroFormacionAdmin {
  id: number;
  nombre: string;
  codigo: string | null;
  activo: number;
  creado_en?: string;
  actualizado_en?: string;
}

async function obtenerCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

export async function getCentrosFormacionAdmin(activo?: 0 | 1): Promise<CentroFormacionAdmin[]> {
  const params = activo !== undefined ? { activo } : {};
  const r = await api.get<{ data: CentroFormacionAdmin[] }>("/api/admin/centros-formacion", {
    params,
  });
  return r.data.data;
}

export async function crearCentroFormacion(payload: {
  nombre: string;
  codigo?: string;
}): Promise<CentroFormacionAdmin> {
  await obtenerCsrf();
  const r = await api.post<{ data: CentroFormacionAdmin }>("/api/admin/centros-formacion", payload);
  return r.data.data;
}

export async function actualizarCentroFormacion(
  id: number,
  payload: { nombre: string; codigo?: string }
): Promise<CentroFormacionAdmin> {
  await obtenerCsrf();
  const r = await api.put<{ data: CentroFormacionAdmin }>(
    `/api/admin/centros-formacion/${id}`,
    payload
  );
  return r.data.data;
}

export async function desactivarCentroFormacion(id: number): Promise<void> {
  await obtenerCsrf();
  await api.delete(`/api/admin/centros-formacion/${id}`);
}

export async function reactivarCentroFormacion(id: number): Promise<CentroFormacionAdmin> {
  await obtenerCsrf();
  const r = await api.post<{ data: CentroFormacionAdmin }>(
    `/api/admin/centros-formacion/${id}/reactivar`
  );
  return r.data.data;
}
