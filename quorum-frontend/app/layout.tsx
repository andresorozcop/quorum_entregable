import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import SwalThemeSync from "../components/SwalThemeSync";
import { QUORUM_THEME_INIT_SCRIPT } from "../lib/quorumThemeInitScript";
import "./globals.css";

// Fuente desde Google Fonts — evita depender de archivos .woff locales
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QUORUM — Control de Asistencia SENA CPIC",
  description:
    "Sistema digital de control de asistencia de aprendices del SENA Centro de Procesos Industriales y Construcción.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Evita warning de hidratación cuando extensiones del navegador añaden class al <html> (p. ej. mdl-js)
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <script
          id="quorum-theme-init"
          dangerouslySetInnerHTML={{ __html: QUORUM_THEME_INIT_SCRIPT }}
        />
        {/* AuthProvider provee el estado de sesión a toda la aplicación */}
        <AuthProvider>
          <SwalThemeSync />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
