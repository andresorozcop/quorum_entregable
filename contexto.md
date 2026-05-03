# CONTEXTO VIVO — QUORUM (leer en chats nuevos)

Este archivo existe para que el asistente retome el proyecto **rápido** (bajo costo en tokens) cuando cambias de chat. Mantenerlo **corto**: si crece, mover detalle a `DECISIONS.md` o `CHANGELOG.md`.

## 1) Qué es QUORUM (2–4 líneas)
QUORUM digitaliza el control de asistencia de **aprendices SENA (CPIC)**. Instructores registran asistencia por ficha, aprendices consultan historial, coordinador audita, y se genera el **Excel oficial CPIC** desde plantilla institucional.

- **Idioma UI**: español (Colombia)
- **Zona horaria**: `America/Bogota` (UTC-5)

## 2) Stack y arquitectura (lo mínimo)
- **Frontend**: Next.js (App Router) + TypeScript **strict** + Tailwind
- **Backend**: Laravel + PHP 8.2+ + Sanctum (SPA stateful cookies)
- **BD**: MySQL/MariaDB (XAMPP)
- **Excel**: PhpSpreadsheet (plantilla CPIC)
- **Alertas/Iconos**: SweetAlert2 / Lucide React
- **reCAPTCHA**: v3 en login (staff y aprendiz según implementación)
- **2FA**: TOTP para staff (aprendiz no usa 2FA)

**Reglas inamovibles**
- Eloquent/Query Builder (no SQL concatenado).
- Autorización **siempre** en servidor (Policies/Gates + middleware por rol).
- Validación en frontend y backend (Form Requests).
- Soft delete lógico por `activo=0` en datos de negocio.
- No usar `alert()`/`confirm()`/`prompt()` nativos.

## 3) Roles (resumen operativo)
- **admin**: CRUD total + configuración + reportes
- **coordinador**: solo lectura global + estadísticas/auditoría
- **instructor / gestor_grupo**: tomar asistencia en sus días asignados; edición limitada a lo permitido por políticas
- **aprendiz**: solo su historial (sin IDOR)

Restricción clave: **admin no puede desactivarse/eliminarse a sí mismo**.

## 4) Modelo de datos (alto nivel)
Entidades núcleo: `usuarios`, `fichas_caracterizacion`, `horarios/jornadas`, `sesiones`, `registros_asistencia`, `dias_festivos`, `configuracion`.

Reglas de asistencia:
- No domingos ni festivos (`dias_festivos.activo=1`).
- Al guardar sesión: deben quedar registros para **todos** los aprendices activos de la ficha.
- Si se corrige un registro: auditar (backup) antes de modificar.

## 5) Endpoints / módulos (solo lo esencial)
Autenticación: `/api/auth/*` + `GET /api/auth/me`.
Core: fichas, usuarios, asistencia (tomar/historial), mi historial (aprendiz), vista coordinador, configuración/festivos, reporte Excel.

## 6) Variables de entorno (solo nombres, nunca secretos)
- Backend: `APP_*`, `DB_*`, `MAIL_*`, `FRONTEND_URL`, `RECAPTCHA_SECRET_KEY`, `RECAPTCHA_V3_MIN_SCORE`, `SANCTUM_STATEFUL_DOMAINS`
- Frontend: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, (si aplica) `NEXT_PUBLIC_SESSION_COOKIE`

**Importante**: no commitear `.env`.

## 7) Cómo correr (dev)
- Frontend: `cd quorum-frontend && npm run dev`
- Backend: `cd quorum-backend && php artisan serve`

## 8) Estado actual (actualiza esto primero)
- **Estado**: QUORUM v1.0 implementado; actualmente estás haciendo **cambios generales** (backend/seguridad/BD/frontend).
- **Dónde estás tocando**: `quorum-backend/` y `quorum-frontend/`.
- **Auth actual**:
  - **Login único**: `POST /api/auth/login` (correo + contraseña + reCAPTCHA v3).
  - **Aprendiz**: contraseña inicial = **documento** (hash), entra sin 2FA y solo ve `/mi-historial`.
  - **Staff**: mantiene flujo TOTP (2FA) para completar sesión.
  - `/api/auth/login-aprendiz` está **deprecado** (410).
- **Riesgos actuales**: cookies/cors/sanctum, permisos por rol, migraciones y datos reales.

## 9) Checklist rápido para cambios (para “hacer bien su trabajo”)
Cuando se agregue o modifique algo:
- **Backend**: Request validation + Policy/Gate + pruebas manuales del endpoint + mensajes en español.
- **Frontend**: tipos TS strict + manejo de errores (SweetAlert2) + loading/disabled en submits.
- **Seguridad**: evitar IDOR; no filtrar por query ids de usuario en endpoints de aprendiz; no exponer secretos.
- **DB**: migración reversible; índices/FK; transacciones si hay multi-tabla.

## 10) Próximos pasos (Top 5)
- [ ] (rellenar) Cambio 1
- [ ] (rellenar) Cambio 2
- [ ] (rellenar) Cambio 3
- [ ] (rellenar) Cambio 4
- [ ] (rellenar) Cambio 5

---
Si necesitas detalle histórico o decisiones largas: crear/usar `DECISIONS.md` (entradas cortas) y `CHANGELOG.md` (resumen por fecha).
