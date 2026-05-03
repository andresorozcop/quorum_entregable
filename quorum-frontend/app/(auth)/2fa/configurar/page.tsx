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
      <main className="flex min-h-screen items-center justify-center bg-grisClaro p-4 dark:bg-background">
        <p className="text-sm text-muted">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-grisClaro p-4 dark:bg-background">
      <div className="w-full max-w-md rounded-xl border border-borderSubtle bg-surface p-8 text-center shadow-md">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-verdeClaro dark:bg-verdeOscuro/35">
          <ShieldCheck className="text-verde dark:text-verdeClaro" size={32} aria-hidden="true" />
        </div>

        <h1 className="mb-2 text-xl font-bold text-foreground">
          Configura tu autenticación en dos pasos
        </h1>

        <p className="mb-6 text-left text-sm text-muted">
          Escanea el código QR con Google Authenticator, Microsoft Authenticator
          o Authy e ingresa el código de 6 dígitos para confirmar.
        </p>

        <div className="mb-4 flex min-h-[200px] items-center justify-center rounded-lg bg-grisClaro p-4 dark:bg-surfaceMuted">
          {cargandoQr ? (
            <p className="text-sm text-muted">Generando QR...</p>
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
            <p className="mb-1 text-xs font-medium text-foreground">
              Si no puedes escanear, ingresa manualmente:
            </p>
            <code className="block select-all break-all rounded border border-borderSubtle bg-input p-2 text-xs text-foreground">
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
              className="quorum-input py-3 text-center text-lg tracking-widest focus:border-verde focus:ring-verde"
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
