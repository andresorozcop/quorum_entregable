"use client";

// Sidebar — barra lateral de navegación del dashboard
// Cambia el menú según el rol del usuario autenticado
// En móvil se oculta y abre con el botón hamburguesa del Headbar

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FolderOpen,
  History,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "./Avatar";
import Badge from "./Badge";
import { QuorumLogo, quorumNombreTextoClases } from "../branding/QuorumMark";
import type { RolUsuario } from "../../types/usuario";

// Estructura de un ítem del menú lateral
interface ItemMenu {
  etiqueta: string;
  ruta: string;
  Icono: React.ElementType;
}

// Menú de navegación diferente para cada rol — PRD §11
const MENU_POR_ROL: Record<RolUsuario, ItemMenu[]> = {
  admin: [
    { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard },
    { etiqueta: "Usuarios", ruta: "/usuarios", Icono: Users },
    { etiqueta: "Fichas", ruta: "/fichas", Icono: FolderOpen },
    { etiqueta: "Centros de formación", ruta: "/centros-formacion", Icono: Building2 },
    { etiqueta: "Historial de asistencia", ruta: "/asistencia/historial", Icono: History },
    { etiqueta: "Auditoría de asistencia", ruta: "/asistencia/auditoria", Icono: ClipboardList },
    { etiqueta: "Vista coordinador", ruta: "/coordinador", Icono: BarChart3 },
    { etiqueta: "Configuración", ruta: "/configuracion", Icono: Settings },
  ],
  coordinador: [
    { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard },
    { etiqueta: "Vista coordinador", ruta: "/coordinador", Icono: BarChart3 },
    { etiqueta: "Historial de asistencia", ruta: "/asistencia/historial", Icono: History },
  ],
  instructor: [
    { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard },
    { etiqueta: "Tomar asistencia", ruta: "/asistencia/tomar", Icono: ClipboardCheck },
    { etiqueta: "Historial", ruta: "/asistencia/historial", Icono: History },
  ],
  gestor_grupo: [
    { etiqueta: "Dashboard", ruta: "/dashboard", Icono: LayoutDashboard },
    { etiqueta: "Tomar asistencia", ruta: "/asistencia/tomar", Icono: ClipboardCheck },
    { etiqueta: "Historial", ruta: "/asistencia/historial", Icono: History },
  ],
  aprendiz: [
    { etiqueta: "Mi historial", ruta: "/mi-historial", Icono: BookOpen },
    { etiqueta: "Mi perfil", ruta: "/perfil", Icono: UserCircle },
  ],
};

interface SidebarProps {
  // Controla si el sidebar está visible en móvil
  abierto: boolean;
  // Función para cerrarlo (llamada desde el overlay o el botón X)
  onCerrar: () => void;
}

export default function Sidebar({ abierto, onCerrar }: SidebarProps) {
  const { usuario } = useAuth();
  // usePathname devuelve la ruta actual para resaltar el ítem activo
  const pathname = usePathname();

  // Si no hay usuario autenticado, no renderizamos el sidebar
  if (!usuario) return null;

  const items = MENU_POR_ROL[usuario.rol] ?? [];

  return (
    <>
      {/* Overlay semitransparente — solo visible en móvil cuando el sidebar está abierto */}
      {/* Al hacer clic cierra el sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${
          abierto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-sidebar text-white
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${abierto ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Menú de navegación"
      >
        {/* Marca Quorum — logo + nombre en blanco (fondo oscuro del sidebar) */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <QuorumLogo variant="sidebar" />
          <div className="min-w-0 flex-1">
            <p className={`text-[1.05875rem] leading-none text-white ${quorumNombreTextoClases}`}>
              QUORUM
            </p>
            <p className="mt-1 text-[0.9075rem] leading-tight text-white/50">SENA</p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MENÚ DE NAVEGACIÓN                                                  */}
        {/* ------------------------------------------------------------------ */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {items.map(({ etiqueta, ruta, Icono }) => {
              // Un ítem está activo si la ruta actual empieza con su ruta
              // Excepción: /dashboard solo activo si es exactamente /dashboard
              const esActivo =
                ruta === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(ruta);

              return (
                <li key={ruta}>
                  <Link
                    href={ruta}
                    onClick={onCerrar}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-150
                      ${
                        esActivo
                          ? "bg-verdeOscuro text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                    aria-current={esActivo ? "page" : undefined}
                  >
                    <Icono size={18} aria-hidden="true" />
                    {etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ------------------------------------------------------------------ */}
        {/* PERFIL DEL USUARIO — Parte inferior                                 */}
        {/* ------------------------------------------------------------------ */}
        <div className="px-4 py-4 border-t border-white/10">
          <Link
            href="/perfil"
            onClick={onCerrar}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors"
            title="Ver perfil"
          >
            <Avatar
              nombre={`${usuario.nombre} ${usuario.apellido}`}
              id={usuario.id}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {usuario.nombre} {usuario.apellido}
              </p>
              <Badge rol={usuario.rol} size="sm" />
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
