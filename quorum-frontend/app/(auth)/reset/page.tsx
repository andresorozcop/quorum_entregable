"use client";

// Página para establecer nueva contraseña — Módulo 2
// Se accede desde el enlace enviado por correo: /reset?token=XXXXX
// Incluye validación en tiempo real de la política de contraseñas

import { CheckCircle, Eye, EyeOff, KeyRound, Lock, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Swal from "sweetalert2";
import { QuorumWordmark } from "../../../components/branding/QuorumMark";
import { REQUISITOS_CONTRASENA } from "../../../lib/politicaContrasena";
import { procesarReset } from "../../../services/auth.service";

const REQUISITOS = REQUISITOS_CONTRASENA;

// Componente interno que usa useSearchParams (necesita estar dentro de Suspense)
function ResetForm() {
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const token          = searchParams.get("token");

  const [password, setPassword]               = useState("");
  const [confirmacion, setConfirmacion]       = useState("");
  const [mostrarPass, setMostrarPass]         = useState(false);
  const [mostrarConfirm, setMostrarConfirm]   = useState(false);
  const [enviando, setEnviando]               = useState(false);

  // Evaluamos cada requisito en tiempo real con la contraseña actual
  const requisitosEstado = REQUISITOS.map((r) => ({
    ...r,
    cumplido: r.cumple(password),
  }));

  // El formulario solo se puede enviar si todos los requisitos se cumplen
  // y las contraseñas coinciden
  const politicaValida     = requisitosEstado.every((r) => r.cumplido);
  const passwordsCoinciden = password === confirmacion && confirmacion.length > 0;
  const puedeEnviar        = politicaValida && passwordsCoinciden && !enviando;

  // Si no hay token en la URL, mostramos un error amigable
  if (!token) {
    return (
      <div className="rounded-xl border border-borderSubtle bg-surface p-8 text-center shadow-md">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
          <XCircle className="text-error" size={28} />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Enlace inválido
        </h2>
        <p className="mb-5 text-sm text-muted">
          Este enlace de recuperación no es válido o está incompleto.
          Solicita uno nuevo desde la página de recuperación.
        </p>
        <Link
          href="/recuperar"
          className="inline-block text-sm text-[#3DAE2B] hover:underline"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  // Maneja el envío del formulario de nueva contraseña
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // TypeScript: dentro del closure el token sigue siendo string | null; aquí lo estrechamos
    if (!token) return;
    if (!puedeEnviar) return;

    setEnviando(true);

    try {
      // Enviamos el token junto con la nueva contraseña al backend
      await procesarReset(token, password, confirmacion);

      // Éxito: informamos y redirigimos al login
      await Swal.fire({
        icon: "success",
        title: "¡Contraseña actualizada!",
        text: "Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión.",
        confirmButtonColor: "#3DAE2B",
        confirmButtonText: "Ir al inicio de sesión",
      });

      router.push("/login");
    } catch (error: unknown) {
      // Obtenemos el mensaje de error del backend si existe
      const mensaje = obtenerMensajeError(error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo actualizar la contraseña",
        text: mensaje,
        confirmButtonColor: "#3DAE2B",
      });
    } finally {
      setEnviando(false);
    }
  }

  // Extrae el mensaje de error de la respuesta de axios
  function obtenerMensajeError(error: unknown): string {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data
    ) {
      return String((error.response.data as { message: string }).message);
    }
    return "Ocurrió un error inesperado. Intenta de nuevo.";
  }

  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-6 shadow-md">
      <h2 className="mb-1 text-lg font-semibold text-foreground">
        Nueva contraseña
      </h2>
      <p className="mb-5 text-sm text-muted">
        Elige una contraseña segura para tu cuenta. Debe cumplir todos los
        requisitos que se muestran abajo.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Campo nueva contraseña */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="password"
                type={mostrarPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={enviando}
                className="quorum-input pl-9 pr-10 disabled:opacity-60"
              />
              {/* Botón para mostrar/ocultar contraseña */}
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                aria-label={mostrarPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Indicadores de política en tiempo real */}
          {password.length > 0 && (
            <div className="space-y-1.5 rounded-lg bg-surfaceMuted p-3">
              <p className="mb-2 text-xs font-medium text-foreground">
                Requisitos de contraseña:
              </p>
              {requisitosEstado.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  {r.cumplido ? (
                    <CheckCircle size={14} className="text-[#3DAE2B] flex-shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-[#D32F2F] flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      r.cumplido ? "text-verde" : "text-muted"
                    }`}
                  >
                    {r.texto}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Campo confirmar contraseña */}
          <div>
            <label
              htmlFor="confirmacion"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="confirmacion"
                type={mostrarConfirm ? "text" : "password"}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                placeholder="Repite la contraseña"
                required
                disabled={enviando}
                className="quorum-input pl-9 pr-10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirm(!mostrarConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                aria-label={mostrarConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Indicador de coincidencia de contraseñas */}
            {confirmacion.length > 0 && (
              <p
                className={`mt-1 flex items-center gap-1 text-xs ${
                  passwordsCoinciden ? "text-verde" : "text-error"
                }`}
              >
                {passwordsCoinciden ? (
                  <CheckCircle size={12} />
                ) : (
                  <XCircle size={12} />
                )}
                {passwordsCoinciden
                  ? "Las contraseñas coinciden"
                  : "Las contraseñas no coinciden"}
              </p>
            )}
          </div>

          {/* Botón de envío — solo habilitado cuando todo es válido */}
          <button
            type="submit"
            disabled={!puedeEnviar}
            className="w-full flex items-center justify-center gap-2 bg-[#3DAE2B] hover:bg-[#2E7D22] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <KeyRound size={16} />
                Guardar nueva contraseña
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente de carga mientras se resuelve useSearchParams
function CargandoReset() {
  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-8 text-center shadow-md">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-verde border-t-transparent" />
      <p className="mt-3 text-sm text-muted">Verificando enlace...</p>
    </div>
  );
}

// Página principal — envuelve el formulario en Suspense (requerido por useSearchParams en App Router)
export default function ResetPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-grisClaro p-4 dark:bg-background">
      <div className="w-full max-w-md">
        {/* Encabezado con logo SENA */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-verde">
            <KeyRound className="text-white" size={32} />
          </div>
          <h1 className="m-0 p-0">
            <QuorumWordmark variant="auth" />
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sistema de Control de Asistencia — SENA CPIC
          </p>
        </div>

        {/* Suspense necesario porque useSearchParams solo funciona en el cliente */}
        <Suspense fallback={<CargandoReset />}>
          <ResetForm />
        </Suspense>

        {/* Enlace para volver al login */}
        <div className="text-center mt-4">
          <Link
            href="/login"
            className="text-sm text-[#3DAE2B] hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>

        {/* Pie de página */}
        <p className="mt-4 text-center text-xs text-muted">
          SENA CPIC — QUORUM v1.0
        </p>
      </div>
    </main>
  );
}
