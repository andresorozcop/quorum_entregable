"use client";

// Página Mi perfil — Módulo 13: datos en lectura, cambio de contraseña (staff) y accesibilidad

import { useEffect, useState } from "react";
import {
  Check,
  Circle,
  Lock,
  Mail,
  Minus,
  Plus,
  UserCircle,
  ZoomIn,
} from "lucide-react";
import Swal from "sweetalert2";
import Avatar from "../../../components/ui/Avatar";
import Badge from "../../../components/ui/Badge";
import { useAuth } from "../../../hooks/useAuth";
import {
  REQUISITOS_CONTRASENA,
  contrasenaCumplePolitica,
} from "../../../lib/politicaContrasena";
import {
  aplicarAltoContrasteEnDocumento,
  aplicarEscalaEnDocumento,
  escucharPreferenciasAccesibilidad,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  guardarAltoContraste,
  guardarEscala,
  obtenerAltoContrasteGuardado,
  obtenerEscalaGuardada,
} from "../../../lib/themeStorage";
import { cambiarContrasenaPerfil } from "../../../services/perfil.service";

// Formatea la fecha de alta (America/Bogota se asume en datos del servidor)
function formatearMiembroDesde(valor: string | null | undefined): string {
  if (!valor) return "—";
  try {
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "—";
  }
}

function mensajeErrorApi(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = err as {
      response?: {
        data?: { message?: string; errores?: Record<string, string[]> };
      };
    };
    const data = r.response?.data;
    if (data?.message) return data.message;
    const errores = data?.errores;
    if (errores && typeof errores === "object") {
      const primera = Object.values(errores)[0];
      if (Array.isArray(primera) && primera[0]) return primera[0];
    }
  }
  return "No se pudo completar la operación.";
}

export default function PerfilPage() {
  const { usuario } = useAuth();

  const [escalaTexto, setEscalaTexto] = useState(1);
  const [altoContraste, setAltoContraste] = useState(false);

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [enviandoPassword, setEnviandoPassword] = useState(false);

  // Sincroniza controles de accesibilidad con localStorage al entrar
  useEffect(() => {
    const escala = obtenerEscalaGuardada();
    if (escala != null) {
      setEscalaTexto(escala);
      aplicarEscalaEnDocumento(escala);
    }
    const hc = obtenerAltoContrasteGuardado();
    setAltoContraste(hc);
    aplicarAltoContrasteEnDocumento(hc);
  }, []);

  useEffect(() => {
    return escucharPreferenciasAccesibilidad(() => {
      const g = obtenerEscalaGuardada();
      if (g != null) {
        setEscalaTexto(g);
        aplicarEscalaEnDocumento(g);
      }
      const hc = obtenerAltoContrasteGuardado();
      setAltoContraste(hc);
      aplicarAltoContrasteEnDocumento(hc);
    });
  }, []);

  function aumentarTexto() {
    const nueva = Math.min(
      parseFloat((escalaTexto + 0.1).toFixed(1)),
      FONT_SCALE_MAX
    );
    setEscalaTexto(nueva);
    aplicarEscalaEnDocumento(nueva);
    guardarEscala(nueva);
  }

  function reducirTexto() {
    const nueva = Math.max(
      parseFloat((escalaTexto - 0.1).toFixed(1)),
      FONT_SCALE_MIN
    );
    setEscalaTexto(nueva);
    aplicarEscalaEnDocumento(nueva);
    guardarEscala(nueva);
  }

  function toggleAltoContraste() {
    const siguiente = !altoContraste;
    setAltoContraste(siguiente);
    aplicarAltoContrasteEnDocumento(siguiente);
    guardarAltoContraste(siguiente);
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!contrasenaCumplePolitica(passwordNueva)) {
      await Swal.fire({
        icon: "warning",
        title: "Contraseña no válida",
        text: "Revisa que la nueva contraseña cumpla todos los requisitos.",
        confirmButtonColor: "#3DAE2B",
      });
      return;
    }
    if (passwordNueva !== passwordConfirm) {
      await Swal.fire({
        icon: "warning",
        title: "Las contraseñas no coinciden",
        text: "Escribe la misma contraseña en los dos campos de la nueva clave.",
        confirmButtonColor: "#3DAE2B",
      });
      return;
    }

    setEnviandoPassword(true);
    try {
      await cambiarContrasenaPerfil({
        password_actual: passwordActual,
        password: passwordNueva,
        password_confirmation: passwordConfirm,
      });
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirm("");
      await Swal.fire({
        icon: "success",
        title: "Listo",
        text: "Tu contraseña se actualizó correctamente.",
        confirmButtonColor: "#3DAE2B",
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo cambiar",
        text: mensajeErrorApi(err),
        confirmButtonColor: "#3DAE2B",
      });
    } finally {
      setEnviandoPassword(false);
    }
  }

  if (!usuario) {
    return null;
  }

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();
  const esAprendiz = usuario.rol === "aprendiz";
  const activo =
    usuario.activo === undefined ? true : Number(usuario.activo) === 1;

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-verdeClaro flex items-center justify-center dark:bg-slate-800">
          <UserCircle size={22} className="text-verde" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-grisOscuro dark:text-gray-100">
            Mi perfil
          </h1>
          <p className="text-sm text-grisMedio dark:text-gray-400">
            Tu información y preferencias
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Avatar nombre={nombreCompleto} id={usuario.id} size="xl" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-grisOscuro dark:text-gray-100 truncate">
                {nombreCompleto}
              </h2>
              <Badge rol={usuario.rol} />
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-grisMedio dark:text-gray-400">Documento</dt>
                <dd className="font-medium text-grisOscuro dark:text-gray-200">
                  {usuario.documento ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-grisMedio dark:text-gray-400 flex items-center gap-1">
                  <Mail size={14} aria-hidden="true" />
                  Correo
                </dt>
                <dd className="font-medium text-grisOscuro dark:text-gray-200 break-all">
                  {usuario.correo}
                </dd>
              </div>
              <div>
                <dt className="text-grisMedio dark:text-gray-400">Estado</dt>
                <dd className="font-medium text-grisOscuro dark:text-gray-200">
                  {activo ? "Activo" : "Inactivo"}
                </dd>
              </div>
              <div>
                <dt className="text-grisMedio dark:text-gray-400">
                  Miembro desde
                </dt>
                <dd className="font-medium text-grisOscuro dark:text-gray-200">
                  {formatearMiembroDesde(usuario.creado_en)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-verdeClaro/60 border border-verde/20 px-4 py-3 text-sm text-grisOscuro dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200">
          <p>
            Para modificar tu información, comunícate con el administrador:{" "}
            <a
              className="font-semibold text-verdeOscuro underline hover:no-underline dark:text-verde"
              href="mailto:gestradac@sena.edu.co"
            >
              gestradac@sena.edu.co
            </a>
          </p>
        </div>
      </div>

      {!esAprendiz && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={20} className="text-verde" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-grisOscuro dark:text-gray-100">
              Cambiar contraseña
            </h2>
          </div>
          <form onSubmit={(e) => void handleCambiarPassword(e)} className="space-y-4 max-w-md">
            <div>
              <label
                htmlFor="password_actual"
                className="block text-sm font-medium text-grisOscuro dark:text-gray-200 mb-1"
              >
                Contraseña actual
              </label>
              <input
                id="password_actual"
                type="password"
                autoComplete="current-password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password_nueva"
                className="block text-sm font-medium text-grisOscuro dark:text-gray-200 mb-1"
              >
                Nueva contraseña
              </label>
              <input
                id="password_nueva"
                type="password"
                autoComplete="new-password"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
                required
              />
              <ul className="mt-2 space-y-1 text-xs">
                {REQUISITOS_CONTRASENA.map((req) => (
                  <li
                    key={req.id}
                    className={`flex items-center gap-2 ${
                      req.cumple(passwordNueva)
                        ? "text-verdeOscuro dark:text-verde"
                        : "text-grisMedio dark:text-gray-500"
                    }`}
                  >
                    {req.cumple(passwordNueva) ? (
                      <Check size={14} className="shrink-0" aria-hidden="true" />
                    ) : (
                      <Circle size={14} className="shrink-0" aria-hidden="true" />
                    )}
                    {req.texto}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label
                htmlFor="password_confirm"
                className="block text-sm font-medium text-grisOscuro dark:text-gray-200 mb-1"
              >
                Confirmar nueva contraseña
              </label>
              <input
                id="password_confirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
                required
              />
              {passwordConfirm.length > 0 && passwordNueva !== passwordConfirm && (
                <p className="mt-1 text-xs text-error">Las contraseñas no coinciden.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={
                enviandoPassword ||
                !contrasenaCumplePolitica(passwordNueva) ||
                passwordNueva !== passwordConfirm
              }
              className="rounded-lg bg-verde px-4 py-2 text-sm font-semibold text-white hover:bg-verdeOscuro disabled:opacity-50 disabled:pointer-events-none"
            >
              {enviandoPassword ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        </div>
      )}

      {esAprendiz && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-grisMedio dark:border-slate-700 dark:bg-slate-900 dark:text-gray-400 mb-6">
          Tu cuenta de aprendiz no usa contraseña: inicias sesión con correo y
          documento.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-grisOscuro dark:text-gray-100 mb-4">
          Preferencias de accesibilidad
        </h2>
        <p className="text-sm text-grisMedio dark:text-gray-400 mb-4">
          Se guardan en este navegador y se aplican al volver a entrar.
        </p>
        <div className="mb-6">
          <p className="mb-2 flex items-center gap-1.5 text-sm text-grisOscuro dark:text-gray-200">
            <ZoomIn size={14} aria-hidden="true" />
            Tamaño del texto
          </p>
          <div className="flex items-center gap-2 max-w-xs">
            <button
              type="button"
              onClick={reducirTexto}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-grisClaro disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700"
              aria-label="Reducir texto"
              disabled={escalaTexto <= FONT_SCALE_MIN}
            >
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center text-sm font-medium text-grisOscuro dark:text-gray-200">
              {Math.round(escalaTexto * 100)}%
            </span>
            <button
              type="button"
              onClick={aumentarTexto}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-grisClaro disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-700"
              aria-label="Aumentar texto"
              disabled={escalaTexto >= FONT_SCALE_MAX}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between max-w-xs">
          <p className="text-sm text-grisOscuro dark:text-gray-200">
            Alto contraste
          </p>
          <button
            type="button"
            onClick={toggleAltoContraste}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              altoContraste ? "bg-verde" : "bg-gray-300 dark:bg-slate-600"
            }`}
            role="switch"
            aria-checked={altoContraste}
            aria-label="Activar alto contraste"
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                altoContraste ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
