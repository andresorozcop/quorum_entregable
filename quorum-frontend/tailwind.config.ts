import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        surfaceMuted: "var(--surface-muted)",
        borderSubtle: "var(--border-subtle)",
        muted: "var(--muted-foreground)",
        input: "var(--input-background)",
        ring: "var(--ring)",
        // Paleta institucional SENA
        verde: "#3DAE2B",
        verdeOscuro: "#2E7D22",
        verdeClaro: "#E8F5E9",
        sidebar: "#1A1A2E",
        grisOscuro: "#333333",
        grisMedio: "#9E9E9E",
        grisClaro: "#F5F5F5",
        error: "#D32F2F",
        advertencia: "#F9A825",
        info: "#1565C0",
        // Colores de tipo de asistencia
        presente: "#3DAE2B",
        falla: "#D32F2F",
        excusa: "#F9A825",
        parcial: "#1565C0",
        // Colores de badge por rol
        rolAdmin: "#7B1FA2",
        rolCoordinador: "#1565C0",
        rolInstructor: "#2E7D22",
        rolGestor: "#3DAE2B",
        rolAprendiz: "#616161",
      },
    },
  },
  plugins: [],
};
export default config;
