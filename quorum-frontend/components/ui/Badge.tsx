// Componente Badge — muestra el rol del usuario con su color institucional
// Colores según PRD §4 (Sección 4 — Paleta de roles)

import type { RolUsuario } from "../../types/usuario";

// Etiqueta legible para cada rol (en español, terminología del proyecto)
const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  admin: "Administrador",
  coordinador: "Coordinador",
  instructor: "Instructor",
  gestor_grupo: "Gestor de Grupo",
  aprendiz: "Aprendiz",
};

// Color de fondo y texto para cada rol — PRD §4
const ESTILOS_ROL: Record<RolUsuario, { bg: string; text: string }> = {
  admin: { bg: "#7B1FA2", text: "#ffffff" },
  coordinador: { bg: "#1565C0", text: "#ffffff" },
  instructor: { bg: "#2E7D22", text: "#ffffff" },
  gestor_grupo: { bg: "#3DAE2B", text: "#ffffff" },
  aprendiz: { bg: "#616161", text: "#ffffff" },
};

interface BadgeProps {
  rol: RolUsuario;
  // Tamaño opcional: por defecto 'md'
  size?: "sm" | "md";
}

export default function Badge({ rol, size = "md" }: BadgeProps) {
  const etiqueta = ETIQUETAS_ROL[rol];
  const estilos = ESTILOS_ROL[rol];

  // Clases de tamaño del badge
  const clasesTamano = size === "sm"
    ? "text-xs px-2 py-0.5"
    : "text-xs px-3 py-1";

  return (
    <span
      className={`${clasesTamano} rounded-full font-medium inline-block shrink-0`}
      style={{ backgroundColor: estilos.bg, color: estilos.text }}
    >
      {etiqueta}
    </span>
  );
}
