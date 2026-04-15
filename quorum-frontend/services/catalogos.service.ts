// Catálogos para formularios de ficha (centros, programas, instructores)

import api from "./api";
import type { CatalogoItem, InstructorDisponible } from "../types/ficha";

export async function getCentrosFormacion(): Promise<CatalogoItem[]> {
  const r = await api.get<{ data: CatalogoItem[] }>("/api/centros-formacion");
  return r.data.data;
}

export async function getProgramasFormacion(): Promise<CatalogoItem[]> {
  const r = await api.get<{ data: CatalogoItem[] }>("/api/programas-formacion");
  return r.data.data;
}

export async function getInstructoresDisponibles(): Promise<InstructorDisponible[]> {
  const r = await api.get<{ data: InstructorDisponible[] }>(
    "/api/instructores-disponibles"
  );
  return r.data.data;
}
