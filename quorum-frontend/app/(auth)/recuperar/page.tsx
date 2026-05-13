"use client";

// Página de recuperación de contraseña — Módulo 2
// El usuario ingresa su correo y recibe un enlace de reset si su cuenta existe

import { KeyRound, Mail, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { QuorumWordmark } from "../../../components/branding/QuorumMark";
import { solicitarReset } from "../../../services/auth.service";

export default function RecuperarPage() {
  const [correo, setCorreo]     = useState("");
  const [enviando, setEnviando] = useState(false);

  // Maneja el envío del formulario
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!correo.trim()) return;

    setEnviando(true);

    try {
      // Llamamos al backend — siempre devuelve el mismo mensaje por seguridad
      await solicitarReset(correo.trim());
    } catch {
      // Aunque falle, mostramos el mismo mensaje genérico (no revelamos información)
    } finally {
      setEnviando(false);
    }

    // Mostramos siempre el mensaje genérico, sin importar si el correo existe o no
    await Swal.fire({
      icon: "info",
      title: "Solicitud enviada",
      text: "Si el correo está registrado, recibirás las instrucciones en tu bandeja de entrada. Revisa también la carpeta de spam.",
      confirmButtonColor: "#3DAE2B",
      confirmButtonText: "Entendido",
    });

    // Limpiamos el campo después de mostrar el mensaje
    setCorreo("");
  }

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

        {/* Tarjeta del formulario */}
        <div className="rounded-xl border border-borderSubtle bg-surface p-6 shadow-md">
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            Recuperar contraseña
          </h2>
          <p className="mb-5 text-sm text-muted">
            Ingresa el correo asociado a tu cuenta. Si existe, recibirás un
            enlace para crear una nueva contraseña.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Campo de correo */}
              <div>
                <label
                  htmlFor="correo"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@sena.edu.co"
                    required
                    disabled={enviando}
                    className="quorum-input pl-9 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Botón de envío — deshabilitado mientras procesa */}
              <button
                type="submit"
                disabled={enviando || !correo.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#3DAE2B] hover:bg-[#2E7D22] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar instrucciones
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Enlace para volver al login */}
        <div className="text-center mt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-[#3DAE2B] hover:underline"
          >
            <ArrowLeft size={14} />
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
