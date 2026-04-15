"use client";

// Gestión de centros de formación — solo administrador

import { isAxiosError } from "axios";
import { Building2, Loader2, Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import DataTable from "../../../components/ui/DataTable";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import {
  actualizarCentroFormacion,
  crearCentroFormacion,
  desactivarCentroFormacion,
  getCentrosFormacionAdmin,
  reactivarCentroFormacion,
  type CentroFormacionAdmin,
} from "../../../services/centrosFormacionAdmin.service";

export default function CentrosFormacionPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoAuth } = useAuth();
  const esAdmin = usuario?.rol === "admin";

  const [cargando, setCargando] = useState(true);
  const [lista, setLista] = useState<CentroFormacionAdmin[]>([]);
  const [filtroActivo, setFiltroActivo] = useState<"" | "1" | "0">("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const activo =
        filtroActivo === "" ? undefined : filtroActivo === "1" ? 1 : 0;
      const data = await getCentrosFormacionAdmin(activo);
      setLista(data);
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los centros.",
        confirmButtonColor: "#3DAE2B",
      });
    } finally {
      setCargando(false);
    }
  }, [filtroActivo]);

  useEffect(() => {
    if (cargandoAuth) return;
    if (!esAdmin) {
      router.replace("/dashboard");
      return;
    }
    void cargar();
  }, [cargandoAuth, esAdmin, router, cargar]);

  function abrirNuevo() {
    setEditandoId(null);
    setNombre("");
    setCodigo("");
    setModalAbierto(true);
  }

  function abrirEditar(c: CentroFormacionAdmin) {
    setEditandoId(c.id);
    setNombre(c.nombre);
    setCodigo(c.codigo ?? "");
    setModalAbierto(true);
  }

  async function guardarModal(e: React.FormEvent) {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) {
      await Swal.fire({
        icon: "warning",
        title: "Falta el nombre",
        text: "Escribe el nombre del centro.",
        confirmButtonColor: "#3DAE2B",
      });
      return;
    }
    setEnviando(true);
    try {
      if (editandoId === null) {
        await crearCentroFormacion({
          nombre: n,
          codigo: codigo.trim() || undefined,
        });
        await Swal.fire({
          icon: "success",
          title: "Centro creado",
          confirmButtonColor: "#3DAE2B",
        });
      } else {
        await actualizarCentroFormacion(editandoId, {
          nombre: n,
          codigo: codigo.trim() || undefined,
        });
        await Swal.fire({
          icon: "success",
          title: "Centro actualizado",
          confirmButtonColor: "#3DAE2B",
        });
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      const msg = isAxiosError(err)
        ? String(err.response?.data?.message ?? "Error al guardar.")
        : "Error al guardar.";
      await Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: "#3DAE2B" });
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarDesactivar(c: CentroFormacionAdmin) {
    const r = await Swal.fire({
      icon: "warning",
      title: "¿Desactivar centro?",
      text: c.nombre,
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#D32F2F",
      cancelButtonColor: "#9E9E9E",
    });
    if (!r.isConfirmed) return;
    try {
      await desactivarCentroFormacion(c.id);
      await Swal.fire({ icon: "success", title: "Desactivado", confirmButtonColor: "#3DAE2B" });
      await cargar();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: isAxiosError(err) ? String(err.response?.data?.message ?? "") : "",
        confirmButtonColor: "#3DAE2B",
      });
    }
  }

  async function confirmarEliminarPermanente(c: CentroFormacionAdmin) {
    const r = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar permanentemente?",
      text: "Solo si no hay fichas vinculadas. Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#D32F2F",
      cancelButtonColor: "#9E9E9E",
    });
    if (!r.isConfirmed) return;
    try {
      await desactivarCentroFormacion(c.id);
      await Swal.fire({ icon: "success", title: "Eliminado", confirmButtonColor: "#3DAE2B" });
      await cargar();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: isAxiosError(err) ? String(err.response?.data?.message ?? "") : "",
        confirmButtonColor: "#3DAE2B",
      });
    }
  }

  async function reactivar(c: CentroFormacionAdmin) {
    try {
      await reactivarCentroFormacion(c.id);
      await Swal.fire({ icon: "success", title: "Reactivado", confirmButtonColor: "#3DAE2B" });
      await cargar();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: isAxiosError(err) ? String(err.response?.data?.message ?? "") : "",
        confirmButtonColor: "#3DAE2B",
      });
    }
  }

  if (cargandoAuth || !usuario) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!esAdmin) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-verdeClaro flex items-center justify-center">
            <Building2 size={22} className="text-verde" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-grisOscuro">Centros de formación</h1>
            <p className="text-sm text-grisMedio">Alta, edición y baja de centros SENA</p>
          </div>
        </div>
        <button
          type="button"
          onClick={abrirNuevo}
          className="inline-flex items-center gap-2 rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white hover:bg-verdeOscuro"
        >
          <Plus size={18} />
          Nuevo centro
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-grisMedio">Estado:</span>
        <select
          value={filtroActivo}
          onChange={(e) => setFiltroActivo(e.target.value as "" | "1" | "0")}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white text-grisOscuro"
        >
          <option value="">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable<CentroFormacionAdmin>
          columnas={[
            { clave: "nombre", etiqueta: "Nombre", anchoMinimo: "12rem" },
            { clave: "codigo", etiqueta: "Código" },
            {
              clave: "activo",
              etiqueta: "Estado",
              render: (f) => (
                <span className={f.activo === 1 ? "text-verde font-medium" : "text-grisMedio"}>
                  {f.activo === 1 ? "Activo" : "Inactivo"}
                </span>
              ),
            },
            {
              clave: "acciones",
              etiqueta: "Acciones",
              render: (f) => (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => abrirEditar(f)}
                    className="inline-flex items-center gap-1 text-info text-sm hover:underline"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  {f.activo === 1 ? (
                    <button
                      type="button"
                      onClick={() => void confirmarDesactivar(f)}
                      className="inline-flex items-center gap-1 text-error text-sm hover:underline"
                    >
                      <Trash2 size={14} /> Desactivar
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void reactivar(f)}
                        className="inline-flex items-center gap-1 text-verde text-sm hover:underline"
                      >
                        <UserCheck size={14} /> Reactivar
                      </button>
                      <button
                        type="button"
                        onClick={() => void confirmarEliminarPermanente(f)}
                        className="inline-flex items-center gap-1 text-error text-sm hover:underline"
                      >
                        Eliminar definitivo
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          datos={lista}
          getClaveFila={(f) => f.id}
        />
      )}

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-centro"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
            <h2 id="titulo-modal-centro" className="text-lg font-semibold text-grisOscuro mb-4">
              {editandoId === null ? "Nuevo centro" : "Editar centro"}
            </h2>
            <form onSubmit={(e) => void guardarModal(e)} className="space-y-4">
              <div>
                <label htmlFor="centro_nombre" className="block text-sm font-medium text-grisOscuro mb-1">
                  Nombre
                </label>
                <input
                  id="centro_nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  maxLength={150}
                />
              </div>
              <div>
                <label htmlFor="centro_codigo" className="block text-sm font-medium text-grisOscuro mb-1">
                  Código (opcional)
                </label>
                <input
                  id="centro_codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  maxLength={20}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-grisOscuro hover:bg-grisClaro"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-verde text-white hover:bg-verdeOscuro disabled:opacity-50"
                >
                  {enviando ? <Loader2 className="animate-spin" size={18} /> : null}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
