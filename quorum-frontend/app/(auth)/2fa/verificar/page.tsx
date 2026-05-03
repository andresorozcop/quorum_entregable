"use client";

// Verificación TOTP en cada inicio de sesión (usuario ya tiene 2FA activo)

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuthContext } from "../../../../contexts/AuthContext";
import { verificarCodigo2FA } from "../../../../services/totp.service";

export default function Verificar2FAPage() {
  const router = useRouter();
  const { usuario, cargando, totpSesionCompleta, recargarUsuario, logout } =
    useAuthContext();

  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);

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
    if (totpSesionCompleta) {
      router.replace("/dashboard");
      return;
    }
    if (!usuario.totp_configurado) {
      router.replace("/2fa/configurar");
    }
  }, [cargando, usuario, totpSesionCompleta, router]);

  async function handleSubmit(e: React.FormEvent) {
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
      await verificarCodigo2FA(limpio);
      await recargarUsuario();
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
          : "No se pudo verificar el código.";
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

  async function handleVolverLogin() {
    await logout();
    router.replace("/login");
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
          <KeyRound className="text-verde dark:text-verdeClaro" size={32} aria-hidden="true" />
        </div>

        <h1 className="mb-2 text-xl font-bold text-foreground">
          Verificación en dos pasos
        </h1>

        <p className="mb-6 text-sm text-muted">
          Ingresa el código de 6 dígitos que muestra tu aplicación de
          autenticación.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="codigo-verify" className="sr-only">
            Código TOTP
          </label>
          <input
            id="codigo-verify"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={codigo}
            onChange={(e) =>
              setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="quorum-input py-3 text-center text-lg tracking-widest focus:border-verde focus:ring-verde"
          />
          <button
            type="submit"
            disabled={enviando || codigo.length !== 6}
            className="w-full py-3 rounded-lg bg-verde text-white font-semibold hover:bg-verdeOscuro disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? "Verificando..." : "Continuar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void handleVolverLogin()}
          className="mt-6 text-sm text-verde hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </main>
  );
}
