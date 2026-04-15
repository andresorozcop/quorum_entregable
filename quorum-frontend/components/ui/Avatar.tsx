// Componente Avatar — muestra un círculo con las iniciales del usuario
// El color de fondo se calcula automáticamente según el ID del usuario

// Paleta de 8 colores para los avatares (basada en la paleta institucional SENA)
const COLORES_AVATAR: string[] = [
  "#3DAE2B", // verde SENA
  "#1565C0", // azul info
  "#7B1FA2", // morado admin
  "#D32F2F", // rojo error
  "#F9A825", // amarillo advertencia
  "#2E7D22", // verde oscuro
  "#1A1A2E", // azul sidebar
  "#616161", // gris aprendiz
];

// Dimensiones del círculo según el tamaño solicitado
const DIMENSIONES: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-24 h-24 text-2xl",
};

interface AvatarProps {
  nombre: string;
  id: number;
  size?: "sm" | "md" | "lg" | "xl";
}

// Calcula las iniciales a partir del nombre completo
// Ejemplo: "Andres Orozco" → "AO" | "Admin" → "AD"
function obtenerIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    // Primera letra del primer nombre + primera letra del primer apellido
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  // Si es una sola palabra, usamos las dos primeras letras
  return nombre.slice(0, 2).toUpperCase();
}

// Elige el color de fondo basándose en el ID del usuario (módulo 8)
function obtenerColorFondo(id: number): string {
  return COLORES_AVATAR[id % COLORES_AVATAR.length];
}

export default function Avatar({ nombre, id, size = "md" }: AvatarProps) {
  const iniciales = obtenerIniciales(nombre);
  const colorFondo = obtenerColorFondo(id);
  const clasesTamano = DIMENSIONES[size];

  return (
    <div
      className={`${clasesTamano} rounded-full flex items-center justify-center font-semibold text-white select-none shrink-0`}
      style={{ backgroundColor: colorFondo }}
      title={nombre}
      aria-label={`Avatar de ${nombre}`}
    >
      {iniciales}
    </div>
  );
}
