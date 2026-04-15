"use client";

// Formulario crear/editar ficha: cabecera, instructores, jornadas y horarios (Módulo 5)

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CatalogoItem,
  DiaSemana,
  FichaDetalle,
  InstructorDisponible,
  PayloadCrearFicha,
  TipoJornada,
} from "../../types/ficha";

const TIPOS_JORNADA: TipoJornada[] = [
  "mañana",
  "tarde",
  "noche",
  "fin_de_semana",
];

const DIAS: DiaSemana[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

interface FilaHorario {
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  instructor_id: number;
}

interface BloqueJornada {
  tipo: TipoJornada;
  horarios: FilaHorario[];
}

interface Props {
  centros: CatalogoItem[];
  programas: CatalogoItem[];
  instructoresDisponibles: InstructorDisponible[];
  /** Si viene, precarga el formulario (edición) */
  inicial?: FichaDetalle | null;
  alEnviar: (payload: PayloadCrearFicha) => Promise<void>;
  textoBoton: string;
  enviando: boolean;
}

export default function FichaFormulario({
  centros,
  programas,
  instructoresDisponibles,
  inicial,
  alEnviar,
  textoBoton,
  enviando,
}: Props) {
  const [numeroFicha, setNumeroFicha] = useState("");
  const [estado, setEstado] = useState<"activa" | "suspendida">("activa");
  const [centroId, setCentroId] = useState<number>(0);
  const [programaId, setProgramaId] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idsInstructores, setIdsInstructores] = useState<number[]>([]);
  const [gestorId, setGestorId] = useState<number | null>(null);
  const [jornadas, setJornadas] = useState<BloqueJornada[]>([]);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  useEffect(() => {
    if (!inicial) {
      return;
    }
    setNumeroFicha(inicial.numero_ficha);
    setEstado(inicial.estado);
    setCentroId(inicial.centro_formacion_id);
    setProgramaId(inicial.programa_formacion_id);
    setFechaInicio(String(inicial.fecha_inicio).slice(0, 10));
    setFechaFin(String(inicial.fecha_fin).slice(0, 10));
    const ins = inicial.instructores ?? [];
    setIdsInstructores(ins.map((i) => i.usuario_id));
    const g = ins.find((i) => i.es_gestor);
    setGestorId(g ? g.usuario_id : null);
    setJornadas(
      (inicial.jornadas ?? []).map((j) => ({
        tipo: j.tipo,
        horarios: (j.horarios ?? []).map((h) => ({
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          instructor_id: h.instructor_id,
        })),
      }))
    );
  }, [inicial]);

  const tiposLibres = TIPOS_JORNADA.filter(
    (t) => !jornadas.some((j) => j.tipo === t)
  );

  function toggleInstructor(id: number) {
    setIdsInstructores((prev) => {
      if (prev.includes(id)) {
        if (gestorId === id) {
          setGestorId(null);
        }
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  }

  function agregarJornada(tipo: TipoJornada) {
    const primerIns = idsInstructores[0] ?? instructoresDisponibles[0]?.id ?? 0;
    setJornadas((prev) => [
      ...prev,
      {
        tipo,
        horarios: [
          {
            dia_semana: "lunes",
            hora_inicio: "08:00",
            hora_fin: "12:00",
            instructor_id: primerIns,
          },
        ],
      },
    ]);
  }

  function quitarJornada(tipo: TipoJornada) {
    setJornadas((prev) => prev.filter((j) => j.tipo !== tipo));
  }

  function agregarFilaHorario(tipo: TipoJornada) {
    const primerIns = idsInstructores[0] ?? 0;
    setJornadas((prev) =>
      prev.map((j) =>
        j.tipo === tipo
          ? {
              ...j,
              horarios: [
                ...j.horarios,
                {
                  dia_semana: "lunes",
                  hora_inicio: "08:00",
                  hora_fin: "12:00",
                  instructor_id: primerIns,
                },
              ],
            }
          : j
      )
    );
  }

  function quitarFilaHorario(tipo: TipoJornada, index: number) {
    setJornadas((prev) =>
      prev.map((j) =>
        j.tipo === tipo
          ? { ...j, horarios: j.horarios.filter((_, i) => i !== index) }
          : j
      )
    );
  }

  function actualizarHorario(
    tipo: TipoJornada,
    index: number,
    parcial: Partial<FilaHorario>
  ) {
    setJornadas((prev) =>
      prev.map((j) => {
        if (j.tipo !== tipo) {
          return j;
        }
        const horarios = [...j.horarios];
        horarios[index] = { ...horarios[index], ...parcial };
        return { ...j, horarios };
      })
    );
  }

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm(null);

    if (idsInstructores.length < 1) {
      setErrorForm("Selecciona al menos un instructor o gestor de la Formación.");
      return;
    }
    if (gestorId === null || !idsInstructores.includes(gestorId)) {
      setErrorForm("Debes marcar un Gestor de Grupo entre los instructores seleccionados.");
      return;
    }
    if (jornadas.length < 1) {
      setErrorForm("Agrega al menos una jornada (mañana, tarde, noche o fin de semana).");
      return;
    }
    for (const j of jornadas) {
      if (j.horarios.length < 1) {
        setErrorForm(`La jornada "${j.tipo}" debe tener al menos un día de horario.`);
        return;
      }
      for (const h of j.horarios) {
        if (!idsInstructores.includes(h.instructor_id)) {
          setErrorForm(
            "Cada horario debe usar un instructor que esté seleccionado en la lista."
          );
          return;
        }
        if (h.hora_inicio >= h.hora_fin) {
          setErrorForm("La hora de fin debe ser posterior a la de inicio en todos los horarios.");
          return;
        }
      }
    }

    const instructoresPayload = idsInstructores.map((uid) => ({
      usuario_id: uid,
      es_gestor: uid === gestorId,
    }));

    const payload: PayloadCrearFicha = {
      numero_ficha: numeroFicha.trim(),
      estado,
      centro_formacion_id: centroId,
      programa_formacion_id: programaId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      instructores: instructoresPayload,
      jornadas: jornadas.map((j) => ({
        tipo: j.tipo,
        horarios: j.horarios.map((h) => ({
          dia_semana: h.dia_semana,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          instructor_id: h.instructor_id,
        })),
      })),
    };

    await alEnviar(payload);
  }

  return (
    <form onSubmit={(e) => void manejarSubmit(e)} className="space-y-8">
      {errorForm && (
        <div
          className="rounded-lg border border-error/40 bg-red-50 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {errorForm}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-grisOscuro">
          Datos de la Ficha de Caracterización
        </h2>
        <p className="text-sm text-grisMedio">
          Centro y programa definen el contexto de Formación del grupo.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-grisOscuro">Número de ficha</span>
            <input
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              value={numeroFicha}
              onChange={(e) => setNumeroFicha(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-grisOscuro">Estado</span>
            <select
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              value={estado}
              onChange={(e) =>
                setEstado(e.target.value as "activa" | "suspendida")
              }
            >
              <option value="activa">Activa</option>
              <option value="suspendida">Suspendida</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-grisOscuro">Centro de formación</span>
            <select
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              value={centroId || ""}
              onChange={(e) => setCentroId(Number(e.target.value))}
            >
              <option value="">Seleccione…</option>
              {centros.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-grisOscuro">Programa de formación</span>
            <select
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              value={programaId || ""}
              onChange={(e) => setProgramaId(Number(e.target.value))}
            >
              <option value="">Seleccione…</option>
              {programas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-grisOscuro">Fecha de inicio</span>
            <input
              required
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-grisOscuro">Fecha de fin</span>
            <input
              required
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-grisOscuro">Instructores</h2>
        <p className="text-sm text-grisMedio">
          Marca quién acompaña la Formación y un único Gestor de Grupo.
        </p>
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
          {instructoresDisponibles.map((ins) => (
            <li
              key={ins.id}
              className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm"
            >
              <label className="flex flex-1 items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={idsInstructores.includes(ins.id)}
                  onChange={() => toggleInstructor(ins.id)}
                />
                <span>
                  {ins.nombre} {ins.apellido}{" "}
                  <span className="text-grisMedio">({ins.correo})</span>
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="gestor"
                  disabled={!idsInstructores.includes(ins.id)}
                  checked={gestorId === ins.id}
                  onChange={() => setGestorId(ins.id)}
                />
                Gestor de Grupo
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-grisOscuro">
            Jornadas y horario semanal
          </h2>
          {tiposLibres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-grisMedio">Agregar jornada:</span>
              {tiposLibres.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="rounded-lg bg-verdeClaro px-3 py-1.5 text-sm font-medium text-verdeOscuro hover:bg-verde/20"
                  onClick={() => agregarJornada(t)}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        {jornadas.map((bloque) => (
          <div
            key={bloque.tipo}
            className="rounded-lg border border-gray-100 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold capitalize text-grisOscuro">
                Jornada: {bloque.tipo.replace("_", " ")}
              </h3>
              <button
                type="button"
                className="text-error text-sm inline-flex items-center gap-1"
                onClick={() => quitarJornada(bloque.tipo)}
              >
                <Trash2 size={16} aria-hidden />
                Quitar jornada
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-grisMedio border-b">
                    <th className="py-2 pr-2">Día</th>
                    <th className="py-2 pr-2">Inicio</th>
                    <th className="py-2 pr-2">Fin</th>
                    <th className="py-2 pr-2">Instructor</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {bloque.horarios.map((h, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 pr-2">
                        <select
                          className="rounded border border-gray-200 px-2 py-1"
                          value={h.dia_semana}
                          onChange={(e) =>
                            actualizarHorario(bloque.tipo, idx, {
                              dia_semana: e.target.value as DiaSemana,
                            })
                          }
                        >
                          {DIAS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="time"
                          className="rounded border border-gray-200 px-2 py-1"
                          value={h.hora_inicio}
                          onChange={(e) =>
                            actualizarHorario(bloque.tipo, idx, {
                              hora_inicio: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="time"
                          className="rounded border border-gray-200 px-2 py-1"
                          value={h.hora_fin}
                          onChange={(e) =>
                            actualizarHorario(bloque.tipo, idx, {
                              hora_fin: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          className="rounded border border-gray-200 px-2 py-1 min-w-[10rem]"
                          value={h.instructor_id || ""}
                          onChange={(e) =>
                            actualizarHorario(bloque.tipo, idx, {
                              instructor_id: Number(e.target.value),
                            })
                          }
                        >
                          {idsInstructores.map((id) => {
                            const u = instructoresDisponibles.find((x) => x.id === id);
                            if (!u) {
                              return null;
                            }
                            return (
                              <option key={id} value={id}>
                                {u.nombre} {u.apellido}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          className="text-error p-1"
                          aria-label="Quitar fila"
                          onClick={() => quitarFilaHorario(bloque.tipo, idx)}
                          disabled={bloque.horarios.length <= 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-verde font-medium"
              onClick={() => agregarFilaHorario(bloque.tipo)}
            >
              <Plus size={18} aria-hidden />
              Agregar día
            </button>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-verde px-6 py-2.5 font-semibold text-white hover:bg-verdeOscuro disabled:opacity-50"
        >
          {enviando ? "Guardando…" : textoBoton}
        </button>
      </div>
    </form>
  );
}
