"use client";

// Página de login — Módulo 1 Autenticación
// Login único: correo + contraseña + reCAPTCHA v3

import { Eye, EyeOff, LogIn, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/useAuth";
import { toggleHtmlTheme } from "../../../lib/toggleTheme";
import { QuorumLogo, quorumNombreTextoClases } from "../../../components/branding/QuorumMark";

// Usuarios de prueba del seeder (PRD §22) — solo para desarrollo
const USUARIOS_PRUEBA = [
  {
    etiqueta: "Admin",
    correo: "andresfelipeorozcopiedrahita@gmail.com",
    password: "Admin123!",
    tipo: "unico" as const,
    color: "#7B1FA2",
  },
  {
    etiqueta: "Coordinador",
    correo: "sbecerra@sena.edu.co",
    password: "Admin123!",
    tipo: "unico" as const,
    color: "#1565C0",
  },
  {
    etiqueta: "Instructor",
    correo: "documentosorozco25@gmail.com",
    password: "Admin123!",
    tipo: "unico" as const,
    color: "#2E7D22",
  },
  {
    etiqueta: "Gestor",
    correo: "mgomez@sena.edu.co",
    password: "Admin123!",
    tipo: "unico" as const,
    color: "#3DAE2B",
  },
  {
    etiqueta: "Aprendiz",
    correo: "andres@aprendiz.sena.edu.co",
    password: "33333333",
    tipo: "unico" as const,
    color: "#616161",
  },
];

export default function LoginPage() {
  const { login, enviando } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Campos del formulario
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [generandoToken, setGenerandoToken] = useState(false);

  const [temaOscuroLogin, setTemaOscuroLogin] = useState(false);
  useEffect(() => {
    setTemaOscuroLogin(document.documentElement.classList.contains("dark"));
  }, []);

  async function obtenerTokenRecaptcha(action: string): Promise<string | null> {
    if (!executeRecaptcha) {
      await Swal.fire({
        icon: "warning",
        title: "Verificación no lista",
        text: "Espera un momento y vuelve a intentar. (reCAPTCHA aún está cargando)",
        confirmButtonColor: "#3DAE2B",
      });
      return null;
    }

    try {
      setGenerandoToken(true);
      const token = await executeRecaptcha(action);
      return token || null;
    } catch {
      await Swal.fire({
        icon: "error",
        title: "No se pudo verificar",
        text: "No se pudo generar el token de verificación. Intenta de nuevo.",
        confirmButtonColor: "#3DAE2B",
      });
      return null;
    } finally {
      setGenerandoToken(false);
    }
  }

  // -----------------------------------------------------------------------
  // Envío del formulario (login único)
  // -----------------------------------------------------------------------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const token = await obtenerTokenRecaptcha("login_staff");
    if (!token) return;

    try {
      await login({
        correo,
        password,
        recaptcha_token: token,
      });
    } catch (error: unknown) {
      const mensaje = obtenerMensajeError(error);
      await Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: mensaje,
        confirmButtonColor: "#3DAE2B",
      });
    }
  }

  // -----------------------------------------------------------------------
  // Rellena el formulario con un usuario de prueba
  // -----------------------------------------------------------------------
  function usarUsuarioPrueba(usuario: (typeof USUARIOS_PRUEBA)[number]) {
    setCorreo(usuario.correo);
    setPassword(usuario.password ?? "");
  }

  // -----------------------------------------------------------------------
  // Extrae el mensaje de error del objeto de error de axios
  // -----------------------------------------------------------------------
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
    <main className="relative flex min-h-screen items-center justify-center bg-grisClaro p-4 dark:bg-background">
      <button
        type="button"
        onClick={() => setTemaOscuroLogin(toggleHtmlTheme())}
        className="absolute right-4 top-4 rounded-lg p-2 text-foreground hover:bg-white/80 dark:text-amber-200 dark:hover:bg-surfaceMuted"
        aria-label={temaOscuroLogin ? "Modo claro" : "Modo oscuro"}
      >
        {temaOscuroLogin ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      <div className="w-full max-w-md">
        {/* Encabezado con marca Quorum */}
        <div className="mb-6 text-center">
          <h1 className="flex flex-col items-center gap-3">
            <QuorumLogo variant="hero" priority />
            <span
              className={`text-[1.815rem] leading-tight text-foreground ${quorumNombreTextoClases}`}
            >
              QUORUM
            </span>
          </h1>
          <p className="mt-3 text-sm text-muted">
            Sistema de Control de Asistencia — SENA
          </p>
        </div>

        {/* Tarjeta principal */}
        <div className="overflow-hidden rounded-xl border border-borderSubtle bg-surface shadow-md">
          <div className="p-6">
            <form onSubmit={handleLogin} noValidate>
              <div className="space-y-4">
                {/* Campo correo */}
                <div>
                  <label
                    htmlFor="correo"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@sena.edu.co"
                    required
                    className="quorum-input"
                  />
                </div>

                {/* Campo contraseña con toggle de visibilidad */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={mostrarPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      required
                      className="quorum-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                      aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Botón de envío — deshabilitado mientras se procesa */}
                <button
                  type="submit"
                  disabled={enviando || generandoToken}
                  className="w-full flex items-center justify-center gap-2 bg-[#3DAE2B] hover:bg-[#2E7D22] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando || generandoToken ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      Ingresar
                    </>
                  )}
                </button>

                {/* Enlace de recuperación de contraseña (M2) */}
                <div className="text-center">
                  <a
                    href="/recuperar"
                    className="text-xs text-[#3DAE2B] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Panel de acceso rápido: no se incluye en el build de producción */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 overflow-hidden rounded-xl border border-amber-200 bg-surface shadow-sm dark:border-amber-900/50">
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/40 dark:bg-amber-950/40">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Acceso rápido de pruebas (solo desarrollo)
              </p>
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              {USUARIOS_PRUEBA.map((u) => (
                <button
                  key={u.correo}
                  type="button"
                  onClick={() => usarUsuarioPrueba(u)}
                  className="px-3 py-1 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: u.color }}
                >
                  {u.etiqueta}
                </button>
              ))}
            </div>
            <p className="px-4 pb-3 text-xs text-muted">
              Haz clic para rellenar el formulario.
            </p>
          </div>
        )}

        {/* Pie de página */}
        <p className="mt-4 text-center text-xs text-muted">
          SENA — QUORUM v1.0
        </p>
      </div>
    </main>
  );
}
