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

Autenticación: `POST /api/auth/login`, `login-aprendiz`, `logout`, 2FA, `recuperar`, `reset`. CRUD usuarios, fichas, asistencia (`getSesion`, `guardar`, `actualizar`, `historial`), `mi-historial`, `reportes/excel/{fichaId}`, `importaciones/aprendices`, centros/programas/días festivos — detalle en PRD sección 12.

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
- [ ] **Módulo 1** — Autenticación (login + reCAPTCHA + bloqueo intentos; login aprendiz correo+cédula; Sanctum; 2FA configurar/verificar; páginas login y 2FA)
- [ ] **Módulo 2** — Recuperación de contraseña (token, correo, `/recuperar`, `/reset`, política de contraseña en UI)
- [ ] **Módulo 3** — Layout global (Sidebar por rol, Headbar, Avatar, hamburguesa, accesibilidad, protección Sanctum)
- [ ] **Módulo 4** — Dashboard por rol (`/api/dashboard`, cards, datos reales BD)
- [ ] **Módulo 5** — Gestión de fichas Admin (CRUD, jornadas, horarios, instructores/gestor único, detalle, import Excel aprendices)
- [ ] **Módulo 6** — Gestión de usuarios Admin (CRUD, filtros, soft delete, admin no auto-borra)
- [ ] **Módulo 7** — Tomar asistencia (Instructor/Gestor: sesión, validaciones festivo/día, lista completa, parcial con horas, barra progreso, marcar todos presentes)
- [ ] **Módulo 8** — Historial / matriz de asistencia (filtros, edición solo instructor dueño del día, scroll horizontal)
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

## Problemas resueltos

- Error `Tablespace already exists` al correr `migrate:fresh` — solucionado eliminando y recreando la BD desde PHP.
- Error de referencia circular `usuarios ↔ fichas` — solucionado con migración separada `alter_usuarios_add_ficha_fk`.

## Estado actual

**Último módulo completado:** **Módulo 0 — Setup inicial** ✓ (alineado con PRD v1.0 — abril 2026)

**Próximo módulo:** **Módulo 1 — Autenticación**.

### Servidores de desarrollo
- Frontend: `cd quorum-frontend && npm run dev` → http://localhost:3000
- Backend: `cd quorum-backend && php artisan serve` → http://localhost:8000
- Verificación API: GET http://localhost:8000/api/ping → `{"status":"ok"}`

### Usuarios de prueba (PRD §5 y §22 — contraseña: `Admin123!`)
| Rol | Correo | Contraseña | Documento |
|-----|--------|------------|-----------|
| admin | gestradac@sena.edu.co | Admin123! | 12345678 |
| coordinador | sbecerra@sena.edu.co | Admin123! | 87654321 |
| instructor | clopez@sena.edu.co | Admin123! | 11111111 |
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
