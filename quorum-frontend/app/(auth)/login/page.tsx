"use client";

// Página de login — Módulo 1 Autenticación
// Dos modos: Staff (correo + contraseña + reCAPTCHA) y Aprendiz (correo + cédula + reCAPTCHA)

import ReCAPTCHA from "react-google-recaptcha";
import { Eye, EyeOff, LogIn, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../../hooks/useAuth";
import { toggleHtmlTheme } from "../../../lib/toggleTheme";
import { QuorumLogo, quorumNombreTextoClases } from "../../../components/branding/QuorumMark";

// Clave pública de reCAPTCHA v2 — PRD §14.1
const RECAPTCHA_SITE_KEY = "6LeBJIUsAAAAALbdEJ-Rvjt7Qc6k51zIJ9qXUlTZ";

// Usuarios de prueba del seeder (PRD §22) — solo para desarrollo
const USUARIOS_PRUEBA = [
  {
    etiqueta: "Admin",
    correo: "andresfelipeorozcopiedrahita@gmail.com",
    password: "Admin123!",
    tipo: "staff" as const,
    color: "#7B1FA2",
  },
  {
    etiqueta: "Coordinador",
    correo: "sbecerra@sena.edu.co",
    password: "Admin123!",
    tipo: "staff" as const,
    color: "#1565C0",
  },
  {
    etiqueta: "Instructor",
    correo: "documentosorozco25@gmail.com",
    password: "Admin123!",
    tipo: "staff" as const,
    color: "#2E7D22",
  },
  {
    etiqueta: "Gestor",
    correo: "mgomez@sena.edu.co",
    password: "Admin123!",
    tipo: "staff" as const,
    color: "#3DAE2B",
  },
  {
    etiqueta: "Aprendiz",
    correo: "andres@aprendiz.sena.edu.co",
    documento: "33333333",
    tipo: "aprendiz" as const,
    color: "#616161",
  },
];

type ModoLogin = "staff" | "aprendiz";

export default function LoginPage() {
  const { login, loginAprendiz, enviando } = useAuth();

  // Modo activo: staff o aprendiz
  const [modo, setModo] = useState<ModoLogin>("staff");

  // Campos del formulario staff
  const [correoStaff, setCorreoStaff] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  // Campos del formulario aprendiz
  const [correoAprendiz, setCorreoAprendiz] = useState("");
  const [documento, setDocumento] = useState("");
  const [recaptchaTokenAprendiz, setRecaptchaTokenAprendiz] = useState<string | null>(null);

  // Referencias a los widgets reCAPTCHA (una por pestaña; no compartir token entre modos)
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const recaptchaRefAprendiz = useRef<ReCAPTCHA>(null);

  const [temaOscuroLogin, setTemaOscuroLogin] = useState(false);
  useEffect(() => {
    setTemaOscuroLogin(document.documentElement.classList.contains("dark"));
  }, []);

  // -----------------------------------------------------------------------
  // Envío del formulario staff
  // -----------------------------------------------------------------------
  async function handleLoginStaff(e: React.FormEvent) {
    e.preventDefault();

    if (!recaptchaToken) {
      await Swal.fire({
        icon: "warning",
        title: "reCAPTCHA requerido",
        text: "Por favor, completa la verificación reCAPTCHA antes de continuar.",
        confirmButtonColor: "#3DAE2B",
      });
      return;
    }

    try {
      await login({
        correo: correoStaff,
        password,
        recaptcha_token: recaptchaToken,
      });
    } catch (error: unknown) {
      // Reseteamos el reCAPTCHA para que el usuario pueda volver a intentar
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);

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
  // Envío del formulario aprendiz
  // -----------------------------------------------------------------------
  async function handleLoginAprendiz(e: React.FormEvent) {
    e.preventDefault();

    if (!recaptchaTokenAprendiz) {
      await Swal.fire({
        icon: "warning",
        title: "reCAPTCHA requerido",
        text: "Por favor, completa la verificación reCAPTCHA antes de continuar.",
        confirmButtonColor: "#3DAE2B",
      });
      return;
    }

    try {
      await loginAprendiz({
        correo: correoAprendiz,
        documento,
        recaptcha_token: recaptchaTokenAprendiz,
      });
    } catch (error: unknown) {
      recaptchaRefAprendiz.current?.reset();
      setRecaptchaTokenAprendiz(null);

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
    if (usuario.tipo === "staff") {
      setModo("staff");
      recaptchaRefAprendiz.current?.reset();
      setRecaptchaTokenAprendiz(null);
      setCorreoStaff(usuario.correo);
      setPassword(usuario.password ?? "");
    } else {
      setModo("aprendiz");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      setCorreoAprendiz(usuario.correo);
      setDocumento(usuario.documento ?? "");
    }
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
    <main className="relative flex min-h-screen items-center justify-center bg-[#F5F5F5] p-4 dark:bg-slate-950">
      <button
        type="button"
        onClick={() => setTemaOscuroLogin(toggleHtmlTheme())}
        className="absolute right-4 top-4 rounded-lg p-2 text-[#333333] hover:bg-white/80 dark:text-amber-200 dark:hover:bg-slate-800"
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
              className={`text-[1.815rem] leading-tight text-[#1a1a1a] dark:text-white ${quorumNombreTextoClases}`}
            >
              QUORUM
            </span>
          </h1>
          <p className="mt-3 text-sm text-[#9E9E9E] dark:text-gray-400">
            Sistema de Control de Asistencia — SENA
          </p>
        </div>

        {/* Tarjeta principal */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md dark:border dark:border-slate-700 dark:bg-slate-900">
          {/* Pestañas: Staff / Aprendiz */}
          <div className="flex border-b border-[#F5F5F5] dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setModo("staff");
                recaptchaRefAprendiz.current?.reset();
                setRecaptchaTokenAprendiz(null);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                modo === "staff"
                  ? "border-b-2 border-[#3DAE2B] bg-[#E8F5E9] text-[#3DAE2B] dark:bg-slate-800/80"
                  : "text-[#9E9E9E] hover:text-[#333333] dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Instructor / Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setModo("aprendiz");
                recaptchaRef.current?.reset();
                setRecaptchaToken(null);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                modo === "aprendiz"
                  ? "border-b-2 border-[#3DAE2B] bg-[#E8F5E9] text-[#3DAE2B] dark:bg-slate-800/80"
                  : "text-[#9E9E9E] hover:text-[#333333] dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Aprendiz
            </button>
          </div>

          <div className="p-6">
            {/* ============================================================
                FORMULARIO STAFF
                ============================================================ */}
            {modo === "staff" && (
              <form onSubmit={handleLoginStaff} noValidate>
                <div className="space-y-4">
                  {/* Campo correo */}
                  <div>
                    <label
                      htmlFor="correo-staff"
                      className="block text-sm font-medium text-[#333333] mb-1"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="correo-staff"
                      type="email"
                      value={correoStaff}
                      onChange={(e) => setCorreoStaff(e.target.value)}
                      placeholder="usuario@sena.edu.co"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE2B] focus:border-transparent"
                    />
                  </div>

                  {/* Campo contraseña con toggle de visibilidad */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#333333] mb-1"
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
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE2B] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E] hover:text-[#333333]"
                        aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* reCAPTCHA v2 */}
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={RECAPTCHA_SITE_KEY}
                      onChange={(token) => setRecaptchaToken(token)}
                      onExpired={() => setRecaptchaToken(null)}
                      hl="es"
                    />
                  </div>

                  {/* Botón de envío — deshabilitado mientras se procesa o sin reCAPTCHA */}
                  <button
                    type="submit"
                    disabled={enviando || !recaptchaToken}
                    className="w-full flex items-center justify-center gap-2 bg-[#3DAE2B] hover:bg-[#2E7D22] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Iniciando sesión...
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
            )}

            {/* ============================================================
                FORMULARIO APRENDIZ
                ============================================================ */}
            {modo === "aprendiz" && (
              <form onSubmit={handleLoginAprendiz} noValidate>
                <div className="space-y-4">
                  <p className="text-xs text-[#9E9E9E] bg-[#F5F5F5] rounded-lg p-3">
                    Ingresa con tu correo institucional y número de cédula.
                    No necesitas contraseña.
                  </p>

                  {/* Campo correo */}
                  <div>
                    <label
                      htmlFor="correo-aprendiz"
                      className="block text-sm font-medium text-[#333333] mb-1"
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="correo-aprendiz"
                      type="email"
                      value={correoAprendiz}
                      onChange={(e) => setCorreoAprendiz(e.target.value)}
                      placeholder="aprendiz@sena.edu.co"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE2B] focus:border-transparent"
                    />
                  </div>

                  {/* Campo documento (cédula) */}
                  <div>
                    <label
                      htmlFor="documento"
                      className="block text-sm font-medium text-[#333333] mb-1"
                    >
                      Número de cédula
                    </label>
                    <input
                      id="documento"
                      type="text"
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                      placeholder="Tu número de cédula"
                      required
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3DAE2B] focus:border-transparent"
                    />
                  </div>

                  {/* reCAPTCHA v2 */}
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRefAprendiz}
                      sitekey={RECAPTCHA_SITE_KEY}
                      onChange={(token) => setRecaptchaTokenAprendiz(token)}
                      onExpired={() => setRecaptchaTokenAprendiz(null)}
                      hl="es"
                    />
                  </div>

                  {/* Botón de envío — deshabilitado mientras se procesa o sin reCAPTCHA */}
                  <button
                    type="submit"
                    disabled={enviando || !recaptchaTokenAprendiz}
                    className="w-full flex items-center justify-center gap-2 bg-[#3DAE2B] hover:bg-[#2E7D22] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn size={16} />
                        Ingresar
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Panel de acceso rápido: no se incluye en el build de producción */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
              <p className="text-xs font-medium text-amber-700">
                Acceso rápido de pruebas (solo desarrollo)
              </p>
            </div>
            <div className="p-3 flex flex-wrap gap-2">
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
            <p className="px-4 pb-3 text-xs text-[#9E9E9E]">
              Haz clic para rellenar el formulario. En ambas pestañas debes resolver el reCAPTCHA
              manualmente antes de ingresar.
            </p>
          </div>
        )}

        {/* Pie de página */}
        <p className="text-center text-xs text-[#9E9E9E] mt-4">
          SENA — QUORUM v1.0
        </p>
      </div>
    </main>
  );
}
