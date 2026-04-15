"use client";

// Hook principal de autenticación — simplifica el consumo del AuthContext
// Centraliza la lógica de login con redirección según rol y estado de 2FA

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import {
  loginAprendiz as loginAprendizServicio,
  loginStaff as loginStaffServicio,
} from "../services/auth.service";
import type { LoginAprendizPayload, LoginStaffPayload } from "../types/auth";

export function useAuth() {
  const router = useRouter();
  const {
    usuario,
    totpSesionCompleta,
    nombreSistema,
    cargando,
    isAuthenticated,
    setUsuario,
    setTotpSesionCompleta,
    setNombreSistema,
    logout,
    recargarUsuario,
  } = useAuthContext();

  // Estado local para saber si hay una petición en curso (deshabilitar botón de enviar)
  const [enviando, setEnviando] = useState(false);

  // Login para staff — redirige según el estado del 2FA
  const login = useCallback(
    async (datos: LoginStaffPayload) => {
      setEnviando(true);
      try {
        const respuesta = await loginStaffServicio(datos);
        const usuarioActual = respuesta.usuario;
        setUsuario(usuarioActual);
        setTotpSesionCompleta(respuesta.totp_sesion_completa);
        if (respuesta.nombre_sistema?.trim()) {
          setNombreSistema(respuesta.nombre_sistema.trim());
        }

        // Decidimos a dónde ir según si ya tiene 2FA configurado o no
        if (!usuarioActual.totp_configurado) {
          router.push("/2fa/configurar");
        } else {
          router.push("/2fa/verificar");
        }
      } finally {
        setEnviando(false);
      }
    },
    [router, setUsuario, setTotpSesionCompleta, setNombreSistema]
  );

  // Login para aprendices — va directo al historial personal
  const loginAprendiz = useCallback(
    async (datos: LoginAprendizPayload) => {
      setEnviando(true);
      try {
        const respuesta = await loginAprendizServicio(datos);
        setUsuario(respuesta.usuario);
        setTotpSesionCompleta(respuesta.totp_sesion_completa);
        if (respuesta.nombre_sistema?.trim()) {
          setNombreSistema(respuesta.nombre_sistema.trim());
        }
        router.push("/mi-historial");
      } finally {
        setEnviando(false);
      }
    },
    [router, setUsuario, setTotpSesionCompleta, setNombreSistema]
  );

  // Logout — cierra sesión y redirige al login
  const cerrarSesion = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  return {
    usuario,
    totpSesionCompleta,
    nombreSistema,
    isAuthenticated,
    cargando,
    enviando,
    login,
    loginAprendiz,
    logout: cerrarSesion,
    recargarUsuario,
  };
}
