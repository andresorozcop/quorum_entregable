# contexto.md — QUORUM

## Descripción

**QUORUM** digitaliza el control de asistencia de aprendices del **SENA** (Centro de Procesos Industriales y Construcción — CPIC). Centraliza en una web lo que hoy está en papel o Excel: instructores registran asistencia por ficha, aprendices consultan su historial, el coordinador audita todas las fichas y al cierre de periodo se genera el **Excel oficial CPIC** desde plantilla institucional.

- **Idioma UI:** español (Colombia). **Zona horaria:** `America/Bogota` (UTC-5). **Fechas:** DD/MM/AAAA y HH:MM.
- **Desarrollo local:** XAMPP; URL orientativa `http://localhost/quorum` — frontend **:3000**, API Laravel **:8000**.
- **PRD fuente:** v1.0 (abril 2026), José Germán Estrada Clavijo. Este archivo condensa el contrato funcional/técnico para no depender del PRD completo en cada chat.

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14+ (App Router), TypeScript **strict** (`"strict": true`) |
| Estilos | Tailwind CSS |
| Iconos | Lucide React (**nunca** emojis en UI ni código para iconografía) |
| Alertas | SweetAlert2 (**nunca** `alert()`, `confirm()`, `prompt()` nativos) |
| Backend | Laravel 11+, PHP 8.2+ |
| BD | MySQL 8.0 (XAMPP) |
| API | REST JSON (Next → Laravel con fetch/axios) |
| Auth API | Laravel Sanctum (sesión stateful / cookies para SPA) |
| Excel | PhpSpreadsheet (export CPIC + import aprendices) |
| Correo | Laravel Mail / PHPMailer (SMTP, p. ej. Gmail App Password en `.env`) |
| 2FA | TOTP (p. ej. `pragmarx/google2fa` o clase PHPGangsta/GoogleAuthenticator según implementación) |
| reCAPTCHA | v2 en login (roles con contraseña) |
| Control de versiones | Git — **commit por módulo funcional probado** |

**Reglas de tecnología (inamovibles):** Eloquent/Query Builder en todas las consultas (sin SQL concatenado). Validación en **frontend y backend** (Form Requests). Tailwind para estilos (evitar CSS inline arbitrario). Comentarios de código en **español**, nivel básico.

## Terminología obligatoria (UI)

- Estudiantes → **Aprendices**
- Profesores → **Instructores**
- Clases → **Formación**
- Salones/aulas → **Ambientes de Formación**
- Grupo → **Ficha de Caracterización** / **Ficha**

## Roles y permisos (resumen)

| Rol | Slug | Idea |
|-----|------|------|
| Administrador | `admin` | CRUD total, config, reportes |
| Coordinador académico | `coordinador` | Solo lectura + filtros/estadísticas de todas las fichas |
| Instructor | `instructor` | Asistencia solo en **sus días** asignados; ve compañeros de la misma ficha pero **no** edita sus registros |
| Gestor de grupo | `gestor_grupo` | Igual que instructor; **solo uno activo por ficha** |
| Aprendiz | `aprendiz` | Login **correo + cédula** (sin contraseña, sin reCAPTCHA, sin 2FA); solo **su** historial |

**Restricciones:** Admin no puede desactivarse/eliminarse a sí mismo. Usuario `activo = 0` → mensaje: *"Tu cuenta está desactivada. Comunícate con el administrador."* Sin permiso → **403**, sin filtrar datos en cliente solo. Políticas **Laravel Policy/Gate** en servidor.

## Paleta SENA (referencia rápida)

- Primario: `#3DAE2B` · Oscuro/hover: `#2E7D22` · Claro: `#E8F5E9`
- Sidebar: `#1A1A2E` · Texto principal: `#333333` · Fondos: `#FFFFFF`, `#F5F5F5`
- Error: `#D32F2F` · Advertencia: `#F9A825` · Info: `#1565C0`
- Asistencia: Presente verde, Falla rojo, Excusa amarillo, Parcial azul
- Badges de rol: Admin morado `#7B1FA2`, Coordinador azul `#1565C0`, Instructor verde `#2E7D22`, Gestor `#3DAE2B`, Aprendiz gris `#616161`

**Diseño:** mobile first (375 → 768 → 1024+); tablas con **scroll horizontal** en móvil; avatar = círculo con **dos iniciales** (color por hash del id).

## Modelo de datos — tablas (16)

1. `centros_formacion`
2. `programas_formacion`
3. `usuarios` (todos los roles; aprendices `password` NULL, `ficha_id`)
4. `fichas_caracterizacion`
5. `jornadas_ficha` (mañana/tarde/noche/fin_de_semana; UNIQUE por ficha+tipo)
6. `horarios` (día semana, horas, `instructor_id`, `jornada_ficha_id`)
7. `ficha_instructor` (pivot; `es_gestor` — máximo un gestor por ficha; validar en app + trigger en PRD)
8. `sesiones` (fecha real, `horario_id`, `estado` abierta/cerrada)
9. `registros_asistencia` (tipo: presente/falla/excusa/parcial; `horas_inasistencia` solo si parcial)
10. `registros_asistencia_backup` (auditoría antes de editar)
11. `dias_festivos`
12. `intentos_login` (bloqueo 5 intentos / 15 min)
13. `tokens_reset` (recuperación contraseña, expiración ~1 h)
14. `importaciones_aprendices`
15. `historial_actividad`
16. `configuracion` (clave-valor)

**BD:** `utf8mb4` / `utf8mb4_unicode_ci`; al conectar: `SET time_zone = '-05:00'`. Soft delete con `activo`; sin DELETE físico en datos de negocio. FK con índices. Operaciones multi-tabla en **transacciones**. Modificar asistencia → primero copia en **backup**.

**Import Excel aprendices:** columnas `cedula | nombre_completo | correo`.

**Asistencia:** no tomar en domingos ni días festivos. Instructor solo su día en horario. Al guardar sesión: **todos** los aprendices deben tener registro.

## Estructura de carpetas (objetivo)

```
/quorum/
├── quorum-frontend/          # Next.js
│   ├── app/
│   │   ├── layout.tsx, page.tsx
│   │   ├── (auth)/           # login, 2fa/configurar, 2fa/verificar, recuperar, reset
│   │   └── (dashboard)/      # layout sidebar+headbar: dashboard, fichas, asistencia, usuarios, mi-historial, configuracion, perfil
│   ├── components/ui/        # Sidebar, Headbar, Avatar, Badge, DataTable, Modal, etc.
│   ├── components/asistencia/, fichas/, reportes/
│   ├── hooks/
│   ├── services/             # api.ts, *.service.ts
│   └── types/
├── quorum-backend/           # Laravel API
│   ├── app/Http/Controllers/, Middleware/, Requests/
│   ├── app/Models/
│   ├── app/Policies/
│   ├── app/Services/         # Asistencia, ReporteExcel, Importacion, Totp, etc.
│   ├── database/migrations/, seeders/, quorum.sql
│   ├── routes/api.php
│   └── storage/plantilla_asistencia.xlsx
├── contexto.md
└── README.md
```

## Rutas frontend (referencia)

`/`, `/login`, `/2fa/configurar`, `/2fa/verificar`, `/recuperar`, `/reset`, `/dashboard`, `/fichas`, `/fichas/nueva`, `/fichas/[id]`, `/asistencia/tomar`, `/asistencia/historial`, `/mi-historial`, `/usuarios`, `/usuarios/nuevo`, `/usuarios/[id]/editar`, `/perfil`, `/configuracion` — con roles según PRD (tabla 12 del PRD).

## API backend (referencia)

Autenticación: `POST /api/auth/login`, `login-aprendiz`, `logout`, 2FA, `recuperar`, `reset`. **Fichas (M5):** `GET/POST /api/fichas`, `GET/PUT/DELETE /api/fichas/{id}`, `POST .../instructores`, `POST .../importar-aprendices`, `GET /api/centros-formacion`, `GET /api/programas-formacion`, `GET /api/instructores-disponibles`. **Usuarios (M6):** `GET/POST /api/usuarios`, `PUT/DELETE /api/usuarios/{id}`, `POST /api/usuarios/{id}/reactivar` (admin). **Asistencia (M7–M8):** `POST /api/asistencia/iniciar-sesion`, `POST /api/asistencia/sesiones/{sesion}/guardar`, `PUT /api/asistencia/registros/{registro}` (corrección con sesión cerrada; instructor dueño de la sesión), `GET /api/asistencia/historial/{ficha}` (query: `desde`, `hasta`, `tipo[]` opcionales; admin/coordinador/instructor/gestor; `FichaPolicy::view`). Pendientes M9+: `mi-historial`; reportes; CRUD días festivos — detalle en PRD sección 12.

## Variables de entorno (nombres; valores solo en `.env` local)

`APP_*`, `DB_*`, `MAIL_*`, `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, Sanctum/CORS para `http://localhost:3000`, claves 2FA si aplica. **No subir `.env` al repositorio.**

## Fuera de scope (no construir)

Sin calificaciones/notas; sin integración SofiaPlus en tiempo real; sin alertas automáticas al coordinador por umbrales; sin app nativa (solo web responsive); sin calendarios automáticos complejos (horario semanal manual por ficha); aprendiz **no** descarga Excel CPIC; errores técnicos PHP **no** visibles al usuario final.

## Reglas de oro para Cursor (resumen)

1. Eloquent/Query Builder siempre — nunca SQL crudo concatenado.
2. Validar frontend (TS) y backend (Form Requests).
3. TS strict — evitar `any`.
4. Mensajes amigables en español al usuario.
5. Sanctum + rol en rutas protegidas.
6. SweetAlert2 y Lucide únicamente para alertas e iconos.
7. Soft delete (`activo=0`).
8. utf8mb4 + `America/Bogota`.
9. try/catch donde falle BD/correo/APIs externas.
10. Deshabilitar botón al enviar para evitar doble submit.
11. Transacciones en guardado de asistencia completa.
12. Al editar asistencia: insertar antes en `registros_asistencia_backup`.
13. Aislamiento total de datos entre aprendices.
14. Instructor solo toma/edita asistencia de **sus** días asignados.
15. Sin datos mockeados en producción; datos reales desde BD.

**Metodología:** seguir módulos en orden; probar cada uno antes del siguiente; commit: `feat:` / `fix:` / `chore:` / `docs:` según PRD.

## Módulos

- [x] **Módulo 0** — Setup inicial (Next strict + Tailwind + Lucide + SweetAlert2 + axios + recaptcha; Laravel + Sanctum + PhpSpreadsheet + mail + 2FA; CORS; migraciones MER completas; modelos con relaciones; seeders; `migrate --seed`)
- [x] **Módulo 1** — Autenticación (login + reCAPTCHA + bloqueo intentos; login aprendiz correo+cédula; Sanctum; 2FA configurar/verificar; páginas login y 2FA)
- [x] **Módulo 2** — Recuperación de contraseña (token, correo, `/recuperar`, `/reset`, política de contraseña en UI)
- [x] **Módulo 3** — Layout global (Sidebar por rol, Headbar, Avatar, hamburguesa, accesibilidad, protección Sanctum)
- [x] **Módulo 4** — Dashboard por rol (`/api/dashboard`, cards, datos reales BD)
- [x] **Módulo 5** — Gestión de fichas Admin (CRUD, jornadas, horarios, instructores/gestor único, detalle, import Excel aprendices)
- [x] **Módulo 6** — Gestión de usuarios Admin (CRUD, filtros, soft delete, admin no auto-borra)
- [x] **Módulo 7** — Tomar asistencia (Instructor/Gestor: sesión, validaciones festivo/día, lista completa, parcial con horas, barra progreso, marcar todos presentes)
- [x] **Módulo 8** — Historial / matriz de asistencia (filtros, edición solo instructor dueño del día, scroll horizontal)
- [ ] **Módulo 9** — Vista aprendiz (`mi-historial`, totales, solo lectura, aislamiento)
- [ ] **Módulo 10** — Vista coordinador (pestañas Por Ficha / Por Aprendiz / Estadísticas, filtros cascada, Excel)
- [ ] **Módulo 11** — Reporte Excel CPIC (PhpSpreadsheet, plantilla en memoria, días hábiles, inyección coordenadas según PRD §21)
- [ ] **Módulo 12** — Configuración y festivos Admin (config clave-valor, CRUD festivos, actividad, cambio contraseña propia)
- [ ] **Módulo 13** — Perfil usuario (lectura, mensaje contacto admin, cambio contraseña, preferencias accesibilidad en localStorage)

## Decisiones técnicas importantes

- Frontend y backend **separados**; comunicación HTTP + Sanctum stateful.
- Autorización **siempre** verificada en servidor (Policies/Gates + middleware de rol).
- Tabla espejo `registros_asistencia_backup` para auditoría de cambios en asistencia.
- Un solo `gestor_grupo` por ficha (validación aplicación + trigger SQL del PRD si se usa).
- Reporte CPIC: cargar copia en memoria de `plantilla_asistencia.xlsx`; solo inyectar **horas de inasistencia** (falla = horas de sesión; parcial = horas indicadas; presente/excusa según reglas PRD §21).

## Decisiones tomadas en M1

- **Almacenamiento de sesión:** Sanctum stateful con cookie HTTP-only. Por defecto con `APP_NAME=QUORUM` la cookie se llama `quorum-session` (ver `config/session.php` / `SESSION_COOKIE`). Tras validar credenciales, `Auth::guard('web')->login()`. No se usa localStorage ni tokens Bearer.
- **CSRF:** Se llama a `GET /sanctum/csrf-cookie` antes de cada POST de login para que Sanctum emita el cookie `XSRF-TOKEN`.
- **Estado de usuario:** Se obtiene con `GET /api/auth/me` al montar el `AuthProvider` y se guarda en React Context (`AuthContext`).
- **Bloqueo de intentos:** 5 intentos fallidos en 15 minutos → HTTP 429. Usa el scope `recientesFallidos()` del modelo `IntentoLogin`.
- **Flujo 2FA post-login:** Si `totp_verificado=0` → `/2fa/configurar` (QR + código); si `totp_verificado=1` → `/2fa/verificar`; aprendiz → directo a `/mi-historial`. Detalle técnico en sección **2FA TOTP operativo** más abajo.
- **reCAPTCHA:** Obligatorio para staff. El botón de envío queda deshabilitado hasta resolver el widget. Clave real del PRD §14.1 cargada en `.env`.
- **Mensajes de error:** Genéricos para no revelar si el correo existe. "Tu cuenta está desactivada. Comunícate con el administrador." es el único mensaje específico.
- **Middleware Next.js:** Protege rutas del grupo `(dashboard)` solo si existe la cookie de sesión del backend (`NEXT_PUBLIC_SESSION_COOKIE` en el front, por defecto `quorum-session`). No se usa `XSRF-TOKEN` como señal de login. Redirige al login con parámetro `redirigir`.
- **CORS y Sanctum en dev:** Si Next usa el puerto **3001** (porque 3000 está ocupado), hay que permitir ese origen en `config/cors.php` y en `SANCTUM_STATEFUL_DOMAINS`; si no, `GET /api/auth/me` devuelve 401 porque el navegador no trata la SPA como stateful o CORS no refleja el `Origin` correcto.

## Versiones instaladas (M0)

| Paquete | Versión |
|---------|---------|
| Next.js | 14.2.35 |
| Node.js | 24.11.1 |
| npm | 11.6.2 |
| TypeScript | (strict: true — vía Next 14) |
| lucide-react | última estable |
| sweetalert2 | última estable |
| axios | última estable |
| react-google-recaptcha | última estable |
| Laravel | 12.12.2 (PHP 8.2, compatible con el PRD que pedía 11+) |
| laravel/sanctum | 4.3.1 |
| phpoffice/phpspreadsheet | 5.6.0 |
| pragmarx/google2fa | 9.x (2FA TOTP) |
| qrcode (npm) | generación QR en `/2fa/configurar` |
| PHP | 8.2.12 (XAMPP) |
| Composer | 2.9.2 |
| MySQL | 8.x (XAMPP) |

## Decisiones técnicas tomadas en M0

- Se instaló **Laravel 12** (la versión 13 requiere PHP 8.3; con PHP 8.2 instala la 12). Es 100% compatible con el PRD.
- En Laravel 12 no existe `routes/api.php` por defecto — se creó manualmente y se registró en `bootstrap/app.php`.
- El CORS se configuró en `config/cors.php` (publicado con `php artisan config:publish cors`).
- El modelo `Usuario` extiende `Authenticatable` + usa `HasApiTokens` de Sanctum.
- `config/auth.php` apunta a `App\Models\Usuario` (no al `User` por defecto de Laravel).
- La tabla `personal_access_tokens` de Sanctum se incluye en el conteo total (29 migraciones en total).
- El `AppServiceProvider` aplica `SET time_zone = '-05:00'` solo cuando la BD está disponible (try/catch).
- **XAMPP usa MariaDB** (no MySQL puro) — `RENAME COLUMN` no funciona, se usa `CHANGE COLUMN`.
- El modelo `Usuario` **no** override `getAuthIdentifierName()` — Sanctum usa `id` como identificador por defecto, que es correcto para auth stateful con cookies.
- El login de aprendices (correo + cédula) se valida **manualmente** en el controlador, no vía `Auth::attempt()`.
- Modelo `FichaInstructor` creado explícitamente (existía la tabla pero no el modelo en M0).

## Decisiones tomadas en M2

- **Flujo de reset stateless:** Los endpoints `POST /api/auth/recuperar` y `POST /api/auth/reset` son públicos y no requieren sesión Sanctum. Se llama a `GET /sanctum/csrf-cookie` antes de cada POST por consistencia con M1.
- **Mensaje siempre genérico:** `solicitarReset()` retorna `200` con el mismo mensaje sin importar si el correo existe, está inactivo o es aprendiz. Evita enumeración de cuentas.
- **Aprendices excluidos del reset:** Si el correo corresponde a un usuario con `password = null` (aprendiz), se devuelve el mensaje genérico sin enviar correo. No se revela el motivo.
- **Invalidación de tokens previos:** Antes de crear un nuevo token se marcan como `usado=1` todos los tokens anteriores del mismo usuario, evitando tokens huérfanos válidos.
- **Token de 64 chars:** Generado con `bin2hex(random_bytes(32))` — cabe en `VARCHAR(100)` de `tokens_reset.token`.
- **`totp_secret` no se limpia en reset:** Se mantiene para no obligar a reconfigurar 2FA. Documentado para revisión cuando se complete el módulo 2FA completo.
- **throttle:5,1 en rutas de reset:** Máximo 5 solicitudes por minuto por IP para protección anti-spam.
- **Suspense en `/reset`:** `useSearchParams()` de Next.js App Router requiere que el componente que lo usa esté envuelto en `<Suspense>`. Se usa un componente interno `ResetForm` para aislar el boundary.
- **Correo SMTP:** Gmail en puerto 587 con `MAIL_MAILER=smtp`. **No** usar `MAIL_SCHEME=tls` (Laravel 12 solo admite esquema `smtp`/`smtps` o sin definir; con 587 Laravel aplica STARTTLS). App Password en `MAIL_PASSWORD` entre comillas si lleva espacios.
- **URL del front en correos:** Variable `FRONTEND_URL` en `.env` del backend (expuesta como `config('app.frontend_url')`). El correo de reset usa `{FRONTEND_URL}/reset?token=...` para que coincida con el puerto real (3000, 3001, etc.).
- **Admin de prueba (desarrollo):** el seeder usa `andresfelipeorozcopiedrahita@gmail.com` para recibir correos de recuperación en la misma cuenta SMTP del `.env`. Si la BD ya existía con el correo anterior, ejecutar `php artisan migrate:fresh --seed` o actualizar manualmente la fila en `usuarios`.
- **Instructor de prueba (desarrollo):** el seeder usa `documentosorozco25@gmail.com` (segundo buzón Gmail) para probar recuperación de contraseña y login sin depender solo del admin.

## Problemas resueltos

- Error `Tablespace already exists` al correr `migrate:fresh` — solucionado eliminando y recreando la BD desde PHP.
- Error de referencia circular `usuarios ↔ fichas` — solucionado con migración separada `alter_usuarios_add_ficha_fk`.

## Decisiones tomadas en M3

- **Componentes nuevos creados:** `components/ui/Avatar.tsx`, `components/ui/Badge.tsx`, `components/ui/Sidebar.tsx`, `components/ui/Headbar.tsx`.
- **Layout del dashboard:** `app/(dashboard)/layout.tsx` con `"use client"`, doble capa de protección: middleware (cookie) + `useEffect` que redirige si `!usuario` tras `getMe`.
- **Menú por rol:** admin (Dashboard, Usuarios, Fichas, Historial de asistencia, Configuración), coordinador (Dashboard, Historial), instructor/gestor (Dashboard, Tomar asistencia, Historial), aprendiz (Mi historial). Ítems adicionales del PRD §11 (Programas, Centros, Festivos) quedan para M5/M12.
- **Sidebar en desktop:** `lg:static lg:translate-x-0` — siempre visible sin overlay. En tablet/móvil: `fixed`, controlado por `sidebarAbierto` en el layout.
- **Overlay móvil:** `<div>` semitransparente que cubre el contenido; clic fuera llama `onCerrar()`.
- **Ítem activo:** `usePathname()` del App Router; `/dashboard` solo activo si la ruta es exactamente `/dashboard` (para no activar en `/dashboard/algo`).
- **Avatar:** color de fondo por `id % 8` sobre paleta de 8 colores; iniciales = primera letra nombre + primera letra apellido (o dos primeras letras si es un solo token).
- **Badge:** colores inline via `style` para no depender de clases JIT de Tailwind con valores arbitrarios; etiquetas en español.
- **Accesibilidad:** `--font-scale` en `:root` de `globals.css`; `html { font-size: calc(16px * var(--font-scale)) }`. Alto contraste: clase `high-contrast` en `<html>` con `filter: contrast(1.5)`. Panel en Headbar con botones +/- (rango 0.9–1.3) y toggle switch.
- **Logout:** confirmación con SweetAlert2 antes de llamar al servicio.
- **globals.css:** eliminado bloque `@media (prefers-color-scheme: dark)` que sobreescribía los colores de la paleta SENA.
- **Páginas dashboard:** `/asistencia/historial` implementado en M8; `/asistencia/tomar` en M7; `/usuarios` en M6; `/fichas` en M5; `/dashboard` en M4.

## Decisiones tomadas en M4

- **Endpoint:** `GET /api/dashboard` con `auth:sanctum`; lógica en `DashboardService` y `DashboardController`. Aprendiz recibe **403** en API.
- **Front:** `GET` con axios + cookies (sin Bearer). Página `/dashboard` en cliente: si `rol === aprendiz`, `router.replace('/mi-historial')` sin llamar al API.
- **% asistencia (coordinador, mes actual):** registros `activo=1`, sesiones en el mes; numerador `presente` + `excusa`; denominador total de registros; si no hay datos → `null` y EmptyState en UI.
- **Inasistencia ≥ 20 % (instructor/gestor):** mes actual, solo fichas con `ficha_instructor` activo; ratio = horas ausente (falla = `horas_programadas` de la sesión, parcial = `horas_inasistencia`) / suma de `horas_programadas`.
- **Componentes reutilizables:** `StatCard`, `LoadingSpinner`, `EmptyState`; errores de red con SweetAlert2.

## 2FA TOTP operativo (complemento M1)

- **Backend:** `pragmarx/google2fa` + `App\Services\TotpService`. `POST /api/auth/2fa/configurar` sin `codigo` devuelve `otpauth_url` y `secreto_manual`; con `codigo` valida y pone `totp_verificado=1` y `totp_sesion_ok` en sesión. `POST /api/auth/2fa/verificar` con `codigo` para usuarios ya configurados.
- **Sesión:** Tras login staff, `totp_sesion_ok=false`; tras configurar o verificar TOTP, `totp_sesion_ok=true`. Aprendiz: `totp_sesion_ok=true` al iniciar sesión.
- **GET /api/auth/me:** Incluye `totp_sesion_completa` (boolean). El `AuthContext` guarda `totpSesionCompleta` para el layout.
- **Middleware `EnsureTotpSessionOk`:** aplicado a `GET /api/dashboard` y al grupo de rutas del **Módulo 5** (fichas, catálogos centro/programa, instructores-disponibles, import), **Módulo 6** (`/api/usuarios`) y **Módulo 7** (`/api/asistencia/*`); staff sin 2FA completado en sesión recibe 403.
- **Frontend:** `qrcode` (npm) genera el QR desde `otpauth_url`; `services/totp.service.ts`; layout `(dashboard)` redirige a `/2fa/configurar` o `/2fa/verificar` si el staff aún no completa TOTP en la sesión.

## Decisiones tomadas en M5

- **API fichas:** `FichaController` + `FichaService`; `GET/POST /api/fichas`, `GET/PUT/DELETE /api/fichas/{id}`, `POST /api/fichas/{id}/instructores`, `POST /api/fichas/{id}/importar-aprendices`; catálogos `GET /api/centros-formacion`, `GET /api/programas-formacion`; `GET /api/instructores-disponibles` (admin, formularios).
- **Policies:** `FichaPolicy` (admin CRUD; coordinador lectura global; instructor/gestor lectura solo fichas con `ficha_instructor` activo; aprendiz sin acceso). `CentroFormacionPolicy` / `ProgramaFormacionPolicy` — listado solo **admin** (coordinador no consume esos endpoints en UI).
- **Middleware:** mismo grupo `auth:sanctum` + `EnsureTotpSessionOk` que el dashboard.
- **Payload crear/editar:** cabecera + `instructores[]` (`usuario_id`, `es_gestor`) con **exactamente un** gestor + `jornadas[]` con `horarios[]` (`dia_semana`, `hora_inicio`, `hora_fin`, `instructor_id`). Cada `instructor_id` debe estar en `instructores[]`; roles permitidos `instructor` y `gestor_grupo` activos.
- **horas_programadas:** calculada en servidor con diferencia inicio/fin (redondeo a horas enteras, mínimo 1, máximo 24).
- **Gestor único:** validación en PHP antes de BD; mensaje 422 con **nombre del gestor actual** si hay conflicto; respaldo por trigger SQL existente.
- **Import Excel:** PhpSpreadsheet; columnas `cedula`, `nombre_completo`, `correo`; validación correo y cédula **únicos** en `usuarios`; registro en `importaciones_aprendices` con columna **`importado_por`** (modelo `ImportacionAprendices` alineado a migración PRD).
- **Soft delete ficha:** `DELETE /api/fichas/{id}` pone `activo=0` (no borrado físico).
- **Front:** `components/ui/DataTable.tsx`, `components/fichas/FichaFormulario.tsx`; páginas `/fichas`, `/fichas/nueva`, `/fichas/[id]` con pestañas; modal import con barra de progreso (`onUploadProgress`); SweetAlert2 al desactivar ficha.

## Decisiones tomadas en M6

- **API usuarios:** `UsuarioController` + `StoreUsuarioRequest` / `UpdateUsuarioRequest`; `UsuarioPolicy` (solo `admin`); rutas en grupo `auth:sanctum` + `EnsureTotpSessionOk`.
- **Listado:** filtros `rol`, `busqueda` (nombre, apellido, documento, correo), `activo` opcional; paginación como fichas.
- **Alta staff:** contraseña con política PRD; `TotpService::generarSecreto()`, `totp_verificado=0`; `ficha_id` null.
- **Alta aprendiz:** `password` y `totp_secret` null; `ficha_id` obligatorio (ficha activa).
- **Unicidad:** correo y documento únicos en toda la tabla (incl. inactivos), alineado con importación de aprendices.
- **DELETE:** si `activo=1` → soft (`activo=0`); si ya `activo=0` → borrado físico; FK `RESTRICT` → 422 con mensaje amigable. El admin **no** puede desactivarse ni borrarse a sí mismo (422).
- **Reactivar:** `POST /api/usuarios/{id}/reactivar` pone `activo=1` si estaba inactivo; si ya estaba activo → 422. UI: botón Reactivar con SweetAlert2 (mismo patrón que reactivar ficha).
- **Modelo `Usuario`:** `creado_en` y `actualizado_en` en `$fillable` para actualizar marcas de tiempo desde el controlador.
- **Front:** `/usuarios` solo admin (`router.replace` si no); `DataTable` + `components/usuarios/UsuarioModal.tsx`; debounce búsqueda ~300 ms; SweetAlert2 confirmar desactivar y doble confirmación para eliminar permanente; política de contraseña compartida en `lib/politicaContrasena.ts` (también usada desde `/reset`).

## Decisiones tomadas en M7

- **API:** `AsistenciaController` + `AsistenciaService`; `POST /api/asistencia/iniciar-sesion` (body: `ficha_id`, `fecha` Y-m-d, `horario_id` opcional); `POST /api/asistencia/sesiones/{sesion}/guardar` (body: `registros[]` con `aprendiz_id`, `tipo`, `horas_inasistencia` si parcial); `PUT /api/asistencia/registros/{registro}` para corrección con fila en `registros_asistencia_backup` (sesión **cerrada**).
- **Día hábil:** Carbon en `America/Bogota`, ISO `N` 1–6 → slug `lunes`…`sabado`; domingo y filas en `dias_festivos` (`activo=1`) → 422 con mensaje (festivo usa `descripcion`).
- **Horario:** se eligen filas `horarios` donde `instructor_id` = usuario, `ficha_id`, `dia_semana` del día y `activo=1`; si hay **varios** y no se envía `horario_id` → 422 JSON `codigo: multiples_horarios` + `horarios_candidatos[]` (`id`, `etiqueta`).
- **Sesión:** `UNIQUE(horario_id, fecha)`; reutiliza sesión `abierta`; rechaza si ya `cerrada`. Sin aprendices activos en la ficha → 422 (no crea sesión).
- **Guardado:** transacción + `lockForUpdate` en la sesión; parcial: horas entre `1` y `horas_programadas - 1`; todos los aprendices obligatorios o 422 con nombre del faltante.
- **Policies:** `SesionPolicy::guardarAsistencia`, `RegistroAsistenciaPolicy::update`; `iniciar` autoriza `view` de la ficha (`FichaPolicy`).
- **Front:** `/asistencia/tomar` — selector de ficha (`GET /api/fichas`), fecha hoy Bogotá (`Intl` `America/Bogota`), `components/asistencia/FilaAprendiz.tsx`, `ProgressBar.tsx`, SweetAlert2, botón guardar deshabilitado solo mientras envía; éxito → `/asistencia/historial`.

## Decisiones tomadas en M8

- **API historial:** `HistorialAsistenciaRequest` valida query `desde`/`hasta` (Y-m-d) y `tipo[]` (multiselect); `AsistenciaService::historialMatriz` devuelve `aprendices`, `sesiones` (orden fecha + id, con instructor nombre completo/corto) y `registros` planos; filtro por tipos = solo columnas de sesiones que tengan al menos un registro activo de esos tipos.
- **Permisos:** `authorize('view', $ficha)` en `historial`; edición solo con `PUT .../registros/{id}` existente (`RegistroAsistenciaPolicy` + sesión `cerrada` + `instructor_id` = usuario).
- **Front:** `/asistencia/historial` — roles admin, coordinador, instructor, gestor; aprendiz redirige a `/mi-historial`; selector de ficha vía `GET /api/fichas`; navegación por mes (Bogotá) + rango manual + “Restablecer al mes visible”; `components/asistencia/MatrizAsistencia.tsx` (scroll horizontal, celdas por tipo SENA, modal edición + SweetAlert2 confirmación); servicios `obtenerHistorialAsistencia` / `actualizarRegistroAsistencia`.
- **Sidebar admin:** ítem “Historial de asistencia” alineado al PRD tabla de rutas.

## Estado actual

**Último módulo completado:** **Módulo 8 — Historial / matriz de asistencia** ✓ (alineado con PRD v1.0 — abril 2026)

**Próximo módulo:** **Módulo 9 — Vista aprendiz (`mi-historial`)**.

### Servidores de desarrollo
- Frontend: `cd quorum-frontend && npm run dev` → http://localhost:3000
- Backend: `cd quorum-backend && php artisan serve` → http://localhost:8000
- Verificación API: GET http://localhost:8000/api/ping → `{"status":"ok"}`

### Usuarios de prueba (PRD §5 y §22 — contraseña: `Admin123!`)
| Rol | Correo | Contraseña | Documento |
|-----|--------|------------|-----------|
| admin | andresfelipeorozcopiedrahita@gmail.com | Admin123! | 12345678 |
| coordinador | sbecerra@sena.edu.co | Admin123! | 87654321 |
| instructor | documentosorozco25@gmail.com | Admin123! | 11111111 |
| gestor_grupo | mgomez@sena.edu.co | Admin123! | 22222222 |
| aprendiz | andres@aprendiz.sena.edu.co | — (usa cédula: 33333333) | 33333333 |

### MER — alineación PRD v1.0 (batch 2, 3, 4 de migraciones)
Las migraciones del batch 1 (M0) construyeron la estructura base. Las del batch 2–4 la alinearon con el PRD:

| Tabla | Cambios aplicados |
|-------|-------------------|
| `horarios` | FK ficha+jornada → CASCADE; UNIQUE(ficha, jornada, dia) |
| `ficha_instructor` | Columna `activo`; FK usuario → CASCADE; índice gestor |
| `sesiones` | Añadidos `ficha_id`, `instructor_id`, `horas_programadas`; UNIQUE(horario, fecha); eliminado `tomado_por` |
| `registros_asistencia` | Renombrado `usuario_id` → `aprendiz_id`; añadido `activo`; CHECK constraint parcial |
| `registros_asistencia_backup` | Reconstruida: campos antes/después (`tipo_anterior`, `tipo_nuevo`, `razon`, `modificado_por`) |
| `intentos_login` | Eliminado `usuario_id` (no en PRD); ip NOT NULL; índice compuesto (correo, fecha) |
| `tokens_reset` | token ampliado a VARCHAR(255) |
| `importaciones_aprendices` | Renombrado `usuario_id` → `importado_por`; FK reales creadas |
| `historial_actividad` | `usuario_id` → nullable sin FK (permite eventos sin usuario) |
| `configuracion` | `valor` nullable; `descripcion` → TEXT; eliminado `creado_en` |
| `ficha_instructor` (trigger) | `trg_un_gestor_por_ficha` + `trg_un_gestor_por_ficha_update` creados |

**Total migraciones ejecutadas:** 29 (18 batch 1 + 11 alter batch 2–4)

---

*Memoria de proyecto para chats en Cursor. Actualizar checkboxes y sección "Estado actual" al cerrar cada módulo.*
