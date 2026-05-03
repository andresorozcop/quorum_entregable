# DECISIONES — QUORUM (memoria larga, barata)

Este archivo guarda **decisiones técnicas y de producto** en entradas cortas para que el asistente retome el “por qué” sin leer historial largo.

Reglas:
- 1 decisión = 1 entrada.
- Máximo 10–20 líneas por entrada.
- Enfocar en **por qué / trade-off / impacto** (no en “paso a paso”).
- Si una decisión queda obsoleta, marcarla como **[DEPRECADA]** y enlazar la nueva.

Plantilla rápida para nuevas entradas:
```
## [YYYY-MM-DD] Título corto
**Estado**: aceptada | en revisión | deprecada
**Contexto**: 1–3 líneas
**Decisión**: 1–3 bullets
**Consecuencias**: 1–3 bullets
```

---

## [2026-05-02] Contexto vivo corto en `contexto.md`
**Estado**: aceptada
**Contexto**: El proyecto cambió a una fase de ajustes generales; el contexto largo consume tokens y se vuelve difícil de mantener.
**Decisión**:
- `contexto.md` se mantiene como “resumen vivo” de <100–150 líneas.
- El detalle histórico/decisiones se mueve a `DECISIONS.md` (este archivo).
**Consecuencias**:
- Los chats nuevos retoman rápido leyendo `@contexto.md`.
- El “por qué” de decisiones importantes queda accesible sin inflar el resumen.

## [2026-05-02] SPA stateful con Laravel Sanctum (cookies)
**Estado**: aceptada
**Contexto**: Se necesita auth segura para SPA (Next.js) sin exponer tokens en localStorage.
**Decisión**:
- Autenticación SPA con **Sanctum stateful cookies** (no Bearer tokens en el cliente).
**Consecuencias**:
- Configuración correcta de CORS y `SANCTUM_STATEFUL_DOMAINS` es crítica.
- Los flujos de login deben contemplar CSRF/cookies.

## [2026-05-02] Autorización obligatoria en servidor (Policies/Gates + middleware por rol)
**Estado**: aceptada
**Contexto**: Evitar que el frontend sea la única barrera (riesgo IDOR/permisos).
**Decisión**:
- Todo endpoint sensible valida permisos con Policies/Gates y/o middleware de rol.
**Consecuencias**:
- El frontend puede ocultar UI, pero la fuente de verdad es el backend.
- Cambios en permisos deben incluir cambios en políticas y pruebas de endpoints.

## [2026-05-02] Soft delete lógico con `activo=0` en datos de negocio
**Estado**: aceptada
**Contexto**: Se requiere trazabilidad/auditoría y evitar pérdida accidental de datos.
**Decisión**:
- En entidades de negocio, desactivar con `activo=0` en vez de borrar físicamente.
**Consecuencias**:
- Los listados deben filtrar por `activo` según el caso.
- Operaciones críticas deben considerar datos inactivos (unicidad, reactivación).

## [2026-05-02] Auditoría al corregir asistencia (backup antes de modificar)
**Estado**: aceptada
**Contexto**: Se requieren trazas de cambios de asistencia.
**Decisión**:
- Antes de actualizar un registro de asistencia, guardar el “antes” en una tabla/registro de backup.
**Consecuencias**:
- Correcciones quedan auditables.
- La lógica de actualización es más estricta y debe usar transacciones cuando aplique.

## [2026-05-02] Login único (correo+contraseña) para todos los roles
**Estado**: aceptada
**Contexto**: Había dos flujos: staff con contraseña y aprendices con correo+documento. Se necesitaba unificar UX y habilitar cambio/reset de contraseña para aprendices.
**Decisión**:
- Un solo login para todos por `correo + contraseña` (Sanctum stateful).
- Aprendiz: contraseña inicial = `documento` (hash), sin 2FA; staff mantiene 2FA TOTP.
- El endpoint `/api/auth/login-aprendiz` queda **[DEPRECADO]** (410) para forzar migración al login único.
**Consecuencias**:
- Se requiere migración para aprendices existentes con `password` vacío (setear hash de `documento`).
- Recuperación por correo y cambio de contraseña aplican también a aprendices.

## [2026-05-02] Excel CPIC: cero horas inasistidas como `0`, no celda vacía
**Estado**: aceptada
**Contexto**: En el reporte Excel (plantilla CPIC) las celdas de horas de inasistencia por día y el total en columna `DD` quedaban vacías cuando el valor era 0 (asistencia completa o sin inasistencia acumulada), lo que confundía la lectura del formato.
**Decisión**:
- `ReporteExcelService` escribe siempre el entero en celdas diarias (`setValue($horas)`) y `max(0, $total)` en `DD`.
**Consecuencias**:
- Asistencia completa se ve explícitamente como `0` en el Excel.
- Un día hábil sin sesión cerrada sigue mostrando `0` en memoria y ahora también en la celda; si hiciera falta distinguir “sin dato” de “cero inasistencia”, habría que introducir un sentinela (p. ej. `null`) en `por_dia` y tratarlo al volcar.
