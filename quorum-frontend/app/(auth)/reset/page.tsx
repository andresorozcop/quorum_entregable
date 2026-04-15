"use client";

// Página para establecer nueva contraseña — Módulo 2
// Se accede desde el enlace enviado por correo: /reset?token=XXXXX
// Incluye validación en tiempo real de la política de contraseñas

import { CheckCircle, Eye, EyeOff, KeyRound, Lock, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Swal from "sweetalert2";
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
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
          <XCircle className="text-[#D32F2F]" size={28} />
        </div>
        <h2 className="text-lg font-semibold text-[#333333] mb-2">
          Enlace inválido
        </h2>
        <p className="text-sm text-[#9E9E9E] mb-5">
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
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-[#333333] mb-1">
        Nueva contraseña
      </h2>
      <p className="text-sm text-[#9E9E9E] mb-5">
        Elige una contraseña segura para tu cuenta. Debe cumplir todos los
        requisitos que se muestran abajo.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Campo nueva contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
              />
              <input
                id="password"
                type={mostrarPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={enviando}
                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE2B] focus:border-transparent disabled:opacity-60"
              />
              {/* Botón para mostrar/ocultar contraseña */}
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-[#333333]"
                aria-label={mostrarPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Indicadores de política en tiempo real */}
          {password.length > 0 && (
            <div className="bg-[#F5F5F5] rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-[#333333] mb-2">
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
                      r.cumplido ? "text-[#3DAE2B]" : "text-[#9E9E9E]"
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
              className="block text-sm font-medium text-[#333333] mb-1"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
              />
              <input
                id="confirmacion"
                type={mostrarConfirm ? "text" : "password"}
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                placeholder="Repite la contraseña"
                required
                disabled={enviando}
                className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE2B] focus:border-transparent disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirm(!mostrarConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-[#333333]"
                aria-label={mostrarConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Indicador de coincidencia de contraseñas */}
            {confirmacion.length > 0 && (
              <p
                className={`text-xs mt-1 flex items-center gap-1 ${
                  passwordsCoinciden ? "text-[#3DAE2B]" : "text-[#D32F2F]"
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
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <span className="inline-block w-8 h-8 border-4 border-[#3DAE2B] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#9E9E9E] mt-3">Verificando enlace...</p>
    </div>
  );
}

// Página principal — envuelve el formulario en Suspense (requerido por useSearchParams en App Router)
export default function ResetPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Encabezado con logo SENA */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#3DAE2B] mb-3">
            <KeyRound className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#333333]">QUORUM</h1>
          <p className="text-sm text-[#9E9E9E] mt-1">
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
        <p className="text-center text-xs text-[#9E9E9E] mt-4">
          SENA CPIC — QUORUM v1.0
        </p>
      </div>
    </main>
  );
}
