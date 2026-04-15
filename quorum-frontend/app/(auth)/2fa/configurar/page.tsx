"use client";

// Configuración inicial de TOTP — QR + confirmación con código de 6 dígitos

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import Swal from "sweetalert2";
import { useAuthContext } from "../../../../contexts/AuthContext";
import {
  activarConfiguracion2FA,
  prepararConfiguracion2FA,
} from "../../../../services/totp.service";

export default function Configurar2FAPage() {
  const router = useRouter();
  const { usuario, cargando, totpSesionCompleta, recargarUsuario } =
    useAuthContext();

  const [cargandoQr, setCargandoQr] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secreto, setSecreto] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Redirecciones según sesión y estado 2FA
  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      router.replace("/login");
      return;
    }
    if (usuario.rol === "aprendiz") {
      router.replace("/mi-historial");
      return;
    }
    if (usuario.totp_configurado && totpSesionCompleta) {
      router.replace("/dashboard");
      return;
    }
    if (usuario.totp_configurado && !totpSesionCompleta) {
      router.replace("/2fa/verificar");
    }
  }, [cargando, usuario, totpSesionCompleta, router]);

  const cargarQr = useCallback(async () => {
    if (!usuario || usuario.rol === "aprendiz" || usuario.totp_configurado) {
      return;
    }
    setCargandoQr(true);
    try {
      const datos = await prepararConfiguracion2FA();
      setSecreto(datos.secreto_manual);
      const url = await QRCode.toDataURL(datos.otpauth_url, {
        width: 220,
        margin: 2,
        color: { dark: "#333333", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch {
      await Swal.fire({
        icon: "error",
        title: "No se pudo preparar el código QR",
        text: "Comprueba la conexión o vuelve a iniciar sesión.",
        confirmButtonColor: "#3DAE2B",
      });
    } finally {
      setCargandoQr(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (cargando || !usuario || usuario.rol === "aprendiz") return;
    if (usuario.totp_configurado) return;
    void cargarQr();
  }, [cargando, usuario, cargarQr]);

  async function handleConfirmar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = codigo.replace(/\D/g, "").slice(0, 6);
    if (limpio.length !== 6) {
      await Swal.fire({
        icon: "warning",
        title: "Código incompleto",
        text: "Ingresa los 6 dígitos que muestra tu aplicación.",
        confirmButtonColor: "#3DAE2B",
      });
      return;
    }

    setEnviando(true);
    try {
      await activarConfiguracion2FA(limpio);
      await recargarUsuario();
      await Swal.fire({
        icon: "success",
        title: "Listo",
        text: "Autenticación en dos pasos activada.",
        confirmButtonColor: "#3DAE2B",
      });
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String((err.response.data as { message: string }).message)
          : "No se pudo validar el código.";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonColor: "#3DAE2B",
      });
    } finally {
      setEnviando(false);
    }
  }

  if (cargando || !usuario || usuario.rol === "aprendiz") {
    return (
      <main className="min-h-screen bg-grisClaro flex items-center justify-center p-4">
        <p className="text-sm text-grisMedio">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-grisClaro flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-verdeClaro mb-4">
          <ShieldCheck className="text-verde" size={32} aria-hidden="true" />
        </div>

        <h1 className="text-xl font-bold text-grisOscuro mb-2">
          Configura tu autenticación en dos pasos
        </h1>

        <p className="text-sm text-grisMedio mb-6 text-left">
          Escanea el código QR con Google Authenticator, Microsoft Authenticator
          o Authy e ingresa el código de 6 dígitos para confirmar.
        </p>

        <div className="bg-grisClaro rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
          {cargandoQr ? (
            <p className="text-sm text-grisMedio">Generando QR...</p>
          ) : qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="Código QR para configurar autenticación en dos pasos"
              width={220}
              height={220}
              className="mx-auto"
            />
          ) : (
            <p className="text-sm text-error">No se pudo mostrar el QR.</p>
          )}
        </div>

        {secreto ? (
          <div className="text-left mb-6">
            <p className="text-xs font-medium text-grisOscuro mb-1">
              Si no puedes escanear, ingresa manualmente:
            </p>
            <code className="block text-xs bg-white border border-gray-200 rounded p-2 break-all text-grisOscuro select-all">
              {secreto}
            </code>
          </div>
        ) : null}

        <form onSubmit={handleConfirmar} className="space-y-4 text-left">
          <div>
            <label htmlFor="codigo-totp" className="sr-only">
              Código de 6 dígitos
            </label>
            <input
              id="codigo-totp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Código de 6 dígitos"
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest text-grisOscuro focus:ring-2 focus:ring-verde focus:border-verde outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={enviando || codigo.length !== 6}
            className="w-full py-3 rounded-lg bg-verde text-white font-semibold hover:bg-verdeOscuro disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? "Verificando..." : "Confirmar y continuar"}
          </button>
        </form>

        <Link
          href="/login"
          className="inline-block mt-6 text-sm text-verde hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </main>
  );
}
