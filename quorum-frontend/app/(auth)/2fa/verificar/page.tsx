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
      <main className="min-h-screen bg-grisClaro flex items-center justify-center p-4">
        <p className="text-sm text-grisMedio">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-grisClaro flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-verdeClaro mb-4">
          <KeyRound className="text-verde" size={32} aria-hidden="true" />
        </div>

        <h1 className="text-xl font-bold text-grisOscuro mb-2">
          Verificación en dos pasos
        </h1>

        <p className="text-sm text-grisMedio mb-6">
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
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest text-grisOscuro focus:ring-2 focus:ring-verde focus:border-verde outline-none"
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
