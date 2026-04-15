// Tipos del módulo de fichas de caracterización (M5) — alineados con la API Laravel

export type EstadoFicha = "activa" | "suspendida";

export type TipoJornada = "mañana" | "tarde" | "noche" | "fin_de_semana";

export type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado";

export interface CatalogoItem {
  id: number;
  nombre: string;
  codigo: string;
}

export interface InstructorDisponible {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

export interface FichaListado {
  id: number;
  numero_ficha: string;
  estado: EstadoFicha;
  centro_formacion_id: number;
  programa_formacion_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: number;
  centro?: CatalogoItem;
  programa?: CatalogoItem;
}

export interface HorarioFicha {
  id?: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  horas_programadas?: number;
  instructor_id: number;
  instructor?: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
}

export interface JornadaFichaDetalle {
  id?: number;
  tipo: TipoJornada;
  activo?: number;
  horarios: HorarioFicha[];
}

export interface FichaInstructorPivot {
  usuario_id: number;
  es_gestor: boolean;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: string;
  };
}

export interface AprendizFicha {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
}

export interface FichaDetalle extends FichaListado {
  jornadas: JornadaFichaDetalle[];
  instructores: FichaInstructorPivot[];
  aprendices: AprendizFicha[];
}

export interface PaginacionFichas {
  data: FichaListado[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PayloadCrearFicha {
  numero_ficha: string;
  estado: EstadoFicha;
  centro_formacion_id: number;
  programa_formacion_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  instructores: { usuario_id: number; es_gestor: boolean }[];
  jornadas: {
    tipo: TipoJornada;
    horarios: {
      dia_semana: DiaSemana;
      hora_inicio: string;
      hora_fin: string;
      instructor_id: number;
    }[];
  }[];
}

export interface ResumenImportacion {
  message?: string;
  exitosos: number;
  fallidos: number;
  errores: string[];
}
