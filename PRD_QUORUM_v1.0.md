# PRD — QUORUM: Sistema de Control de Asistencia SENA
## Documento de Requisitos del Producto — Para construcción con Cursor AI
### Versión 1.0 | Fecha: Abril 2026 | Autor: José Germán Estrada Clavijo

---

> **INSTRUCCIÓN PARA CURSOR**
> Pega este documento completo al iniciar cada sesión. Es el contrato técnico del proyecto. Sigue el orden de módulos sin saltarte ninguno. Prueba cada módulo antes de pasar al siguiente.

---

# ÍNDICE

**PARTE A — DEFINICIÓN DEL PROYECTO**
1. [Descripción General del Sistema](#1-descripción-general-del-sistema)
2. [Roles de Usuario](#2-roles-de-usuario)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Paleta de Colores y Diseño](#4-paleta-de-colores-y-diseño)
5. [Modelo de Datos — MER Completo](#5-modelo-de-datos--mer-completo)
6. [Funcionalidades Requeridas](#6-funcionalidades-requeridas)
7. [Flujos Principales por Caso de Uso](#7-flujos-principales-por-caso-de-uso)
8. [Reglas de Negocio](#8-reglas-de-negocio)

**PARTE B — ARQUITECTURA Y CONVENCIONES**
9. [Arquitectura y Estructura de Archivos](#9-arquitectura-y-estructura-de-archivos)
10. [Convenciones de Nombres](#10-convenciones-de-nombres)
11. [Layout Global](#11-layout-global)
12. [Rutas y Páginas](#12-rutas-y-páginas)
13. [Componentes Reutilizables](#13-componentes-reutilizables)

**PARTE C — SEGURIDAD**
14. [Seguridad — Capa Completa](#14-seguridad--capa-completa)

**PARTE D — CALIDAD Y ROBUSTEZ**
15. [Plan de Pruebas Universal](#15-plan-de-pruebas-universal)
16. [Reglas de Construcción Universales](#16-reglas-de-construcción-universales)
17. [Reglas Adicionales Anti-Bug](#17-reglas-adicionales-anti-bug)

**PARTE E — PROCESO CON CURSOR**
18. [Cómo Trabajar con Cursor — Metodología](#18-cómo-trabajar-con-cursor--metodología)
19. [Módulos para Cursor en Orden Lógico](#19-módulos-para-cursor-en-orden-lógico)
20. [Cómo Probar Cada Módulo](#20-cómo-probar-cada-módulo)

**PARTE F — ENTREGABLES**
21. [Exportaciones y Reportes](#21-exportaciones-y-reportes)
22. [README.md Requerido](#22-readmemd-requerido)
23. [Lo que NO está en Scope](#23-lo-que-no-está-en-scope)
24. [Criterios de Evaluación](#24-criterios-de-evaluación)

---

# PARTE A — DEFINICIÓN DEL PROYECTO

---

## 1. DESCRIPCIÓN GENERAL DEL SISTEMA

```
Nombre del sistema:       QUORUM
Nombre corto / sigla:     QUORUM
Cliente / Institución:    SENA — Centro de Procesos Industriales y Construcción (CPIC)
Responsable principal:    José Germán Estrada Clavijo — Instructor (gestradac@sena.edu.co)
Coordinador académico:    Santiago Becerra Henao (sbecerra@sena.edu.co)
Entorno de ejecución:     XAMPP local (localhost)
URL local de desarrollo:  http://localhost/quorum  (frontend en puerto 3000, API en 8000)
Idioma de la interfaz:    Español (Colombia)
Zona horaria:             America/Bogota (UTC-5)
Formato de fechas:        DD/MM/AAAA y HH:MM
```

**¿Qué hace esta aplicación?**
QUORUM digitaliza el control de asistencia de aprendices en el SENA. Reemplaza las hojas de papel y los archivos Excel individuales por una base de datos centralizada donde los instructores registran la asistencia de sus fichas de caracterización, los aprendices consultan su historial personal, y el coordinador académico audita la situación de todas las fichas del centro. Al finalizar el periodo, el sistema genera automáticamente el formato oficial CPIC en Excel con todos los datos inyectados sobre la plantilla institucional.

**¿Por qué existe?**
Actualmente, cada instructor lleva su control de asistencia en hojas físicas o archivos Excel independientes, lo que genera re-trabajo al momento de generar el reporte oficial, pérdida de información, inconsistencias y dificultad para el coordinador en hacer seguimiento oportuno. QUORUM centraliza todo en una sola plataforma web accesible desde cualquier dispositivo dentro del ambiente de formación.

**Terminología institucional obligatoria (usar SIEMPRE estas palabras en la interfaz):**
- Los estudiantes se llaman **"Aprendices"** (nunca "estudiantes" ni "alumnos")
- Los profesores se llaman **"Instructores"** (nunca "profesores" ni "docentes")
- Las clases se llaman **"Formación"** (nunca "clases" ni "cursos")
- Los salones se llaman **"Ambientes de Formación"** (nunca "salones" ni "aulas")
- El número de grupo se llama **"Ficha de Caracterización"** o **"Ficha"**

**Usuarios principales:**
- Administrador del sistema (crea y gestiona todo)
- Coordinador Académico (audita sin modificar)
- Instructores (toman asistencia)
- Gestores de Grupo (igual que Instructor + rol especial por ficha)
- Aprendices (solo consultan su propio historial)

---

## 2. ROLES DE USUARIO

> Definir TODOS los roles antes de escribir una sola línea de código. Cada ruta y cada acción validan el rol en el servidor (Laravel middleware).

| Rol | Nombre / Descripción | Permisos generales |
|-----|---------------------|-------------------|
| `admin` | Administrador del sistema | Acceso total: gestión de usuarios, fichas, programas, centros, configuración, reportes |
| `coordinador` | Coordinador Académico | Solo lectura: ver y filtrar asistencias de todas las fichas + estadísticas |
| `instructor` | Instructor de Formación | Tomar y modificar asistencia de sus días asignados en sus fichas + ver compañeros + descargar Excel |
| `gestor_grupo` | Gestor de Grupo | Mismos permisos que instructor. Solo uno por ficha |
| `aprendiz` | Aprendiz | Solo consulta su propio historial de asistencia. Login con correo + cédula, sin contraseña |

**Restricciones de rol obligatorias (aplican siempre):**
- El rol `admin` **nunca puede** desactivar ni eliminar su propia cuenta.
- Un usuario inactivo (`activo = 0`) no puede iniciar sesión — mostrar mensaje: *"Tu cuenta está desactivada. Comunícate con el administrador."*
- Un usuario que intente acceder a una URL sin permiso → página 403 + redirigir. Nunca mostrar el contenido.
- Toda restricción de rol se verifica **en el servidor (Laravel Policy/Gate)**, nunca solo en el frontend.
- Los `aprendices` **NO tienen contraseña**. Ingresan con correo + cédula (documento).
- Un `aprendiz` **jamás** puede ver la información de otro aprendiz — aislamiento total de datos.
- Un `instructor` solo puede tomar o modificar asistencia en días que le han sido asignados en la jornada de una ficha.
- Un `instructor` puede ver las asistencias registradas por otros instructores de la misma ficha, pero **NO** puede modificarlas.
- Solo puede haber **UN** `gestor_grupo` activo por ficha. El sistema bloquea asignar un segundo.

**Matriz de permisos:**

| Funcionalidad | admin | coordinador | instructor | gestor_grupo | aprendiz |
|---------------|:-----:|:-----------:|:----------:|:------------:|:--------:|
| Gestión de usuarios (CRUD) | ✓ | ✗ | ✗ | ✗ | ✗ |
| Gestión de fichas (CRUD) | ✓ | ✗ | ✗ | ✗ | ✗ |
| Gestión de programas y centros | ✓ | ✗ | ✗ | ✗ | ✗ |
| Asignar instructores a fichas | ✓ | ✗ | ✗ | ✗ | ✗ |
| Importar aprendices desde Excel | ✓ | ✗ | ✗ | ✗ | ✗ |
| Ver dashboard general | ✓ | ✓ | ✓ | ✓ | ✗ |
| Tomar asistencia (días propios) | ✗ | ✗ | ✓ | ✓ | ✗ |
| Modificar asistencia propia pasada | ✗ | ✗ | ✓ | ✓ | ✗ |
| Ver asistencias de compañeros (misma ficha) | ✗ | ✗ | ✓ | ✓ | ✗ |
| Ver asistencias de todas las fichas | ✓ | ✓ | ✗ | ✗ | ✗ |
| Descargar reporte Excel CPIC | ✓ | ✓ | ✓ | ✓ | ✗ |
| Ver su propio historial de asistencia | ✗ | ✗ | ✗ | ✗ | ✓ |
| Estadísticas básicas | ✓ | ✓ | ✓ | ✓ | ✗ |
| Configuración del sistema | ✓ | ✗ | ✗ | ✗ | ✗ |
| Ver perfil propio (solo lectura) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Recuperar contraseña por correo | ✓ | ✓ | ✓ | ✓ | ✗ |

---

## 3. STACK TECNOLÓGICO

| Capa | Tecnología elegida | Versión / Notas |
|------|--------------------|-----------------|
| Frontend | Next.js con App Router | Next.js 14+, TypeScript estricto |
| Estilos | Tailwind CSS | Via `npm install tailwindcss` |
| Iconos | Lucide React | `import { Icon } from 'lucide-react'` — **NUNCA emojis** |
| Alertas | SweetAlert2 | `import Swal from 'sweetalert2'` — **NUNCA** `alert()` nativo |
| Backend | Laravel | Laravel 11+, PHP 8.2+ |
| Base de datos | MySQL 8.0 | Via XAMPP |
| Servidor local | XAMPP 8.x | Apache + MySQL integrado |
| API | REST JSON | Laravel → Next.js via fetch/axios |
| Autenticación API | Laravel Sanctum | Tokens de sesión stateful para SPA |
| Exportar Excel | PhpSpreadsheet | `composer require phpoffice/phpspreadsheet` |
| Envío de correo | PHPMailer / Laravel Mail | SMTP Gmail configurado en `.env` |
| 2FA TOTP | PHPGangsta/GoogleAuthenticator | Copiar clase al proyecto Laravel |
| Importar Excel (aprendices) | PhpSpreadsheet (lectura) | Mismo paquete de exportación |
| Control de versiones | Git | Commit obligatorio por módulo funcional |
| Arquitectura frontend | Componentes React + Server Components | Carpetas: `app/`, `components/`, `hooks/`, `services/`, `types/` |
| Arquitectura backend | MVC + Repository Pattern | Carpetas estándar de Laravel |

**Reglas de tecnología inamovibles:**
- SweetAlert2 para TODAS las alertas visibles al usuario — nunca `alert()`, `confirm()`, `prompt()` nativos.
- Lucide React para TODA la iconografía — cero emojis en código o interfaz.
- TypeScript estricto en el frontend: `"strict": true` en `tsconfig.json`.
- Prepared statements (Eloquent ORM o Query Builder) en el 100% de consultas.
- Tailwind CSS para todos los estilos — sin CSS inline arbitrario.
- Comentarios del código en español, nivel estudiante básico.

**Estilo de comentarios en el código:**
```typescript
// Aquí verifico si el usuario tiene sesión activa antes de mostrar la página
// Si no tiene sesión, lo mando al login
```
```php
// Aquí busco el usuario por su correo en la base de datos
// Uso prepared statements para evitar inyección SQL
```

---

## 4. PALETA DE COLORES Y DISEÑO

**Colores principales (identidad SENA):**

| Nombre | Hex | Uso |
|--------|-----|-----|
| Verde SENA principal | `#3DAE2B` | Color primario, botones principales, sidebar activo, encabezados |
| Verde SENA oscuro | `#2E7D22` | Hover de botones, textos de encabezado, bordes activos |
| Verde SENA claro | `#E8F5E9` | Fondos de sección activa, badges de "Presente" |
| Blanco | `#FFFFFF` | Fondos principales de contenido |
| Gris claro | `#F5F5F5` | Fondos secundarios, filas alternas de tabla |
| Gris medio | `#9E9E9E` | Textos secundarios, placeholders |
| Gris oscuro | `#333333` | Texto principal |
| Rojo error | `#D32F2F` | Errores, "Falla" de asistencia, alertas peligro |
| Amarillo advertencia | `#F9A825` | Advertencias, "Excusa" de asistencia |
| Azul información | `#1565C0` | Información, "Parcial" de asistencia |
| Negro sidebar | `#1A1A2E` | Fondo del sidebar |

**Colores de los tipos de asistencia en la interfaz:**

| Tipo | Color de badge | Hex |
|------|---------------|-----|
| Presente | Verde | `#3DAE2B` |
| Falla | Rojo | `#D32F2F` |
| Excusa | Amarillo | `#F9A825` |
| Inasistencia Parcial | Azul | `#1565C0` |

**Colores diferenciadores de roles en la UI:**

| Rol | Color del badge | Hex |
|-----|----------------|-----|
| Admin | Morado | `#7B1FA2` |
| Coordinador | Azul oscuro | `#1565C0` |
| Instructor | Verde | `#2E7D22` |
| Gestor de Grupo | Verde SENA | `#3DAE2B` |
| Aprendiz | Gris | `#616161` |

**Principios de diseño obligatorios:**
- Limpio, funcional, institucional — sin sobre-diseño.
- **Mobile first**: diseñar primero para 375px, escalar a 768px y 1024px+.
- Las tablas de asistencia (que pueden tener muchas columnas por días del mes) deben tener scroll horizontal obligatorio en pantallas pequeñas.
- Avatar de usuario: círculo con dos iniciales del nombre (como WhatsApp/Google Meet sin foto). El color de fondo se asigna por hash del ID del usuario.
- Logo del SENA: colocar logo genérico institucional mientras se entrega el logo oficial. La celda para reemplazar debe ser claramente comentada en el código.
- El logo institucional va en el sidebar (parte superior) y en el encabezado del Excel exportado.
- Todo texto de la interfaz en español colombiano.

**Responsive breakpoints:**

| Tamaño | Breakpoint | Comportamiento esperado |
|--------|-----------|------------------------|
| Móvil | 375px | Sidebar colapsado, menú hamburguesa, tablas con scroll horizontal |
| Tablet | 768px | Sidebar colapsable con toggle |
| Desktop | 1024px+ | Sidebar siempre visible, layout completo |

---

## 5. MODELO DE DATOS — MER COMPLETO

> **Este modelo es CRÍTICO. Definir antes de escribir una sola línea de código. Un error en el modelo a mitad del proyecto es muy costoso.**

**Reglas globales de base de datos:**
- Charset: `utf8mb4` — Collation: `utf8mb4_unicode_ci` en TODAS las tablas y columnas de texto.
- Zona horaria: configurar `America/Bogota` al conectar: `SET time_zone = '-05:00'`.
- Nunca usar `DELETE` en datos de negocio — usar soft delete (`activo TINYINT(1) DEFAULT 1`).
- Toda FK debe tener índice explícito.
- Usar `DATETIME DEFAULT CURRENT_TIMESTAMP` para auditoría.
- Operaciones que toquen más de una tabla usan transacciones.
- Todas las migraciones de Laravel generan el DDL equivalente.

---

### DIAGRAMA ENTIDAD-RELACIÓN (Descripción Textual)

```
centros_formacion ──< fichas_caracterizacion >── programas_formacion
                           │
                    ──< jornadas_ficha
                           │
                    ──< horarios (ficha_id, jornada_ficha_id, dia_semana, instructor_id)
                           │
                    ──< ficha_instructor (pivot: fichas ↔ usuarios[instructor/gestor])
                           │
                    ──< sesiones (fecha real de clase + quien la tomó)
                           │
                           ├──< registros_asistencia (por aprendiz por sesión)
                           │        │
                           │        └──> registros_asistencia_backup (tabla espejo)
                           │
usuarios ──────────────────┘
   │ (rol='aprendiz')
   └── ficha_id ──> fichas_caracterizacion

usuarios ──< importaciones_aprendices
         ──< intentos_login
         ──< tokens_reset
         ──< historial_actividad
         ──< sesiones (como instructor)
         ──< registros_asistencia_backup (como modificador)

dias_festivos (tabla independiente, sin FK)
configuracion (tabla de clave-valor)
```

---

### DDL COMPLETO — TABLAS EN ORDEN DE DEPENDENCIAS

```sql
-- ============================================================
-- QUORUM — Script de Base de Datos
-- Charset: utf8mb4 | Zona: America/Bogota
-- Versión 1.0 | SENA CPIC
-- ============================================================

SET NAMES 'utf8mb4';
SET time_zone = '-05:00';

-- ============================================================
-- 1. CENTROS DE FORMACIÓN
-- ============================================================
CREATE TABLE centros_formacion (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    codigo      VARCHAR(20)  NULL,
    activo      TINYINT(1)   DEFAULT 1,
    creado_en   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. PROGRAMAS DE FORMACIÓN
-- ============================================================
CREATE TABLE programas_formacion (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(200) NOT NULL,
    codigo      VARCHAR(30)  NULL,
    activo      TINYINT(1)   DEFAULT 1,
    creado_en   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. USUARIOS (Todos los roles, incluyendo aprendices)
-- Nota: Los aprendices tienen password=NULL y usan documento como credencial
-- ============================================================
CREATE TABLE usuarios (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    nombre            VARCHAR(100)  NOT NULL,
    apellido          VARCHAR(100)  NOT NULL,
    documento         VARCHAR(20)   NOT NULL,              -- cédula, también usada como credencial del aprendiz
    correo            VARCHAR(150)  NOT NULL UNIQUE,
    password          VARCHAR(255)  NULL,                  -- NULL para aprendices (usan documento)
    rol               ENUM('admin','coordinador','instructor','gestor_grupo','aprendiz') NOT NULL,
    activo            TINYINT(1)    DEFAULT 1,
    ficha_id          INT           NULL,                  -- Solo para aprendices (un aprendiz = una ficha)
    totp_secret       VARCHAR(100)  NULL,                  -- Para 2FA TOTP
    totp_verificado   TINYINT(1)    DEFAULT 0,             -- 0=primera vez (mostrar QR), 1=ya configurado
    avatar_color      VARCHAR(7)    DEFAULT '#3DAE2B',     -- Color del círculo de iniciales
    creado_en         DATETIME      DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rol (rol),
    INDEX idx_documento (documento),
    INDEX idx_ficha (ficha_id)
    -- FK ficha_id se agrega después de crear fichas_caracterizacion
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. FICHAS DE CARACTERIZACIÓN
-- ============================================================
CREATE TABLE fichas_caracterizacion (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    numero_ficha            VARCHAR(20)   NOT NULL UNIQUE,
    estado                  ENUM('activa','suspendida') DEFAULT 'activa',
    centro_formacion_id     INT           NOT NULL,
    programa_formacion_id   INT           NOT NULL,
    fecha_inicio            DATE          NOT NULL,
    fecha_fin               DATE          NOT NULL,
    activo                  TINYINT(1)    DEFAULT 1,
    creado_en               DATETIME      DEFAULT CURRENT_TIMESTAMP,
    actualizado_en          DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (centro_formacion_id)   REFERENCES centros_formacion(id)   ON DELETE RESTRICT,
    FOREIGN KEY (programa_formacion_id) REFERENCES programas_formacion(id) ON DELETE RESTRICT,
    INDEX idx_estado (estado),
    INDEX idx_centro (centro_formacion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar FK a usuarios ahora que fichas_caracterizacion existe
ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuario_ficha
    FOREIGN KEY (ficha_id) REFERENCES fichas_caracterizacion(id) ON DELETE SET NULL;

-- ============================================================
-- 5. JORNADAS POR FICHA
-- Una ficha puede tener múltiples jornadas (día, noche, etc.)
-- El coordinador filtra por tipo de jornada
-- ============================================================
CREATE TABLE jornadas_ficha (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ficha_id    INT          NOT NULL,
    tipo        ENUM('mañana','tarde','noche','fin_de_semana') NOT NULL,
    activo      TINYINT(1)   DEFAULT 1,
    creado_en   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ficha_id) REFERENCES fichas_caracterizacion(id) ON DELETE CASCADE,
    UNIQUE KEY uq_ficha_jornada (ficha_id, tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. HORARIOS (Programa semanal de cada ficha+jornada)
-- Define qué instructor da clase qué día y a qué horas
-- Un instructor puede estar asignado varios días a la semana
-- ============================================================
CREATE TABLE horarios (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    ficha_id            INT NOT NULL,
    jornada_ficha_id    INT NOT NULL,
    dia_semana          ENUM('lunes','martes','miercoles','jueves','viernes','sabado') NOT NULL,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    horas_programadas   TINYINT UNSIGNED NOT NULL COMMENT 'Calculado: HOUR(TIMEDIFF(hora_fin, hora_inicio))',
    instructor_id       INT NOT NULL COMMENT 'Instructor asignado a este día',
    activo              TINYINT(1) DEFAULT 1,
    creado_en           DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ficha_id)         REFERENCES fichas_caracterizacion(id) ON DELETE CASCADE,
    FOREIGN KEY (jornada_ficha_id) REFERENCES jornadas_ficha(id)         ON DELETE CASCADE,
    FOREIGN KEY (instructor_id)    REFERENCES usuarios(id)                ON DELETE RESTRICT,
    UNIQUE KEY uq_ficha_jornada_dia (ficha_id, jornada_ficha_id, dia_semana),
    INDEX idx_instructor (instructor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. PIVOT: FICHA — INSTRUCTOR / GESTOR DE GRUPO
-- Registra qué instructores están asignados a qué fichas
-- y cuál es el gestor de grupo (solo uno por ficha)
-- ============================================================
CREATE TABLE ficha_instructor (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    ficha_id    INT        NOT NULL,
    usuario_id  INT        NOT NULL,
    es_gestor   TINYINT(1) DEFAULT 0 COMMENT '1=Gestor de Grupo de esta ficha',
    activo      TINYINT(1) DEFAULT 1,
    creado_en   DATETIME   DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ficha_id)   REFERENCES fichas_caracterizacion(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)               ON DELETE CASCADE,
    UNIQUE KEY uq_ficha_usuario (ficha_id, usuario_id),
    INDEX idx_gestor (ficha_id, es_gestor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. SESIONES (Cada clase real que se realizó)
-- Se crea una sesión cuando un instructor toma asistencia en un día
-- La sesión referencia el horario (ficha+jornada+día) y tiene una fecha concreta
-- ============================================================
CREATE TABLE sesiones (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    ficha_id          INT  NOT NULL,
    horario_id        INT  NOT NULL,
    fecha             DATE NOT NULL COMMENT 'Fecha real de la clase (no día festivo, no domingo)',
    instructor_id     INT  NOT NULL COMMENT 'Instructor que tomó la asistencia',
    horas_programadas TINYINT UNSIGNED NOT NULL,
    estado            ENUM('abierta','cerrada') DEFAULT 'abierta' COMMENT 'Cerrada cuando se guarda la asistencia',
    creado_en         DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ficha_id)      REFERENCES fichas_caracterizacion(id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id)    REFERENCES horarios(id)               ON DELETE RESTRICT,
    FOREIGN KEY (instructor_id) REFERENCES usuarios(id)               ON DELETE RESTRICT,
    UNIQUE KEY uq_sesion_fecha_horario (horario_id, fecha) COMMENT 'No puede haber dos sesiones del mismo horario el mismo día',
    INDEX idx_ficha_fecha (ficha_id, fecha),
    INDEX idx_instructor_fecha (instructor_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. REGISTROS DE ASISTENCIA (Corazón del sistema)
-- Un registro por cada aprendiz por cada sesión
-- Tipos: presente, falla, excusa, parcial
-- Símbolo en Excel: presente=vacío, falla=X, excusa=E, parcial=N° horas inasistidas
-- REGLA: horas_inasistencia SOLO aplica cuando tipo='parcial'
-- ============================================================
CREATE TABLE registros_asistencia (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id           INT      NOT NULL,
    aprendiz_id         INT      NOT NULL COMMENT 'usuarios.id donde rol=aprendiz',
    tipo                ENUM('presente','falla','excusa','parcial') NOT NULL,
    horas_inasistencia  TINYINT  NULL COMMENT 'Solo si tipo=parcial: horas que NO asistió (1 hasta horas_programadas-1)',
    activo              TINYINT(1) DEFAULT 1,
    creado_en           DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sesion_id)   REFERENCES sesiones(id) ON DELETE CASCADE,
    FOREIGN KEY (aprendiz_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    UNIQUE KEY uq_sesion_aprendiz (sesion_id, aprendiz_id) COMMENT 'Un aprendiz, un registro por sesión',
    INDEX idx_aprendiz (aprendiz_id),
    INDEX idx_sesion (sesion_id),
    CONSTRAINT chk_parcial CHECK (
        (tipo = 'parcial' AND horas_inasistencia IS NOT NULL AND horas_inasistencia >= 1)
        OR (tipo != 'parcial' AND horas_inasistencia IS NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. REGISTROS DE ASISTENCIA — TABLA ESPEJO / BACKUP
-- Guarda un historial de CADA modificación hecha a un registro
-- Se inserta un registro aquí cada vez que se modifica registros_asistencia
-- Permite auditoría completa y recuperación de datos
-- ============================================================
CREATE TABLE registros_asistencia_backup (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    registro_asistencia_id  INT      NOT NULL COMMENT 'FK al registro original',
    sesion_id               INT      NOT NULL,
    aprendiz_id             INT      NOT NULL,
    tipo_anterior           ENUM('presente','falla','excusa','parcial') NULL,
    horas_inasistencia_ant  TINYINT  NULL,
    tipo_nuevo              ENUM('presente','falla','excusa','parcial') NOT NULL,
    horas_inasistencia_new  TINYINT  NULL,
    modificado_por          INT      NOT NULL COMMENT 'usuarios.id del instructor que modificó',
    razon                   VARCHAR(255) NULL COMMENT 'Razón opcional del cambio',
    creado_en               DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_registro (registro_asistencia_id),
    INDEX idx_aprendiz_backup (aprendiz_id),
    INDEX idx_modificado (modificado_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. DÍAS FESTIVOS
-- El sistema bloquea tomar asistencia en días festivos y domingos
-- ============================================================
CREATE TABLE dias_festivos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    fecha       DATE         NOT NULL UNIQUE,
    descripcion VARCHAR(150) NOT NULL,
    activo      TINYINT(1)   DEFAULT 1,
    creado_en   DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. INTENTOS DE LOGIN (Para bloqueo por fuerza bruta)
-- ============================================================
CREATE TABLE intentos_login (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    correo      VARCHAR(150) NOT NULL,
    ip          VARCHAR(45)  NOT NULL,
    exitoso     TINYINT(1)   DEFAULT 0,
    creado_en   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo_fecha (correo, creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. TOKENS DE RECUPERACIÓN DE CONTRASEÑA
-- ============================================================
CREATE TABLE tokens_reset (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT          NOT NULL,
    token       VARCHAR(255) NOT NULL UNIQUE,
    usado       TINYINT(1)   DEFAULT 0,
    expira_en   DATETIME     NOT NULL,
    creado_en   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. IMPORTACIONES DE APRENDICES (Log de cargas masivas)
-- Registra cada vez que el admin importa aprendices desde Excel
-- ============================================================
CREATE TABLE importaciones_aprendices (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ficha_id        INT          NOT NULL,
    nombre_archivo  VARCHAR(255) NOT NULL,
    total_registros INT          DEFAULT 0,
    exitosos        INT          DEFAULT 0,
    fallidos        INT          DEFAULT 0,
    importado_por   INT          NOT NULL COMMENT 'usuarios.id del admin que importó',
    creado_en       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ficha_id)      REFERENCES fichas_caracterizacion(id) ON DELETE CASCADE,
    FOREIGN KEY (importado_por) REFERENCES usuarios(id)               ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. HISTORIAL DE ACTIVIDAD (Auditoría general del sistema)
-- ============================================================
CREATE TABLE historial_actividad (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT          NULL,
    accion      VARCHAR(100) NOT NULL COMMENT 'Ej: LOGIN, LOGOUT, CREATE_USER, TAKE_ATTENDANCE',
    descripcion TEXT         NULL,
    ip          VARCHAR(45)  NULL,
    creado_en   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. CONFIGURACIÓN DEL SISTEMA (Clave-Valor)
-- ============================================================
CREATE TABLE configuracion (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    clave           VARCHAR(100) NOT NULL UNIQUE,
    valor           TEXT         NULL,
    descripcion     TEXT         NULL,
    actualizado_en  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS INICIALES DE CONFIGURACIÓN
-- ============================================================
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('nombre_sistema',      'QUORUM',                         'Nombre del sistema'),
('nombre_institucion',  'SENA - Centro CPIC',             'Nombre del centro de formación'),
('timeout_sesion',      '30',                             'Minutos de inactividad antes de cerrar sesión'),
('max_intentos_login',  '5',                              'Intentos fallidos antes de bloqueo temporal'),
('minutos_bloqueo',     '15',                             'Minutos de bloqueo tras intentos fallidos'),
('version',             '1.0',                            'Versión del sistema');

-- ============================================================
-- DATOS DE PRUEBA — SEEDERS (Para desarrollo y testing)
-- ============================================================

-- Centro de formación
INSERT INTO centros_formacion (nombre, codigo) VALUES
('Centro de Procesos Industriales y Construcción', 'CPIC');

-- Programas de formación
INSERT INTO programas_formacion (nombre, codigo) VALUES
('Análisis y Desarrollo de Software', 'ADSO'),
('Técnico en Sistemas', 'TIS');

-- Usuarios (contraseñas hasheadas con bcrypt — Contraseña: "Admin123!")
INSERT INTO usuarios (nombre, apellido, documento, correo, password, rol) VALUES
('José Germán', 'Estrada Clavijo', '12345678', 'gestradac@sena.edu.co',
 '$2y$12$PLACEHOLDER_HASH_ADMIN', 'admin'),
('Santiago', 'Becerra Henao', '87654321', 'sbecerra@sena.edu.co',
 '$2y$12$PLACEHOLDER_HASH_COORD', 'coordinador'),
('Carlos', 'López Martínez', '11111111', 'clopez@sena.edu.co',
 '$2y$12$PLACEHOLDER_HASH_INST', 'instructor'),
('María', 'Gómez Torres', '22222222', 'mgomez@sena.edu.co',
 '$2y$12$PLACEHOLDER_HASH_INST2', 'gestor_grupo'),
('Andrés Felipe', 'Orozco Piedrahita', '33333333', 'andres@aprendiz.sena.edu.co',
 NULL, 'aprendiz');

-- Días festivos Colombia 2026 (ejemplo)
INSERT INTO dias_festivos (fecha, descripcion) VALUES
('2026-01-01', 'Año Nuevo'),
('2026-01-12', 'Día de los Reyes Magos'),
('2026-03-23', 'Día de San José'),
('2026-04-02', 'Jueves Santo'),
('2026-04-03', 'Viernes Santo'),
('2026-05-01', 'Día del Trabajo'),
('2026-05-14', 'Ascensión del Señor'),
('2026-06-04', 'Corpus Christi'),
('2026-06-11', 'Sagrado Corazón'),
('2026-06-29', 'San Pedro y San Pablo'),
('2026-07-20', 'Día de la Independencia'),
('2026-08-07', 'Batalla de Boyacá'),
('2026-08-17', 'Asunción de la Virgen'),
('2026-10-12', 'Día de la Raza'),
('2026-11-02', 'Todos los Santos'),
('2026-11-16', 'Independencia de Cartagena'),
('2026-12-08', 'Inmaculada Concepción'),
('2026-12-25', 'Navidad');
```

---

### RESUMEN DE RELACIONES DEL MER

| Relación | Tipo | Descripción |
|----------|------|-------------|
| `centros_formacion` → `fichas_caracterizacion` | 1:N | Un centro tiene muchas fichas |
| `programas_formacion` → `fichas_caracterizacion` | 1:N | Un programa tiene muchas fichas |
| `fichas_caracterizacion` → `jornadas_ficha` | 1:N | Una ficha tiene múltiples jornadas (día/noche) |
| `fichas_caracterizacion` → `horarios` | 1:N | Una ficha tiene horario por día de semana |
| `jornadas_ficha` → `horarios` | 1:N | Una jornada tiene múltiples días de horario |
| `usuarios` → `horarios` | 1:N | Un instructor puede estar en múltiples horarios |
| `fichas_caracterizacion` ↔ `usuarios` | N:M via `ficha_instructor` | Muchos instructores por ficha; un instructor en muchas fichas |
| `fichas_caracterizacion` → `usuarios` (aprendiz) | 1:N via `usuarios.ficha_id` | Una ficha tiene muchos aprendices |
| `horarios` → `sesiones` | 1:N | Un horario genera múltiples sesiones (una por fecha real) |
| `fichas_caracterizacion` → `sesiones` | 1:N | Una ficha tiene muchas sesiones |
| `sesiones` → `registros_asistencia` | 1:N | Una sesión tiene un registro por cada aprendiz |
| `usuarios` (aprendiz) → `registros_asistencia` | 1:N | Un aprendiz tiene muchos registros |
| `registros_asistencia` → `registros_asistencia_backup` | 1:N | Tabla espejo de auditoría |
| `usuarios` → `tokens_reset` | 1:N | Un usuario puede tener varios tokens (solo el último válido) |
| `fichas_caracterizacion` → `importaciones_aprendices` | 1:N | Historial de importaciones |

---

**Restricción especial — Gestor de Grupo:**
```sql
-- Trigger para garantizar solo un gestor por ficha
-- (También validar en Laravel antes de insertar)
DELIMITER $$
CREATE TRIGGER trg_un_gestor_por_ficha
BEFORE INSERT ON ficha_instructor
FOR EACH ROW
BEGIN
    IF NEW.es_gestor = 1 THEN
        IF EXISTS (
            SELECT 1 FROM ficha_instructor
            WHERE ficha_id = NEW.ficha_id AND es_gestor = 1 AND activo = 1
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Esta ficha ya tiene un Gestor de Grupo asignado.';
        END IF;
    END IF;
END$$
DELIMITER ;
```

---

## 6. FUNCIONALIDADES REQUERIDAS

### 6.1 Autenticación y Sesión

**Para Instructores, Coordinadores, Admin y Gestores (login estándar):**
- [x] Login con correo y contraseña
- [x] reCAPTCHA v2 en el formulario de login
- [x] Autenticación en dos factores (2FA) con TOTP — compatible con Google/Microsoft Authenticator
  - Primera vez (`totp_verificado = 0`): mostrar QR para configurar el autenticador
  - Siguientes veces (`totp_verificado = 1`): solo pedir código TOTP
- [x] Recuperación de contraseña por enlace enviado al correo (PHPMailer + Gmail SMTP)
  - Formulario: "¿Cuál es tu correo?" → llega enlace → formulario nueva contraseña
  - Si falla, contraseña queda sin cambiar (no queda en blanco)
- [x] Política de contraseñas: mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial
- [x] Bloqueo temporal progresivo: 5 intentos fallidos → bloqueo 15 minutos
- [x] Enlace "¿Olvidaste tu contraseña?" visible en el login
- [x] Timeout de sesión: 30 minutos de inactividad
- [x] Cierre de sesión completo

**Para Aprendices (login especial — sin contraseña):**
- [x] Ingresan con correo registrado + número de cédula (documento)
- [x] No tienen contraseña, no tienen reCAPTCHA, no tienen 2FA
- [x] Panel de acceso rápido en el login (para pruebas en desarrollo): muestra usuarios de prueba con botones de acceso rápido

### 6.2 Gestión de Usuarios (solo Admin)

- [x] Listar todos los usuarios con estado, rol (diferenciados por color) y datos principales
- [x] Filtrar por rol, buscar por nombre, apellido, documento o correo
- [x] Botón para actualizar la lista
- [x] Crear usuario nuevo con: Nombre, Apellido, Documento, Correo, Rol
- [x] Editar información del usuario (nombre, apellido, correo, rol)
- [x] Cambiar contraseña de cualquier usuario (validar política)
- [x] Activar / desactivar usuario — Admin NO puede desactivarse a sí mismo
- [x] Cuando un usuario está desactivado, aparece opción "Eliminar usuario" (soft delete)
- [x] Admin NO puede eliminarse a sí mismo
- [x] Pequeña área de configuración básica por usuario (tema, preferencias de notificación)

### 6.3 Gestión de Fichas de Caracterización (solo Admin)

- [x] Listar fichas con estado, centro, programa y fechas — con filtros y búsqueda
- [x] Crear ficha con: Número de ficha, Estado, Centro de formación, Programa de formación, Instructores asignados (de lista de activos), gestor de grupo, Fecha inicio, Fecha fin
- [x] Configurar jornadas de la ficha (tipo: mañana/tarde/noche/fin_de_semana)
- [x] Configurar horario por día (lunes a sábado): hora inicio, hora fin, instructor asignado por día
- [x] Asignar/desasignar instructores a la ficha
- [x] Designar gestor de grupo (solo 1 por ficha — alerta si ya hay uno)
- [x] Editar información de la ficha, suspenderla
- [x] Eliminar ficha completa con sus aprendices (soft delete — historial de asistencias siempre se conserva)
- [x] Ver detalle de ficha: instructores asignados, aprendices, horario

### 6.4 Gestión de Aprendices por Ficha (Admin)

- [x] Vista de gestión de aprendices por ficha
- [x] **Importación masiva** desde Excel con columnas: `cedula | nombre_completo | correo`
  - Los aprendices importados pueden acceder al sistema con correo + cédula
  - Vista dedicada para hacer la importación, muestra resultado (exitosos/fallidos)
  - Log de cada importación guardado en `importaciones_aprendices`
- [x] Editar datos de un aprendiz (correo, nombre, cédula) — para correcciones
- [x] Desactivar aprendiz de la ficha

### 6.5 Gestión de Programas y Centros de Formación (Admin)

- [x] CRUD completo de programas de formación (crear, listar, editar, activar/desactivar)
- [x] CRUD completo de centros de formación

### 6.6 Módulo de Asistencia (Instructor / Gestor de Grupo)

- [x] Ver fichas asignadas al instructor
- [x] Tomar asistencia solo en el día de la semana que tiene asignado en el horario
- [x] Si el día es festivo o domingo, el sistema bloquea y muestra alerta
- [x] Vista de toma de asistencia muestra: nombre del aprendiz + cédula + avatar con iniciales
- [x] 4 opciones por aprendiz: **Presente** | **Falla** | **Inasistencia Parcial** | **Excusa**
- [x] Opción "Inasistencia Parcial": desplegable con números enteros desde 1 hasta (horas_programadas - 1) para elegir cuántas horas no asistió
- [x] Botón **[Marcar todos presentes]** para marcar todos de un clic
- [x] Barra de progreso: "X de N registrados" — avanza a medida que se marcan aprendices
- [x] Al guardar: verificar que TODOS los aprendices tengan una opción marcada — si falta alguno, alerta indicando cuál
- [x] Al guardar con todos marcados: redirigir al historial de asistencia de esa sesión
- [x] Visualización con colores de los tipos de asistencia en el historial
- [x] Modificar asistencias de días anteriores (solo de sus propios días asignados)
- [x] Ver asistencias registradas por otros instructores de la misma ficha (solo lectura)
- [x] Ver total de inasistencias de aprendices de sus fichas

### 6.7 Historial de Asistencia (Instructor / Coordinador / Admin)

- [x] Tabla de asistencia por sesión con colores diferenciadores
- [x] Navegar por el historial del periodo
- [x] Filtrar por ficha, instructor, fecha, tipo de asistencia
- [x] Colores visualmente claros por tipo: verde=presente, rojo=falla, amarillo=excusa, azul=parcial
- [x] Ver horas de inasistencia para los registros de tipo "parcial"
- [x] Paginación o scroll virtual para fichas con muchos aprendices

### 6.8 Módulo Aprendiz (Solo lectura)

- [x] Vista de "Mi Historial" — tarjeta de resumen personal
- [x] Ver sus asistencias por fecha: tipo de asistencia + horas inasistidas
- [x] Contador total de horas de inasistencia acumuladas
- [x] Aislamiento total: nunca ve datos de otros aprendices
- [x] No puede editar nada

### 6.9 Módulo Coordinador (Solo lectura + filtros)

- [x] Ver asistencias de todas las fichas
- [x] Filtrar por: Centro de formación, Ficha, Jornada, Instructor, Aprendiz, Fecha
- [x] Buscar por número de ficha o nombre de aprendiz
- [x] Ver estadísticas básicas por centro de formación
- [x] Visualización clara de las clases de cada instructor, de cada día, de cada aprendiz
- [x] Descargar reporte Excel CPIC de cualquier ficha

### 6.10 Dashboard

- [x] Admin: total usuarios, fichas activas, aprendices, asistencias del día, actividad reciente
- [x] Instructor: fichas asignadas, próxima sesión, resumen de asistencias recientes
- [x] Coordinador: fichas activas, estadísticas de asistencia por centro, fichas con mayor ausentismo
- [x] Todos los números vienen de consultas reales a la BD

### 6.11 Generación de Reporte Excel CPIC

- [x] Botón "Descargar Reporte" para instructores, gestor, coordinador y admin
- [x] Usa `PhpSpreadsheet` para cargar la plantilla `plantilla_asistencia.xlsx` e inyectar datos
- [x] En la casilla Instructor/Tutor: nombres separados por comas — primero el gestor, luego los demás
- [x] **Solo se reflejan horas de inasistencia** en la plantilla (no símbolo E de excusa)
- [x] La suma de horas de inasistencia por aprendiz aparece al final del documento
- [x] Coordenadas dinámicas calculadas según días hábiles del periodo (ver lógica en Sección 21)
- [x] No se sobreescribe la plantilla original

### 6.12 Seguridad y Accesibilidad

- [x] reCAPTCHA v2 en login
- [x] 2FA TOTP para todos los roles excepto aprendices
- [x] Recuperación de contraseña por correo
- [x] Botón de accesibilidad: activa características de accesibilidad del sistema operativo (lupa, alto contraste)
- [x] Diseño responsive funcional en móviles

### 6.13 Gestión de Días Festivos (Admin)

- [x] Vista para agregar/eliminar días festivos del calendario
- [x] El sistema bloquea automáticamente tomar asistencia en días festivos y domingos

### 6.14 Configuración del Sistema (Admin)

- [x] Nombre del sistema, institución
- [x] Configurar timeout de sesión
- [x] Ver log de actividad reciente
- [x] Gestión de días festivos

---

## 7. FLUJOS PRINCIPALES POR CASO DE USO

### Flujo 1: Login completo con 2FA (Instructores / Admin / Coordinador)

```
1. Usuario abre /login
2. Ingresa correo + contraseña + completa reCAPTCHA
3. Backend verifica reCAPTCHA con secret key de Google
4. Backend busca usuario por correo en tabla usuarios
5. Si usuario no existe → error genérico (no revelar si existe)
6. Si usuario inactivo (activo=0) → alerta: "Tu cuenta está desactivada. Comunícate con el administrador."
7. Si usuario es aprendiz → redirigir al flujo de login de aprendiz
8. Verificar intentos fallidos recientes: si >= MAX_INTENTOS_LOGIN en últimos MINUTOS_BLOQUEO → "Cuenta bloqueada temporalmente. Intenta en X minutos."
9. Verificar contraseña con password_verify() (bcrypt)
10. Si contraseña incorrecta → registrar intento fallido en intentos_login, mostrar error genérico
11. Si contraseña correcta → regenerar ID de sesión (sanctum token)
12. Verificar totp_verificado del usuario:
    - Si 0 (primera vez) → redirigir a /2fa/configurar (mostrar QR para escanear)
    - Si 1 → redirigir a /2fa/verificar (pedir código TOTP de 6 dígitos)
13. En /2fa/verificar: validar código TOTP (tolerancia de 30 segundos)
    - Si inválido → error, pedir de nuevo, registrar intento
    - Si válido → sesión completa, redirigir al dashboard según rol
14. Registrar login exitoso en historial_actividad
```

### Flujo 2: Login especial de Aprendiz

```
1. Aprendiz abre /login
2. Ingresa correo + número de cédula (documento)
3. Backend busca usuario por correo donde rol='aprendiz' y activo=1
4. Verifica que documento coincida con lo registrado
5. Si correcto → sesión creada, redirigir a /mi-historial
6. Si incorrecto → error genérico sin revelar cuál dato está mal
7. Sin 2FA, sin reCAPTCHA para aprendices
```

### Flujo 3: Recuperación de Contraseña

```
1. Usuario hace clic en "¿Olvidaste tu contraseña?" en el login
2. Va a /recuperar, ingresa su correo
3. Backend busca usuario (sin revelar si existe o no → mensaje genérico)
4. Si usuario existe y tiene correo válido:
   - Generar token con bin2hex(random_bytes(32))
   - Guardar en tokens_reset: usuario_id, token, expira_en = NOW() + 1 hora
   - Enviar correo con enlace: /reset?token=XXXXX vía PHPMailer/Gmail SMTP
5. Mostrar alerta: "Si el correo existe, recibirás las instrucciones."
6. Usuario abre el enlace del correo
7. Backend verifica: token existe + no está usado (usado=0) + no está expirado
8. Si inválido/expirado → error claro: "Este enlace es inválido o ya fue utilizado."
9. Si válido → mostrar formulario de nueva contraseña
10. Usuario ingresa nueva contraseña + confirmación
11. Validar política de contraseñas en frontend Y backend
12. Si válida → password_hash() con bcrypt, actualizar en BD
13. Marcar token como usado (usado=1)
14. Redirigir al login con mensaje de éxito vía SweetAlert2
```

### Flujo 4: Tomar Asistencia (Instructor)

```
1. Instructor inicia sesión y va a su dashboard
2. Ve sus fichas asignadas → selecciona una ficha
3. El sistema verifica que hoy sea el día de la semana asignado al instructor en esa ficha
4. Si hoy es domingo → alerta: "No se trabaja los domingos."
5. Si hoy es día festivo (existe en dias_festivos) → alerta con el nombre del festivo
6. Si el instructor no tiene asignación para hoy en esta ficha → alerta: "No tienes formación asignada hoy para esta ficha."
7. Si ya existe una sesión cerrada para hoy → mostrar historial (no volver a tomar)
8. Si todo OK → crear sesión en tabla sesiones (estado='abierta')
9. Mostrar lista de aprendices de la ficha con: nombre + cédula + avatar iniciales
10. Cada fila tiene 4 botones de radio: Presente | Falla | Inasistencia Parcial | Excusa
11. Si selecciona "Inasistencia Parcial" → aparece desplegable: 1, 2, 3... hasta (horas_programadas-1)
12. Barra de progreso se actualiza en tiempo real: "X de N registrados"
13. Instructor puede hacer clic en [Marcar todos presentes] para marcar todos de golpe
14. Al hacer clic en [Guardar asistencia]:
    - Verificar que TODOS los aprendices tengan una opción seleccionada
    - Si falta alguno → alerta con el nombre del aprendiz sin marcar
    - Si todos marcados → guardar registros_asistencia en BD dentro de transacción
    - Actualizar sesión.estado = 'cerrada'
    - Redirigir al historial de esa sesión con SweetAlert2 de éxito
```

### Flujo 5: Modificar Asistencia Anterior (Instructor)

```
1. Instructor va al historial de sus sesiones pasadas
2. Solo ve el botón "Editar" en sesiones donde él fue el instructor asignado
3. Al editar: se crea un registro en registros_asistencia_backup (tabla espejo)
   con: tipo_anterior, horas_ant, tipo_nuevo, horas_nuevo, modificado_por, creado_en
4. Se actualiza el registro en registros_asistencia
5. Alerta de confirmación antes de guardar
```

### Flujo 6: Importar Aprendices desde Excel (Admin)

```
1. Admin va a la vista de una ficha → pestaña "Aprendices" → botón "Importar desde Excel"
2. Admin sube archivo Excel con columnas: cedula | nombre_completo | correo
3. Backend lee el archivo con PhpSpreadsheet
4. Por cada fila:
   - Validar que cedula, nombre_completo y correo no estén vacíos
   - Verificar si ya existe un usuario con ese correo → si sí, omitir y marcar como fallido
   - Crear usuario con rol='aprendiz', ficha_id=ficha actual, password=NULL
5. Mostrar resumen: "Importados: X exitosos, Y fallidos"
6. Registrar en importaciones_aprendices
7. Los aprendices importados pueden acceder inmediatamente con correo + cédula
```

### Flujo 7: Generar Reporte Excel CPIC

```
1. Instructor/Coordinador/Admin hace clic en "Descargar Reporte"
2. Selecciona ficha y rango de fechas del periodo
3. Backend consulta:
   - Datos de la ficha (número, programa, instructores, gestor)
   - Fechas de sesiones del periodo (solo días hábiles — sin festivos ni domingos)
   - Lista de aprendices de la ficha
   - Registros de asistencia de cada aprendiz por sesión
4. Cargar plantilla plantilla_asistencia.xlsx con PhpSpreadsheet (IOFactory::load)
5. Inyectar datos dinámicos según lógica de coordenadas (ver Sección 21)
6. Calcular horas de inasistencia por aprendiz:
   - Falla: horas_programadas de esa sesión
   - Parcial: horas_inasistencia del registro
   - Excusa/Presente: 0 (no aparece en Excel)
7. Descargar archivo como: reporte_FICHA_PERIODO.xlsx
8. NO sobreescribir la plantilla original
```

---

## 8. REGLAS DE NEGOCIO

> Estas reglas se verifican SIEMPRE en el backend (Laravel). Nunca solo en el frontend.

1. **Unicidad de correo:** Un correo no puede estar duplicado en la tabla `usuarios`, incluso entre usuarios inactivos.

2. **Protección del admin:** El admin no puede desactivar, eliminar ni cambiar el rol de su propia cuenta.

3. **Un solo gestor por ficha:** Solo puede haber un `es_gestor=1` activo por `ficha_id` en `ficha_instructor`. Intentar asignar un segundo gestor → alerta: "Esta ficha ya tiene un Gestor de Grupo: [nombre]. Para cambiar de gestor, primero desasigna el actual."

4. **Control de días de asistencia:** Un instructor solo puede tomar asistencia en la fecha que corresponde al `dia_semana` de su `horario` asignado en la ficha. La validación compara `DAYOFWEEK(fecha)` con el día asignado.

5. **Sin festivos ni domingos:** El sistema bloquea tomar asistencia en domingos y en fechas registradas en `dias_festivos`. El error muestra el nombre del festivo.

6. **Una sesión por horario-fecha:** No puede haber dos sesiones del mismo `horario_id` en la misma `fecha`. UNIQUE KEY en la BD + validación en el servidor.

7. **Un registro por aprendiz-sesión:** No puede haber dos registros de asistencia del mismo `aprendiz_id` en la misma `sesion_id`. UNIQUE KEY + validación.

8. **Horas parciales válidas:** Si `tipo='parcial'`, entonces `horas_inasistencia` debe ser un entero entre 1 y (`horas_programadas` de la sesión - 1). Si `tipo` es cualquier otro valor, `horas_inasistencia` debe ser NULL.

9. **Cálculo de horas de inasistencia total:**
   - `Falla` = sumar `horas_programadas` de cada sesión donde el tipo fue 'falla'
   - `Parcial` = sumar `horas_inasistencia` de cada registro de tipo 'parcial'
   - `Excusa` y `Presente` = 0 horas de inasistencia
   - Fórmula: `Total_Inasistencia = Σ(fallas * horas_programadas_sesión) + Σ(horas_inasistencia_parcial)`

10. **Un aprendiz, una ficha:** Un aprendiz no puede pertenecer a más de una ficha. `usuarios.ficha_id` es NOT NULL para aprendices y es UNIQUE implícito por el diseño de negocio.

11. **Modificación solo de días propios:** Un instructor puede modificar registros de asistencia solo de sesiones donde `sesiones.instructor_id = usuarios.id`. No puede modificar sesiones de otros instructores.

12. **Tokens de un solo uso:** Un token de reset es inválido después del primer uso O después de su tiempo de expiración, lo que ocurra primero.

13. **Soft delete universal:** Ningún registro de negocio se elimina físicamente. Solo se desactiva (`activo = 0`). Esto preserva la integridad del historial de asistencias. La única excepción es si el admin explícitamente confirma "Eliminar permanentemente" un usuario ya desactivado.

14. **Zona horaria:** Todas las fechas y horas se registran y muestran en hora colombiana (UTC-5 / America/Bogota).

15. **Formato de fechas:** DD/MM/AAAA en la interfaz. YYYY-MM-DD en la BD y en la API.

16. **En el Excel CPIC:** Solo se reflejan horas de inasistencia numéricas. La excusa no genera número en el Excel. La suma al final del documento es solo de horas de inasistencia (falla + parcial).

17. **Instructor/Tutor en el Excel:** Los nombres van separados por comas. Primero el gestor de grupo, luego los demás instructores en cualquier orden.

18. **Transición de estados de sesión:** `abierta` → `cerrada` (al guardar asistencia). Una sesión cerrada no puede reabrirse directamente — para modificar se edita el registro individual, no la sesión completa.

19. **Usuario inactivo bloqueado:** Si `activo = 0`, el usuario no puede iniciar sesión bajo ninguna circunstancia, aunque tenga credenciales correctas.

20. **Aprendiz — aislamiento total:** Un aprendiz solo puede ver sus propios registros. Cualquier intento de acceder a datos de otro aprendiz via URL manipulada → 403.

---

# PARTE B — ARQUITECTURA Y CONVENCIONES

---

## 9. ARQUITECTURA Y ESTRUCTURA DE ARCHIVOS

**Arquitectura:** Frontend separado (Next.js SPA) + Backend API REST (Laravel) + Base de datos (MySQL)

**Comunicación:** Next.js hace peticiones HTTP a la API de Laravel. Laravel usa Sanctum para autenticación stateful (cookies de sesión).

```
/quorum/                            # Raíz del proyecto
│
├── quorum-frontend/                # Aplicación Next.js (TypeScript)
│   ├── package.json
│   ├── tsconfig.json               # "strict": true obligatorio
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   │
│   ├── app/                        # App Router de Next.js 14+
│   │   ├── layout.tsx              # Layout raíz (fuente, metadata)
│   │   ├── page.tsx                # Redirige a /login o /dashboard
│   │   ├── (auth)/                 # Rutas públicas sin sidebar
│   │   │   ├── login/page.tsx
│   │   │   ├── 2fa/
│   │   │   │   ├── configurar/page.tsx   # Mostrar QR primera vez
│   │   │   │   └── verificar/page.tsx    # Ingresar código
│   │   │   ├── recuperar/page.tsx
│   │   │   └── reset/page.tsx
│   │   ├── (dashboard)/            # Rutas protegidas con sidebar
│   │   │   ├── layout.tsx          # Layout con sidebar + headbar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── fichas/
│   │   │   │   ├── page.tsx        # Listar fichas
│   │   │   │   ├── [id]/page.tsx   # Detalle de ficha
│   │   │   │   └── nueva/page.tsx
│   │   │   ├── asistencia/
│   │   │   │   ├── tomar/page.tsx  # Tomar asistencia del día
│   │   │   │   └── historial/page.tsx
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/page.tsx
│   │   │   │   └── [id]/editar/page.tsx
│   │   │   ├── mi-historial/page.tsx    # Solo aprendices
│   │   │   ├── configuracion/page.tsx
│   │   │   └── perfil/page.tsx
│   │   └── api/                    # Route Handlers (proxy si se necesita)
│   │
│   ├── components/                 # Componentes React reutilizables
│   │   ├── ui/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Headbar.tsx
│   │   │   ├── Avatar.tsx          # Círculo con iniciales
│   │   │   ├── Badge.tsx           # Badges de estado/rol coloreados
│   │   │   ├── ProgressBar.tsx     # Barra de progreso asistencia
│   │   │   ├── DataTable.tsx       # Tabla con scroll horizontal
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── FlashMessage.tsx
│   │   ├── asistencia/
│   │   │   ├── ListaAsistencia.tsx # Checklist de aprendices
│   │   │   ├── FilaAprendiz.tsx    # Fila individual con opciones
│   │   │   └── MatrizAsistencia.tsx # Vista de historial en matriz
│   │   ├── fichas/
│   │   │   ├── FormFicha.tsx
│   │   │   └── ConfigHorario.tsx
│   │   └── reportes/
│   │       └── BtnDescargarExcel.tsx
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Leer sesión del usuario
│   │   ├── useAsistencia.ts
│   │   └── useFichas.ts
│   │
│   ├── services/                   # Llamadas a la API de Laravel
│   │   ├── api.ts                  # Configuración base de axios/fetch
│   │   ├── auth.service.ts
│   │   ├── usuarios.service.ts
│   │   ├── fichas.service.ts
│   │   ├── asistencia.service.ts
│   │   └── reportes.service.ts
│   │
│   └── types/                      # Interfaces TypeScript
│       ├── usuario.ts
│       ├── ficha.ts
│       ├── asistencia.ts
│       └── api.ts
│
├── quorum-backend/                 # API REST Laravel
│   ├── .env                        # Variables de entorno (NO subir al repo)
│   ├── composer.json
│   │
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── UsuarioController.php
│   │   │   │   ├── FichaController.php
│   │   │   │   ├── AsistenciaController.php
│   │   │   │   ├── AprendizController.php
│   │   │   │   ├── ReporteController.php
│   │   │   │   ├── ConfiguracionController.php
│   │   │   │   └── ImportacionController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── VerificarRol.php
│   │   │   │   └── VerificarSesion.php
│   │   │   └── Requests/          # Form Requests para validación
│   │   │       ├── LoginRequest.php
│   │   │       ├── CrearUsuarioRequest.php
│   │   │       └── GuardarAsistenciaRequest.php
│   │   ├── Models/
│   │   │   ├── Usuario.php
│   │   │   ├── FichaCaracterizacion.php
│   │   │   ├── Horario.php
│   │   │   ├── Sesion.php
│   │   │   ├── RegistroAsistencia.php
│   │   │   ├── RegistroAsistenciaBackup.php
│   │   │   ├── FichaInstructor.php
│   │   │   ├── JornadaFicha.php
│   │   │   ├── CentroFormacion.php
│   │   │   ├── ProgramaFormacion.php
│   │   │   ├── DiaFestivo.php
│   │   │   ├── IntentoLogin.php
│   │   │   └── TokenReset.php
│   │   ├── Policies/              # Laravel Policies para autorización
│   │   │   ├── AsistenciaPolicy.php
│   │   │   └── FichaPolicy.php
│   │   └── Services/              # Lógica de negocio
│   │       ├── AsistenciaService.php
│   │       ├── ReporteExcelService.php  # PhpSpreadsheet
│   │       ├── ImportacionService.php
│   │       └── TotpService.php
│   │
│   ├── database/
│   │   ├── migrations/            # Una migración por tabla
│   │   ├── seeders/
│   │   │   ├── DatabaseSeeder.php
│   │   │   ├── CentroFormacionSeeder.php
│   │   │   ├── ProgramaFormacionSeeder.php
│   │   │   ├── UsuarioSeeder.php
│   │   │   ├── FichaSeeder.php
│   │   │   └── DiasFestivosSeeder.php
│   │   └── quorum.sql             # Script SQL completo exportado
│   │
│   ├── routes/
│   │   └── api.php                # Todas las rutas API REST
│   │
│   ├── storage/
│   │   ├── plantilla_asistencia.xlsx  # Plantilla oficial CPIC
│   │   └── logs/                      # Logs de errores
│   │
│   └── README.md
│
└── README.md                       # Instrucciones generales del proyecto
```

---

## 10. CONVENCIONES DE NOMBRES

| Elemento | Convención | Ejemplo correcto | Ejemplo incorrecto |
|----------|-----------|-----------------|-------------------|
| Tablas de BD | `snake_case` plural | `registros_asistencia`, `fichas_caracterizacion` | `RegistrosAsistencia` |
| Columnas de BD | `snake_case` | `instructor_id`, `creado_en` | `instructorId` |
| Modelos Laravel | `PascalCase` singular | `FichaCaracterizacion`, `RegistroAsistencia` | `fichacaracterizacion` |
| Controladores | `PascalCase` + `Controller` | `AsistenciaController` | `asistenciacontroller` |
| Métodos Laravel | `camelCase` | `obtenerPorFicha()`, `guardarAsistencia()` | `obtener_por_ficha()` |
| Componentes React | `PascalCase` | `ListaAsistencia.tsx`, `FilaAprendiz.tsx` | `lista-asistencia.tsx` |
| Hooks React | `camelCase` con prefijo `use` | `useAsistencia`, `useFichas` | `AsistenciaHook` |
| Variables TS/JS | `camelCase` | `fichaActual`, `aprendizId` | `ficha_actual` |
| Interfaces TS | `PascalCase` con prefijo `I` o sin él | `Usuario`, `IFicha` | `usuario_interface` |
| Archivos de servicio | `camelCase.service.ts` | `asistencia.service.ts` | `AsistenciaService.ts` |
| Rutas API Laravel | `kebab-case` | `/api/fichas-caracterizacion` | `/api/fichasCaracterizacion` |
| Variables de entorno | `UPPER_SNAKE_CASE` | `DB_HOST`, `RECAPTCHA_SECRET_KEY` | `dbHost` |
| Clases CSS (Tailwind) | Clases de Tailwind CSS | `bg-green-600`, `text-red-500` | CSS inline arbitrario |

---

## 11. LAYOUT GLOBAL

**Sidebar (componente `Sidebar.tsx`):**
- Logo SENA en la parte superior (placeholder hasta recibir logo oficial)
- Nombre del sistema "QUORUM" debajo del logo
- Navegación según rol del usuario logueado (menús diferentes por rol)
- Indicador visual de la sección activa (borde izquierdo verde + fondo)
- Nombre del usuario + rol en la parte inferior del sidebar
- Menú hamburguesa en pantallas < 768px
- Fondo: `#1A1A2E` (negro azulado) con texto blanco

**Menú por rol:**
- `admin`: Dashboard, Usuarios, Fichas, Programas, Centros, Importaciones, Festivos, Configuración
- `coordinador`: Dashboard, Asistencias (todas las fichas), Estadísticas
- `instructor` / `gestor_grupo`: Dashboard, Mis Fichas, Tomar Asistencia, Historial, Descargar Reporte
- `aprendiz`: Mi Historial

**Headbar (componente `Headbar.tsx`):**
- Nombre del sistema "QUORUM" (izquierda)
- Nombre del rol (centro, badge coloreado)
- Avatar con iniciales + nombre del usuario (derecha)
- Botón de cerrar sesión (derecha, ícono de salida)
- Botón de accesibilidad (ícono de ojo — activa características del SO)

**Botón de Accesibilidad:**
- Icono de lupa o accesibilidad (Lucide `Accessibility`)
- Al hacer clic: muestra opciones de accesibilidad que aprovechan las del sistema operativo
- Opciones: aumentar texto, alto contraste, activar lupa del SO
- Implementar con CSS variables para escala de texto y contraste

**Footer:** Copyright SENA CPIC — QUORUM v1.0

---

## 12. RUTAS Y PÁGINAS

**Frontend (Next.js):**

| Ruta | Componente/Página | Rol requerido |
|------|------------------|---------------|
| `/` | Redirige a `/login` o `/dashboard` | Público |
| `/login` | `(auth)/login/page.tsx` | Público |
| `/2fa/configurar` | `(auth)/2fa/configurar/page.tsx` | Post-login parcial |
| `/2fa/verificar` | `(auth)/2fa/verificar/page.tsx` | Post-login parcial |
| `/recuperar` | `(auth)/recuperar/page.tsx` | Público |
| `/reset` | `(auth)/reset/page.tsx` | Token válido |
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | Todos los roles |
| `/fichas` | `(dashboard)/fichas/page.tsx` | admin |
| `/fichas/nueva` | `(dashboard)/fichas/nueva/page.tsx` | admin |
| `/fichas/[id]` | `(dashboard)/fichas/[id]/page.tsx` | admin |
| `/asistencia/tomar` | `(dashboard)/asistencia/tomar/page.tsx` | instructor, gestor_grupo |
| `/asistencia/historial` | `(dashboard)/asistencia/historial/page.tsx` | admin, coordinador, instructor, gestor_grupo |
| `/mi-historial` | `(dashboard)/mi-historial/page.tsx` | aprendiz |
| `/usuarios` | `(dashboard)/usuarios/page.tsx` | admin |
| `/usuarios/nuevo` | `(dashboard)/usuarios/nuevo/page.tsx` | admin |
| `/usuarios/[id]/editar` | `(dashboard)/usuarios/[id]/editar/page.tsx` | admin |
| `/perfil` | `(dashboard)/perfil/page.tsx` | Todos los roles |
| `/configuracion` | `(dashboard)/configuracion/page.tsx` | admin |

**Backend API (Laravel):**

| Método | Endpoint | Controlador@Método | Rol requerido |
|--------|----------|-------------------|---------------|
| POST | `/api/auth/login` | `AuthController@login` | Público |
| POST | `/api/auth/login-aprendiz` | `AuthController@loginAprendiz` | Público |
| POST | `/api/auth/logout` | `AuthController@logout` | Autenticado |
| POST | `/api/auth/2fa/configurar` | `AuthController@configurar2FA` | Post-login parcial |
| POST | `/api/auth/2fa/verificar` | `AuthController@verificar2FA` | Post-login parcial |
| POST | `/api/auth/recuperar` | `AuthController@solicitarReset` | Público |
| POST | `/api/auth/reset` | `AuthController@procesarReset` | Token válido |
| GET | `/api/usuarios` | `UsuarioController@index` | admin |
| POST | `/api/usuarios` | `UsuarioController@store` | admin |
| PUT | `/api/usuarios/{id}` | `UsuarioController@update` | admin |
| DELETE | `/api/usuarios/{id}` | `UsuarioController@destroy` (soft delete) | admin |
| GET | `/api/fichas` | `FichaController@index` | admin, coordinador |
| POST | `/api/fichas` | `FichaController@store` | admin |
| GET | `/api/fichas/{id}` | `FichaController@show` | admin, coordinador, instructor |
| PUT | `/api/fichas/{id}` | `FichaController@update` | admin |
| DELETE | `/api/fichas/{id}` | `FichaController@destroy` | admin |
| GET | `/api/asistencia/sesion/{fichaId}/{fecha}` | `AsistenciaController@getSesion` | instructor, gestor_grupo |
| POST | `/api/asistencia` | `AsistenciaController@guardar` | instructor, gestor_grupo |
| PUT | `/api/asistencia/{id}` | `AsistenciaController@actualizar` | instructor, gestor_grupo |
| GET | `/api/asistencia/historial/{fichaId}` | `AsistenciaController@historial` | admin, coordinador, instructor, gestor_grupo |
| GET | `/api/mi-historial` | `AprendizController@miHistorial` | aprendiz |
| GET | `/api/reportes/excel/{fichaId}` | `ReporteController@descargarExcel` | admin, coordinador, instructor, gestor_grupo |
| POST | `/api/importaciones/aprendices` | `ImportacionController@importar` | admin |
| GET | `/api/centros-formacion` | `CentroFormacionController@index` | admin |
| GET | `/api/programas-formacion` | `ProgramaFormacionController@index` | admin |
| GET | `/api/dias-festivos` | `DiaFestivoController@index` | admin |
| POST | `/api/dias-festivos` | `DiaFestivoController@store` | admin |

---

## 13. COMPONENTES REUTILIZABLES

- **`Avatar`**: Círculo con dos iniciales del nombre del usuario. Color asignado por hash del ID (paleta de colores predefinida). Tamaños: sm, md, lg.
- **`Badge`**: Chip coloreado para mostrar tipo de asistencia, rol o estado. Colores definidos en la Sección 4.
- **`DataTable`**: Tabla con encabezados fijos, scroll horizontal en móvil, paginación, columna de acciones.
- **`ProgressBar`**: Barra de progreso con texto "X de N registrados" para la vista de toma de asistencia.
- **`FilaAprendiz`**: Fila de la lista de asistencia con: avatar, nombre, cédula, 4 radio buttons (Presente/Falla/Parcial/Excusa), desplegable de horas para Parcial.
- **`MatrizAsistencia`**: Tabla con aprendices en filas, fechas en columnas, colores por tipo de asistencia. Scroll horizontal.
- **`Modal`**: Modal genérico reutilizable con SweetAlert2 para confirmaciones destructivas.
- **`FlashMessage`**: Mensaje de éxito/error que aparece tras un redirect con SweetAlert2.
- **`FormFiltros`**: Filtros con fecha desde/hasta, selector de estado, ficha, rol. Botones buscar/limpiar.
- **`BtnDescargarExcel`**: Botón con ícono de descarga, estado de carga, llama al endpoint de reporte.
- **`LoadingSpinner`**: Spinner de carga para operaciones asíncronas.
- **`EmptyState`**: Componente cuando no hay datos — ícono + mensaje amigable + acción sugerida.

---

# PARTE C — SEGURIDAD

---

## 14. SEGURIDAD — CAPA COMPLETA

### 14.1 Credenciales y Claves (CONFIGURADAS — NO MODIFICAR)

```env
# reCAPTCHA v2 — QUORUM PROYECTO
RECAPTCHA_SITE_KEY=6LeBJIUsAAAAALbdEJ-Rvjt7Qc6k51zIJ9qXUlTZ
RECAPTCHA_SECRET_KEY=6LeBJIUsAAAAAFSR669EoUCLSUWII_lFR8TUqGzx

# Gmail SMTP — App Password configurado
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=andresfelipeorozcopiedrahita@gmail.com
MAIL_PASSWORD=idel oiqb lnla isec
MAIL_FROM_ADDRESS=andresfelipeorozcopiedrahita@gmail.com
MAIL_FROM_NAME="QUORUM - Sistema SENA"

# Base de datos (XAMPP local)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=quorum
DB_USERNAME=root
DB_PASSWORD=

# App
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

> **Nota de seguridad:** El MAIL_PASSWORD es una Contraseña de Aplicación de Google (no la contraseña real de la cuenta). El archivo `.env` NO debe subirse al repositorio. Añadir `.env` al `.gitignore`.

### 14.2 Política de Contraseñas

```typescript
// Validar en frontend (TypeScript) Y en backend (Laravel)
// Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial
const validarContrasena = (pass: string): string[] => {
  const errores: string[] = [];
  if (pass.length < 8)              errores.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(pass))          errores.push('Al menos 1 mayúscula');
  if (!/[0-9]/.test(pass))          errores.push('Al menos 1 número');
  if (!/[^A-Za-z0-9]/.test(pass))   errores.push('Al menos 1 carácter especial');
  return errores; // vacío = contraseña válida
};
```

```php
// En Laravel — FormRequest o Service
public function validarContrasena(string $pass): array {
    $errores = [];
    if (strlen($pass) < 8)              $errores[] = 'Mínimo 8 caracteres';
    if (!preg_match('/[A-Z]/', $pass))  $errores[] = 'Al menos 1 mayúscula';
    if (!preg_match('/[0-9]/', $pass))  $errores[] = 'Al menos 1 número';
    if (!preg_match('/[\W_]/', $pass))  $errores[] = 'Al menos 1 carácter especial';
    return $errores;
}
```

### 14.3 Contraseñas — Almacenamiento Seguro (Laravel)

```php
// Crear hash (al registrar o cambiar contraseña):
$hash = bcrypt($contrasena); // Laravel usa bcrypt por defecto

// Verificar (al hacer login):
if (Hash::check($contrasenaIngresada, $usuario->password)) { /* OK */ }

// NUNCA:
// - Guardar contraseñas en texto plano
// - Usar MD5 o SHA1
// - Hardcodear hashes generados fuera del entorno local
```

### 14.4 Bloqueo de Intentos de Login

```php
// En AuthController — antes de verificar contraseña:
$intentosRecientes = IntentoLogin::where('correo', $correo)
    ->where('exitoso', 0)
    ->where('creado_en', '>=', now()->subMinutes(config('auth.minutos_bloqueo')))
    ->count();

if ($intentosRecientes >= config('auth.max_intentos')) {
    return response()->json([
        'message' => 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.'
    ], 429);
}
```

### 14.5 SQL Injection — Eloquent ORM y Query Builder

```php
// CORRECTO — siempre así con Eloquent:
$usuario = Usuario::where('correo', $correo)->where('activo', 1)->first();

// CORRECTO — con Query Builder:
$usuario = DB::table('usuarios')
    ->where('correo', '=', $correo)
    ->where('activo', '=', 1)
    ->first();

// NUNCA — concatenación directa:
// DB::select("SELECT * FROM usuarios WHERE correo = '$correo'"); // PROHIBIDO
```

### 14.6 Autorización con Laravel Policies y Gates

```php
// En cada controlador, verificar permisos usando Policies:
$this->authorize('tomarAsistencia', $sesion);

// Policy AsistenciaPolicy:
public function tomarAsistencia(Usuario $usuario, Sesion $sesion): bool {
    // Solo puede tomar asistencia si:
    // 1. Es instructor o gestor_grupo
    // 2. Está asignado a la ficha
    // 3. La fecha corresponde a su día de semana asignado
    // 4. La fecha no es domingo ni festivo
    return in_array($usuario->rol, ['instructor', 'gestor_grupo'])
        && $sesion->horario->instructor_id === $usuario->id
        && $sesion->fecha->dayOfWeek !== Carbon::SUNDAY
        && !DiaFestivo::esFestivo($sesion->fecha);
}
```

### 14.7 Sesiones — Laravel Sanctum

```php
// En config/sanctum.php:
// SANCTUM_STATEFUL_DOMAINS=localhost:3000

// En cada controlador protegido, el middleware sanctum verifica la sesión:
// Route::middleware(['auth:sanctum'])->group(function () { ... });

// Al hacer login exitoso:
$token = $usuario->createToken('quorum-token')->plainTextToken;

// Al hacer logout:
$usuario->currentAccessToken()->delete();
```

### 14.8 reCAPTCHA — Integración Completa

```typescript
// En el formulario de login (Next.js + react-google-recaptcha):
import ReCAPTCHA from 'react-google-recaptcha';

<ReCAPTCHA
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
  onChange={setRecaptchaToken}
/>
```

```php
// En AuthController — verificar antes de procesar credenciales:
private function verificarRecaptcha(string $token): bool {
    $response = Http::post('https://www.google.com/recaptcha/api/siteverify', [
        'secret'   => config('services.recaptcha.secret_key'),
        'response' => $token,
    ]);
    return $response->json('success', false);
}
```

### 14.9 2FA TOTP — Integración Completa

```php
// Usar librería: PHPGangsta/GoogleAuthenticator
// Instalar: composer require pragmarx/google2fa

use PragmaRX\Google2FA\Google2FA;

// Al generar el QR (primera vez):
$google2fa = new Google2FA();
$secret    = $google2fa->generateSecretKey();
$qrUrl     = $google2fa->getQRCodeUrl(
    'SENA CPIC',   // Nombre del issuer
    $usuario->correo,
    $secret
);
// Mostrar QR en el frontend con librería qrcode (npm)

// Al verificar código:
$esValido = $google2fa->verifyKey($usuario->totp_secret, $codigoIngresado);
if ($esValido) {
    $usuario->update(['totp_verificado' => 1]);
    // Crear sesión completa
}
```

### 14.10 Manejo de Errores — Configuración

```php
// En .env de Laravel:
APP_DEBUG=false      // Nunca true en demo o producción
LOG_CHANNEL=daily    // Logs rotativos diarios

// El usuario NUNCA ve errores técnicos de PHP/SQL
// Solo ve mensajes amigables en español
// Los errores reales van a storage/logs/laravel.log
```

### 14.11 Validación de Datos de Entrada — Laravel Form Requests

```php
// En GuardarAsistenciaRequest:
public function rules(): array {
    return [
        'sesion_id'              => 'required|integer|exists:sesiones,id',
        'registros'              => 'required|array|min:1',
        'registros.*.aprendiz_id'=> 'required|integer|exists:usuarios,id',
        'registros.*.tipo'       => 'required|in:presente,falla,excusa,parcial',
        'registros.*.horas_inasistencia' => 'nullable|integer|min:1',
    ];
}
```

---

# PARTE D — CALIDAD Y ROBUSTEZ

---

## 15. PLAN DE PRUEBAS UNIVERSAL

### 15.1 Pruebas Funcionales — Escenarios QUORUM

| Escenario | Pasos | Resultado esperado |
|-----------|-------|-------------------|
| Login admin con 2FA | Ingresar credenciales + CAPTCHA → escanear QR → ingresar código | Redirige al dashboard de admin |
| Login aprendiz | Ingresar correo + cédula | Redirige a Mi Historial |
| Tomar asistencia completa | Ir a ficha → marcar todos → guardar | Redirige al historial con colores |
| Tomar asistencia parcial | Marcar un aprendiz como "Inasistencia Parcial" + 2 horas | Registro con tipo='parcial' y horas_inasistencia=2 |
| Bloqueo por festivo | Intentar tomar asistencia en día festivo | Alerta con nombre del festivo |
| Guardar sin marcar todos | Dejar un aprendiz sin marcar y guardar | Alerta indicando nombre del aprendiz |
| Descargar Excel | Clic en descargar reporte → abrir el archivo | Excel con datos inyectados, logo visible, formato respetado |
| Importar Excel de aprendices | Subir archivo con 3 aprendices | 3 aprendices creados, accesibles con correo + cédula |
| Aprendiz ve solo lo suyo | Aprendiz A intenta acceder a `/mi-historial?aprendiz=B` | Error 403 o solo muestra datos de A |

### 15.2 Pruebas de Casos Límite (Edge Cases)

- Enviar formulario completamente vacío → error claro por campo, nunca error 500
- Doble clic en [Guardar asistencia] → solo una sesión creada (deshabilitar botón al primer clic)
- Botón "Atrás" del navegador después de guardar → no reenviar datos
- Sesión expirada a mitad de la toma de asistencia → redirigir al login, sin perder el formulario
- Caracteres especiales (tildes, ñ, comillas) en nombres de aprendices → manejar correctamente sin corromper
- Ficha sin aprendices importados → mostrar estado vacío con mensaje amigable
- Semana con todos los días festivos → sin sesiones disponibles, mensaje claro

### 15.3 Pruebas de Seguridad

| Ataque | Entrada de prueba | Resultado esperado |
|--------|------------------|-------------------|
| SQL Injection | `' OR '1'='1` en campo correo | Rechazado — Eloquent usa bindings |
| XSS | `<script>alert(1)</script>` en nombre | Mostrado como texto plano |
| Acceso sin sesión | `GET /dashboard` sin token | 401/403 → login |
| Acceso con rol incorrecto | Aprendiz accede a `/fichas` | 403 |
| IDOR (aprendiz A ve datos de B) | `GET /api/mi-historial?aprendiz=otro_id` | 403 |
| Fuerza bruta | 6+ intentos fallidos | Bloqueo 15 min |
| Token reutilizado | Mismo enlace de reset dos veces | "Enlace ya utilizado" |
| Instructor toma asistencia día no asignado | POST en día diferente al asignado | 403 con mensaje |

### 15.4 Pruebas de Validación de Asistencia

- `horas_inasistencia = 0` con tipo `parcial` → rechazado
- `horas_inasistencia = horas_programadas` con tipo `parcial` → rechazado (debe ser menor)
- `horas_inasistencia` con tipo `presente` → rechazado
- Sesión ya cerrada → no se puede crear una nueva para el mismo horario+fecha

### 15.5 Pruebas del Reporte Excel

- El archivo descargado abre sin error en Excel y LibreOffice
- El logo de la plantilla no se corrompe
- Los colores de la plantilla se mantienen
- Las fechas inyectadas corresponden exactamente a los días hábiles del periodo
- La suma de horas de inasistencia al final del documento es correcta
- Los nombres de instructores están separados por comas con el gestor primero
- Plantilla original no fue sobreescrita

---

## 16. REGLAS DE CONSTRUCCIÓN UNIVERSALES

```
✓ Validar SIEMPRE en el frontend (UX) Y en el backend (Laravel — seguridad)
✓ Nunca confiar únicamente en la validación del cliente
✓ Eloquent/Query Builder en el 100% de las consultas — sin SQL crudo concatenado
✓ Transacciones en operaciones que involucren más de una tabla (guardar asistencia completa)
✓ Soft delete: UPDATE activo=0, nunca DELETE en datos de negocio
✓ utf8mb4 en todas las tablas y en la cadena de conexión PDO
✓ Nunca mostrar errores técnicos al usuario final — solo mensajes amigables en español
✓ Registrar todos los errores técnicos en storage/logs/laravel.log
✓ Verificar sesión (sanctum token) y rol al inicio de cada ruta protegida
✓ SweetAlert2 para TODAS las alertas — nunca alert(), confirm(), prompt() nativos
✓ Lucide React para toda la iconografía — nunca emojis en la interfaz
✓ PRG en formularios: redirect después de cada POST exitoso
✓ Deshabilitar botón de envío al primer clic para prevenir doble envío
✓ Nada de lógica de negocio en componentes React de presentación — va en services/ o en la API
✓ TypeScript strict: nunca usar 'any' — tipar correctamente todos los datos
```

---

## 17. REGLAS ADICIONALES ANTI-BUG

### 17.1 UTF-8 en Tres Lugares Simultáneos

```php
// 1. En config/database.php de Laravel:
'mysql' => [
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'options'   => [PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8mb4'"],
]

// 2. En cada migración de tabla:
// ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

// 3. En el layout de Next.js:
// <html lang="es"> → Next.js ya incluye charset UTF-8 por defecto
```

### 17.2 Zona Horaria — Una Sola Configuración

```php
// En config/app.php de Laravel:
'timezone' => 'America/Bogota',

// En .env:
APP_TIMEZONE=America/Bogota
```

```typescript
// En Next.js, para mostrar fechas siempre en hora colombiana:
const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' });
```

### 17.3 Tabla Espejo — Disparador Automático de Backup

```php
// En AsistenciaService — al modificar un registro de asistencia:
public function actualizarRegistro(int $registroId, array $datos, int $modificadoPorId): void {
    DB::transaction(function () use ($registroId, $datos, $modificadoPorId) {
        $registro = RegistroAsistencia::findOrFail($registroId);

        // Guardar en tabla espejo ANTES de modificar
        RegistroAsistenciaBackup::create([
            'registro_asistencia_id'  => $registro->id,
            'sesion_id'               => $registro->sesion_id,
            'aprendiz_id'             => $registro->aprendiz_id,
            'tipo_anterior'           => $registro->tipo,
            'horas_inasistencia_ant'  => $registro->horas_inasistencia,
            'tipo_nuevo'              => $datos['tipo'],
            'horas_inasistencia_new'  => $datos['horas_inasistencia'] ?? null,
            'modificado_por'          => $modificadoPorId,
            'razon'                   => $datos['razon'] ?? null,
        ]);

        // Ahora sí actualizar el registro
        $registro->update([
            'tipo'               => $datos['tipo'],
            'horas_inasistencia' => $datos['horas_inasistencia'] ?? null,
        ]);
    });
}
```

### 17.4 Calcular Días Hábiles (Sin Festivos ni Domingos)

```php
// En ReporteExcelService — obtener fechas de sesiones del periodo:
public function obtenerDiasHabiles(Carbon $inicio, Carbon $fin, int $fichaId): array {
    $festivos = DiaFestivo::whereBetween('fecha', [$inicio, $fin])
        ->where('activo', 1)
        ->pluck('fecha')
        ->map(fn($f) => Carbon::parse($f)->format('Y-m-d'))
        ->toArray();

    // Obtener sesiones reales de la ficha en el periodo
    return Sesion::where('ficha_id', $fichaId)
        ->whereBetween('fecha', [$inicio, $fin])
        ->whereNotIn('fecha', $festivos)
        ->where('estado', 'cerrada')
        ->orderBy('fecha')
        ->get(['fecha', 'id', 'instructor_id', 'horas_programadas'])
        ->toArray();
}
```

### 17.5 Git — Commit por Módulo Funcional Probado

```bash
# Flujo obligatorio al terminar cada módulo:
git add .
git commit -m "feat: modulo [nombre] funcional y probado"

# Nomenclatura de commits:
# feat: nueva funcionalidad
# fix: corrección de bug
# chore: configuración, dependencias
# docs: documentación
```

### 17.6 Manejo de Errores en Next.js

```typescript
// En services/api.ts — manejar errores de la API consistentemente:
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? 'Error de conexión con el servidor.';
  }
  return 'Ocurrió un error inesperado.';
};

// En cada componente que llame a la API:
try {
  const data = await fichas.service.obtenerTodas();
  setFichas(data);
} catch (error) {
  Swal.fire('Error', handleApiError(error), 'error');
}
```

---

# PARTE E — PROCESO CON CURSOR

---

## 18. CÓMO TRABAJAR CON CURSOR — METODOLOGÍA

| Herramienta | Cuándo usarla |
|------------|--------------|
| **Ask** | Antes de construir — validar diseño, preguntar si hay problemas, entender algo |
| **Plan** | Antes de cada módulo — que Cursor planifique los archivos y pasos antes de escribir código |
| **Agent** | Para construir — Cursor escribe y ejecuta código. Usar DESPUÉS de Plan |
| **Debug** | Cuando algo no funciona — pegar el error y pedir corrección |

**Ciclo obligatorio por módulo:**
```
① Ask     → Validar el diseño del módulo antes de escribir código
② Plan    → Que Cursor planifique qué archivos creará y qué pasos seguirá
③ Revisar → Leer el plan, corregir si algo no tiene sentido
④ Agent   → Construir el módulo
⑤ Probar  → Ejecutar las pruebas del módulo (ver Sección 20)
⑥ Commit  → git commit con mensaje descriptivo
⑦ Siguiente módulo → Repetir desde ①
```

**Regla de oro:** Nunca pasar al módulo siguiente sin haber probado y commiteado el actual.

---

## 19. MÓDULOS PARA CURSOR EN ORDEN LÓGICO

---

### MÓDULO 0 — SETUP INICIAL

**Prompt para Agent:**
```
Lee contexto.md antes de escribir
cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Setup inicial del proyecto QUORUM.

TECH STACK: Next.js 14 (TypeScript strict) + Tailwind CSS + Laravel 11 (PHP 8.2) + MySQL (XAMPP)

FRONTEND (quorum-frontend/):
1. Crear app con: npx create-next-app@latest quorum-frontend --typescript --tailwind --app
2. Instalar: lucide-react sweetalert2 axios react-google-recaptcha @types/react-google-recaptcha
3. Crear estructura: app/ components/ui/ hooks/ services/ types/
4. En tailwind.config.ts agregar colores SENA:
   - verde: '#3DAE2B', verdeOscuro: '#2E7D22', verdeClaro: '#E8F5E9'
   - sidebar: '#1A1A2E', grisOscuro: '#333333'
5. Crear types/: usuario.ts, ficha.ts, asistencia.ts con todas las interfaces TypeScript del PRD
6. Crear services/api.ts con axios (baseURL: http://localhost:8000, withCredentials: true)
7. Activar "strict": true en tsconfig.json

BACKEND (quorum-backend/):
1. Crear: composer create-project laravel/laravel quorum-backend
2. Instalar: composer require laravel/sanctum phpoffice/phpspreadsheet
3. Configurar .env con las variables exactas de la Sección 14.1 del PRD
4. En config/app.php: timezone = 'America/Bogota'
5. En config/database.php: charset utf8mb4, collation utf8mb4_unicode_ci
6. Configurar CORS (config/cors.php): allowed_origins = ['http://localhost:3000']
7. Crear TODAS las migraciones del MER (Sección 5 del PRD) en orden de dependencias
8. Crear todos los Models con relaciones hasMany, belongsTo, belongsToMany
9. Crear seeders con los usuarios de prueba de la Sección 22 del README del PRD
10. Ejecutar: php artisan migrate --seed

VERIFICAR antes de marcar como terminado:
- npm run dev corre sin errores en localhost:3000
- php artisan serve corre en localhost:8000
- php artisan migrate:status muestra todas las migraciones en "Ran"
- phpMyAdmin muestra las 16 tablas creadas
- La tabla usuarios tiene los 4 usuarios de prueba

AL FINALIZAR: Actualiza contexto.md con:
- Módulos completados: M0
- Rutas y puertos activos confirmados
- Versiones exactas instaladas de cada paquete
- Cualquier decisión técnica que hayas tomado
También actualiza contexto/PRD_proyecto.md si encontraste algún ajuste necesario.
Haz commit: git add . && git commit -m "feat: M0 setup inicial funcional"


**Cómo probar:**
- `cd quorum-frontend && npm run dev` → abre en http://localhost:3000 sin error
- `cd quorum-backend && php artisan serve` → corre en http://localhost:8000
- `php artisan migrate:status` → todas las migraciones ejecutadas
- phpMyAdmin → verificar todas las tablas creadas con estructura correcta
- Verificar seeders: admin + coordinador + instructor + aprendiz en tabla usuarios
```
---

### MÓDULO 1 — AUTENTICACIÓN (Login + reCAPTCHA + Bloqueo)

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Sistema completo de autenticación — Módulo 1.

BACKEND (Laravel):
1. Crear AuthController con métodos: login(), loginAprendiz(), logout()
2. En login():
   - Registrar intento en intentos_login
   - Verificar bloqueo: si hay 5+ intentos fallidos en los últimos 15 min → HTTP 429
   - Validar token reCAPTCHA contra https://www.google.com/recaptcha/api/siteverify
   - Verificar correo existe y activo=1, si no → mensaje genérico de error
   - Verificar contraseña con Hash::check()
   - Si OK → crear Sanctum token + marcar intento exitoso
   - Retornar: { token, usuario: { id, nombre, apellido, rol, totp_configurado } }
3. En loginAprendiz():
   - Sin reCAPTCHA, sin 2FA
   - Verificar correo + documento (campo 'documento' en tabla usuarios)
   - Solo permite usuarios con rol='aprendiz' y activo=1
4. En logout(): revocar el token actual de Sanctum
5. Configurar rutas en routes/api.php:
   POST /api/auth/login
   POST /api/auth/login-aprendiz
   POST /api/auth/logout (middleware auth:sanctum)
6. Middleware sanctum stateful en bootstrap/app.php

FRONTEND (Next.js):
1. Página app/(auth)/login/page.tsx:
   - Campos: correo + contraseña
   - Componente reCAPTCHA v2 (siteKey del PRD Sección 14.1)
   - Panel "Acceso rápido de pruebas" con botones para cada usuario de la Sección 22 del PRD
   - Al enviar: deshabilitar botón inmediatamente (prevenir doble clic)
   - Errores con SweetAlert2, nunca alert() nativo
   - Después de login exitoso: si totp_configurado=false → ir a /2fa/configurar
     Si totp_configurado=true → ir a /2fa/verificar
     Si rol='aprendiz' → ir directo a /mi-historial
2. Guardar token en cookie segura o localStorage (definir y documentar la decisión)
3. Crear hook useAuth.ts con: login(), logout(), usuario actual, isAuthenticated
4. Crear middleware.ts de Next.js que proteja rutas del grupo (dashboard)

REGLAS CRÍTICAS:
- El aprendiz usa correo + cédula (sin contraseña, sin 2FA, sin reCAPTCHA)
- Usuario inactivo → mostrar: "Tu cuenta está desactivada. Comunícate con el administrador."
- Nunca mostrar si el correo existe o no en mensajes de error (seguridad)

VERIFICAR:
- Login con admin funciona y redirige al flujo 2FA
- Login con aprendiz funciona y va directo a /mi-historial
- 5 intentos fallidos bloquean por 15 minutos
- Usuario inactivo no puede entrar
- reCAPTCHA es obligatorio (botón deshabilitado hasta resolver)

AL FINALIZAR: Actualiza contexto.md (M1 completado, decisiones de auth tomadas).
Haz commit: git add . && git commit -m "feat: M1 autenticacion funcional"
```
---

### MÓDULO 2 — RECUPERACIÓN DE CONTRASEÑA

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Recuperación de contraseña por correo — Módulo 2.

BACKEND (Laravel):
1. Agregar a AuthController: solicitarReset(), procesarReset()
2. En solicitarReset():
   - Buscar usuario por correo (no revelar si existe)
   - Si existe: generar token con bin2hex(random_bytes(32))
   - Guardar en tokens_reset: { usuario_id, token, expira_en: now()+1hora }
   - Enviar correo con Laravel Mail (config SMTP del .env de la Sección 14.1)
   - Siempre retornar: { message: "Si el correo existe, recibirás las instrucciones." }
3. En procesarReset():
   - Verificar token: existe + usado=0 + expira_en > now()
   - Si inválido → error claro
   - Validar política de contraseña (Sección 14.2 del PRD)
   - Actualizar usuario: password = bcrypt($nueva), limpiar totp_secret si corresponde
   - Marcar token: usado=1
4. Rutas:
   POST /api/auth/recuperar (público)
   POST /api/auth/reset (público, valida token internamente)

FRONTEND (Next.js):
1. Página app/(auth)/recuperar/page.tsx:
   - Un solo campo: correo
   - Al enviar: mostrar mensaje genérico con SweetAlert2 (no revelar si existe)
   - Deshabilitar botón al enviar
2. Página app/(auth)/reset/page.tsx:
   - Leer token de la URL (?token=XXX)
   - Campos: nueva contraseña + confirmar contraseña
   - Validación en tiempo real de política (8 chars, 1 mayúscula, 1 número, 1 especial)
   - Mostrar requisitos cumplidos con íconos Lucide (CheckCircle / XCircle)
   - SweetAlert2 de éxito → redirigir a /login

VERIFICAR:
- Correo llega al destinatario con el link de reset
- Token expirado da error claro
- Token ya usado da error claro
- Contraseña débil es rechazada con mensaje por requisito incumplido
- Contraseña nueva funciona para hacer login

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M2 recuperacion password funcional"
```

---

### MÓDULO 3 — LAYOUT GLOBAL (Sidebar + Headbar + Accesibilidad)

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Layout global de la aplicación — Módulo 3.

FRONTEND (Next.js):
1. components/ui/Sidebar.tsx:
   - Fondo #1A1A2E, logo SENA placeholder (comentar claramente dónde reemplazar)
   - Menú diferente según rol del usuario (leer de useAuth)
   - Item activo: fondo #2E7D22, texto blanco
   - Iconos Lucide para cada ítem (nunca emojis)
   - En móvil (<768px): oculto por defecto, abre con hamburguesa
   - Clic fuera del sidebar lo cierra en móvil
   - Animación suave de apertura/cierre con Tailwind transition

2. components/ui/Headbar.tsx:
   - Nombre del sistema "QUORUM" a la izquierda
   - A la derecha: Badge de rol + Avatar con iniciales + botón logout
   - Botón accesibilidad (ícono Accessibility de Lucide):
     Panel con: aumentar texto (CSS var --font-scale) + alto contraste

3. components/ui/Avatar.tsx:
   - Círculo con las 2 primeras iniciales del nombre
   - Color de fondo calculado por hash del ID (paleta de 8 colores predefinida)
   - Props: nombre: string, id: number, size: 'sm' | 'md' | 'lg'

4. app/(dashboard)/layout.tsx:
   - Verificar token Sanctum al cargar. Si no existe → redirigir a /login
   - Incluir Sidebar + Headbar
   - Área de contenido con padding correcto

5. Páginas placeholder para verificar navegación:
   - /dashboard, /fichas, /usuarios, /asistencia/tomar, /asistencia/historial
   - Cada una con el título de la sección y "En construcción" por ahora

REGLAS:
- Mobile first: diseñar primero para 375px
- Solo Lucide React para iconos, nunca emojis
- Badge de rol con colores de la Sección 4 del PRD

VERIFICAR:
- En desktop (1024px+): sidebar siempre visible
- En tablet (768px): sidebar colapsable con toggle
- En móvil (375px): menú hamburguesa funciona, clic fuera cierra
- Avatar muestra iniciales correctas con color por hash
- Badge de rol con el color correcto según la Sección 4
- Logout cierra sesión y redirige a /login

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M3 layout global funcional"
```

---

### MÓDULO 4 — DASHBOARD

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Dashboard personalizado por rol — Módulo 4.

BACKEND (Laravel):
1. Crear DashboardController con método index()
2. Respuesta según rol del usuario autenticado (verificar con $request->user()->rol):
   - admin: total usuarios activos, total fichas activas, total aprendices,
             sesiones tomadas hoy, últimas 5 acciones de historial_actividad
   - coordinador: fichas activas por centro, total aprendices en sistema,
                  % promedio de asistencia del mes actual
   - instructor/gestor_grupo: mis fichas asignadas, aprendices con más de
                              20% de inasistencia en mis fichas
3. Ruta: GET /api/dashboard (middleware auth:sanctum)
4. CERO datos hardcodeados — todo viene de consultas Eloquent reales

FRONTEND (Next.js):
1. app/(dashboard)/dashboard/page.tsx
2. Al cargar: llamar a /api/dashboard con el token del usuario
3. Mostrar LoadingSpinner mientras carga
4. Si error de red: SweetAlert2 con mensaje amigable
5. Cards de estadísticas:
   - Cada card: ícono Lucide + número grande + etiqueta descriptiva
   - Color del ícono según tipo de dato
6. Para admin: lista de actividad reciente debajo de los cards
   (fecha + acción + descripción, los últimos 5 registros)
7. Para coordinador: tabla simple de fichas con % asistencia
8. Componentes a crear:
   - components/ui/StatCard.tsx (reutilizable)
   - components/ui/LoadingSpinner.tsx (reutilizable)
   - components/ui/EmptyState.tsx (reutilizable)

VERIFICAR:
- Login como admin → ver estadísticas de admin
- Login como coordinador → ver estadísticas de coordinador
- Login como instructor → ver sus fichas
- Login como aprendiz → redirigir a /mi-historial (sin dashboard)
- Con BD vacía (sin sesiones hoy): mostrar EmptyState, no error

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M4 dashboard funcional"
```

---

### MÓDULO 5 — GESTIÓN DE FICHAS (Admin)

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: CRUD completo de fichas de caracterización — Módulo 5.

BACKEND (Laravel):
1. FichaController: index(), store(), show(), update(), destroy()
2. FichaPolicy: solo admin puede crear/editar/eliminar. Coordinador e instructor solo leen.
3. En store() y update():
   - Validar campos con Form Request
   - Guardar en: fichas_caracterizacion + jornadas_ficha + horarios
   - En horarios: cada fila tiene dia_semana + hora_inicio + hora_fin + instructor_id
   - Verificar que el instructor asignado al horario esté en ficha_instructor
4. Endpoint asignar instructor: POST /api/fichas/{id}/instructores
   - Verificar que solo haya UN es_gestor=1 por ficha
   - Si ya hay gestor y se intenta asignar otro → error descriptivo con el nombre del gestor actual
5. Endpoint importar aprendices: POST /api/fichas/{id}/importar-aprendices
   - Leer Excel con PhpSpreadsheet (columnas: cedula | nombre_completo | correo)
   - Por cada fila: validar campos + verificar correo duplicado
   - Crear usuarios con rol='aprendiz', ficha_id, password=NULL
   - Registrar en importaciones_aprendices
   - Retornar resumen: { exitosos: N, fallidos: N, errores: [...] }
6. Rutas en routes/api.php con middleware auth:sanctum + policy

FRONTEND (Next.js):
1. app/(dashboard)/fichas/page.tsx: tabla de fichas con búsqueda y filtros
2. app/(dashboard)/fichas/nueva/page.tsx: formulario de creación
3. app/(dashboard)/fichas/[id]/page.tsx: detalle con pestañas:
   - Pestaña "Información": datos de la ficha + horario semanal
   - Pestaña "Instructores": lista + asignar/desasignar + toggle gestor
   - Pestaña "Aprendices": lista + botón importar Excel
4. Formulario de ficha:
   - Selectores de centros y programas (desde BD vía API)
   - Configuración de jornadas (agregar/quitar: mañana/tarde/noche)
   - Por jornada: días de la semana, hora inicio, hora fin, instructor asignado
5. Modal de importación: selector de archivo .xlsx + barra de progreso + resumen de resultado
6. Confirmación SweetAlert2 antes de desactivar una ficha
7. Componente DataTable.tsx reutilizable con paginación y scroll horizontal

TERMINOLOGÍA OBLIGATORIA: "Ficha de Caracterización", "Ambiente de Formación",
"Instructores", "Aprendices", "Formación"

VERIFICAR:
- Crear ficha con horarios y 2 instructores (uno gestor) → guardar en BD correctamente
- Intentar asignar segundo gestor → error descriptivo con el nombre del actual
- Importar Excel con 5 aprendices → 5 usuarios creados con rol='aprendiz'
- Importar Excel con correo duplicado → ese aprendiz aparece como fallido
- Desactivar ficha → activo=0 en BD, no se elimina

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M5 gestion fichas funcional"
```

---

### MÓDULO 6 — GESTIÓN DE USUARIOS (Admin)

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: CRUD de usuarios — Módulo 6.

BACKEND (Laravel):
1. UsuarioController: index(), store(), update(), destroy()
2. Filtros en index(): por rol, búsqueda por nombre/apellido/documento/correo
3. En store():
   - Validar con Form Request: nombre, apellido, documento, correo, rol
   - Verificar que el correo no esté duplicado (activos e inactivos)
   - Hash bcrypt de la contraseña
   - Generar totp_secret automáticamente (se configurará en el primer login)
4. En destroy():
   - Soft delete: activo=0. NO eliminar físicamente.
   - Si ya está inactivo y se llama destroy() de nuevo → eliminar permanentemente
     (solo con SweetAlert2 de confirmación doble)
   - Admin no puede desactivarse a sí mismo:
     if ($request->user()->id === $id) → error: "No puedes desactivar tu propia cuenta."
5. UsuarioPolicy: solo admin puede CRUD

FRONTEND (Next.js):
1. app/(dashboard)/usuarios/page.tsx:
   - Tabla: nombre completo, rol (badge coloreado), documento, correo, estado, acciones
   - Filtro por rol (select) + búsqueda en tiempo real por nombre/correo
   - Botón "Nuevo usuario" → modal de creación
   - Botón "Editar" → modal de edición
   - Botón "Desactivar" → SweetAlert2 confirm → soft delete
   - Si usuario ya inactivo: botón "Eliminar permanentemente" con doble confirmación
2. Modal de usuario: Nombre, Apellido, Documento, Correo, Rol (select), Contraseña (solo en creación)
3. Validación en tiempo real de política de contraseñas (indicadores visuales con Lucide)
4. Badge.tsx reutilizable con el color de rol de la Sección 4 del PRD

VERIFICAR:
- Crear usuario de cada rol → aparece en la tabla con el badge correcto
- Correo duplicado → error visible por campo
- Desactivar usuario → activo=0, no aparece en login
- Admin no puede desactivarse a sí mismo → error descriptivo
- Buscar por nombre parcial → filtra en tiempo real

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M6 gestion usuarios funcional"
```

---

### MÓDULO 7 — TOMAR ASISTENCIA (Instructor / Gestor)

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Vista de toma de asistencia — Módulo 7. Esta es la funcionalidad más importante.

BACKEND (Laravel):
1. AsistenciaController@iniciarSesion(fichaId, fecha):
   - Verificar que el usuario autenticado es instructor/gestor_grupo
   - Verificar que hoy ($fecha) corresponde al dia_semana del horario asignado al instructor en esa ficha
     (comparar DAYOFWEEK(fecha) con horarios.dia_semana)
   - Verificar que $fecha no es domingo (DAYOFWEEK = 1)
   - Verificar que $fecha no está en dias_festivos → si sí, retornar nombre del festivo
   - Verificar que no existe ya una sesión cerrada para horario_id + fecha
   - Si todo OK: crear sesión con estado='abierta'
   - Retornar sesión + lista de aprendices de la ficha (id, nombre, apellido, documento)

2. AsistenciaController@guardar(sesionId, registros[]):
   - Verificar que el instructor es el dueño de esa sesión
   - Verificar que todos los aprendices de la ficha están en el array registros
   - Si falta alguno: retornar error con el nombre del aprendiz faltante
   - Si tipo='parcial': verificar que horas_inasistencia esté entre 1 y (horas_programadas-1)
   - DB::transaction(): insertar todos los registros_asistencia + actualizar sesión.estado='cerrada'

3. AsistenciaController@actualizar(registroId, datos):
   - Verificar que la sesión le pertenece al instructor autenticado
   - Dentro de DB::transaction():
     1. Insertar en registros_asistencia_backup (tipo_anterior, tipo_nuevo, modificado_por)
     2. Actualizar registros_asistencia

FRONTEND (Next.js):
1. app/(dashboard)/asistencia/tomar/page.tsx
2. Al cargar: llamar a iniciarSesion para la ficha y fecha de hoy
3. Si hay error (festivo, día incorrecto, ya tomada): SweetAlert2 descriptivo
4. Lista de aprendices: Avatar + nombre + cédula + 4 radio buttons
5. Radio buttons: Presente | Falla | Inasistencia Parcial | Excusa
6. Si selecciona "Inasistencia Parcial": select con opciones 1 a (horas_programadas-1)
7. ProgressBar.tsx: "X de N marcados" — actualiza en tiempo real con cada clic
8. Botón [Marcar todos presentes]: aplica 'presente' a todos los sin marcar
9. Botón [Guardar asistencia]:
   - Verificar todos marcados en frontend primero
   - Si falta: SweetAlert2 con el nombre del aprendiz
   - Si OK: deshabilitar botón → POST → SweetAlert2 éxito → ir a historial
10. Componentes a crear: FilaAprendiz.tsx, ProgressBar.tsx

VERIFICAR:
- Tomar asistencia un día que no corresponde al instructor → error descriptivo
- Tomar asistencia en festivo → muestra el nombre del festivo
- Marcar todos presentes → todos los radio en "presente"
- Guardar con uno sin marcar → alerta con el nombre faltante
- Doble clic en guardar → solo un registro en BD (botón deshabilitado)
- Guardar completo → sesión cerrada en BD + todos los registros creados

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M7 tomar asistencia funcional"
```

---

### MÓDULO 8 — HISTORIAL DE ASISTENCIA

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Historial y matriz de asistencia — Módulo 8.

BACKEND (Laravel):
1. AsistenciaController@historial(fichaId):
   - Verificar permisos: admin/coordinador ven cualquier ficha;
     instructor solo ve sus fichas asignadas
   - Retornar: sesiones ordenadas por fecha + por cada sesión: todos los registros de asistencia
   - Incluir: nombre del instructor que tomó cada sesión
2. Filtros opcionales via query params: ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&tipo=falla

FRONTEND (Next.js):
1. app/(dashboard)/asistencia/historial/page.tsx
2. Selector de ficha (para admin/coordinador) o ficha automática (para instructor)
3. MatrizAsistencia.tsx — componente central:
   - Filas: aprendices (nombre + documento)
   - Columnas: fechas de sesiones
   - Encabezado de columna: fecha + nombre corto del instructor (tooltip con nombre completo)
   - Celda según tipo:
     Presente → verde vacío | Falla → rojo "X" | Excusa → amarillo "E" | Parcial → azul con número de horas
   - Scroll horizontal obligatorio en mobile
   - Ancho mínimo por columna: 44px
4. Botón "Editar registro" en celdas donde instructor_id === usuario actual:
   - Modal de edición: select de tipo + input de horas si parcial + campo de razón
   - SweetAlert2 de confirmación antes de guardar
   - Al guardar: PATCH /api/asistencia/{id} → actualiza registro + crea backup
5. Paginación por mes: botones "Mes anterior / Mes siguiente"
6. Filtros: tipo de asistencia (multiselect) + rango de fechas

VERIFICAR:
- Instructor solo ve sus fichas
- Coordinador puede seleccionar cualquier ficha
- Celdas con el color y símbolo correcto según tipo
- Editar un registro → aparece en registros_asistencia_backup
- No puede editar registros de sesiones de otros instructores (botón oculto + validación en backend)
- Scroll horizontal en móvil funciona

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M8 historial asistencia funcional"
```

---

### MÓDULO 9 — MÓDULO APRENDIZ

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Vista "Mi Historial" para el aprendiz — Módulo 9.

BACKEND (Laravel):
1. AprendizController@miHistorial():
   - CRÍTICO: verificar que $request->user()->rol === 'aprendiz'
   - CRÍTICO: NUNCA retornar datos de otro aprendiz. Filtrar siempre por aprendiz_id = $request->user()->id
   - Si alguien intenta manipular la URL para ver otro aprendiz → HTTP 403
   - Retornar: lista de registros con fecha, ficha, instructor, tipo, horas_inasistencia
   - Calcular y retornar totales:
     total_horas_programadas (suma de horas_programadas de todas sus sesiones)
     total_horas_inasistencia (según fórmula de la Sección 8, regla 9)
     porcentaje_asistencia = ((total - inasistencia) / total) * 100
2. Ruta: GET /api/mi-historial (middleware auth:sanctum)

FRONTEND (Next.js):
1. app/(dashboard)/mi-historial/page.tsx
2. Tarjeta de resumen destacada:
   - Total horas inasistencia (número grande, color rojo si > 20%)
   - Porcentaje de asistencia (grande, verde si >=80%, rojo si <80%)
   - Total sesiones registradas
3. Lista cronológica (más recientes primero):
   - Por cada sesión: fecha, nombre de la ficha, instructor, badge de tipo, horas
4. TODO es solo lectura — sin ningún botón de edición
5. Si no hay registros → EmptyState con mensaje amigable

REGLAS CRÍTICAS:
- Este rol NO tiene sidebar completo: solo muestra "Mi Historial" y "Mi Perfil"
- El aprendiz NO puede navegar a ninguna otra sección
- Cualquier intento de acceder a /fichas, /usuarios, etc. → redirigir a /mi-historial

VERIFICAR:
- Login como aprendiz → solo ve sus propios datos
- Manipular URL con otro aprendiz_id → HTTP 403 (verificar en backend con Postman o curl)
- Cálculo de porcentaje de asistencia correcto
- Sin botones de edición visibles
- Rutas de admin/instructor no accesibles

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M9 vista aprendiz funcional"
```

---

### MÓDULO 10 — MÓDULO COORDINADOR

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Panel del coordinador académico — Módulo 10.

BACKEND (Laravel):
1. CoordinadorController:
   - fichas(centroId?): listar fichas con filtros opcionales
   - historialFicha(fichaId): retornar MatrizAsistencia completa (reusar lógica de M8)
   - historialAprendiz(aprendizId): historial individual (verificar que coordinador no ve aprendices de otros centros)
   - estadisticas(centroId?): % asistencia por ficha, fichas con mayor ausentismo
2. Todos los endpoints con middleware auth:sanctum y verificar rol='coordinador' o 'admin'

FRONTEND (Next.js):
1. app/(dashboard)/coordinador/page.tsx con 3 pestañas:

   Pestaña 1 "Por Ficha":
   - Filtros en cascada: selector de centro → selector de ficha → selector de jornada
   - Botón "Ver asistencia" → muestra MatrizAsistencia.tsx (reutilizar componente de M8)
   - Botón "Descargar Excel" (de este módulo, conectar con M11 cuando esté listo)

   Pestaña 2 "Por Aprendiz":
   - Campo de búsqueda de aprendiz (por nombre o cédula)
   - Al seleccionar: mostrar historial individual con los mismos cards de porcentaje de M9

   Pestaña 3 "Estadísticas por Centro":
   - Tabla: ficha | total aprendices | % asistencia promedio | sesiones tomadas
   - Ordenable por % asistencia (peor primero)
   - Highlight en rojo las fichas con % < 80%

VERIFICAR:
- Coordinador puede ver cualquier ficha del sistema
- Coordinador NO puede editar nada (solo lectura)
- Filtros en cascada funcionan: seleccionar centro filtra fichas disponibles
- Estadísticas calculadas correctamente desde BD real

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M10 vista coordinador funcional"
```

---

### MÓDULO 11 — GENERACIÓN DEL REPORTE EXCEL CPIC

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.
Lee especialmente la Sección 21 del PRD (lógica exacta de coordenadas del Excel).

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Generación del reporte oficial Excel CPIC — Módulo 11.

BACKEND (Laravel):
1. ReporteController@descargarExcel(fichaId, desde, hasta)
2. ReporteExcelService con toda la lógica:
   a. Cargar plantilla: IOFactory::load(storage_path('plantilla_asistencia.xlsx'))
      NUNCA sobreescribir la plantilla original — trabajar en memoria
   b. Obtener datos:
      - Programa + instructores (gestor primero, luego los demás separados por comas)
      - Número de ficha + centro
      - Fechas de sesiones cerradas del periodo (sin festivos, sin domingos)
      - Lista de aprendices de la ficha
      - Registros de asistencia por sesión
   c. Inyectar datos estáticos (ver Sección 21):
      A4=Programa, A5=Instructores, A6=Ficha, D6=Centro, F8=Periodo
   d. Inyectar fechas en fila 9 desde columna F (Coordinate::stringFromColumnIndex)
   e. Si hay más de 1 aprendiz: insertNewRowBefore para no romper el pie de página
   f. Por cada aprendiz desde fila 10: nombre en A, documento en D
      Por cada fecha: inyectar horas de inasistencia (falla=horas_programadas,
      parcial=horas_inasistencia, excusa/presente=celda vacía)
   g. Columna total: suma de todas las horas de inasistencia del aprendiz
   h. Footer: instructor de cada sesión en texto vertical (setTextRotation(90))
   i. Guardar en storage/temp/ → enviar como descarga → borrar archivo temporal
3. Ruta: GET /api/reportes/excel/{fichaId}?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
   Roles permitidos: admin, coordinador, instructor, gestor_grupo

FRONTEND (Next.js):
1. Componente BtnDescargarExcel.tsx reutilizable:
   - Estado de carga mientras descarga (deshabilitar botón, spinner)
   - Al hacer clic: abrir modal de selección de rango de fechas
   - Llamar al endpoint y descargar el blob como archivo
2. Integrar el botón en: historial de asistencia (M8) y vista coordinador (M10)

VERIFICAR:
- El archivo descargado tiene el nombre: reporte_NUMEROFICHA_YYYY-MM.xlsx
- La plantilla original en storage/ NO fue modificada
- Celdas de "presente" y "excusa" están vacías (no ceros)
- Celdas de "falla" tienen las horas_programadas de esa sesión
- Celdas de "parcial" tienen el número de horas_inasistencia del registro
- Los nombres de instructores están rotados 90° en el footer
- El gestor de grupo aparece primero en la fila de instructores

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M11 reporte excel funcional"
```

---

### MÓDULO 12 — CONFIGURACIÓN Y FESTIVOS (Admin)

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Configuración del sistema y gestión de días festivos — Módulo 12.

BACKEND (Laravel):
1. ConfiguracionController:
   - index(): retornar todos los registros de la tabla configuracion
   - update(clave, valor): actualizar un valor. Solo admin.
2. DiaFestivoController: CRUD completo. Solo admin.
   - En store(): verificar que la fecha no exista ya (UNIQUE en BD)
   - Soft delete (activo=0) en destroy()

FRONTEND (Next.js):
1. app/(dashboard)/configuracion/page.tsx (solo accesible para admin):
   Sección 1 "Datos del sistema":
   - Nombre del sistema, nombre de la institución
   - Guardar con PATCH /api/configuracion
   Sección 2 "Parámetros de seguridad":
   - Timeout de sesión (minutos), máximo de intentos de login
   - Guardar individualmente cada parámetro
   Sección 3 "Días festivos":
   - Lista de festivos del año actual con fecha + descripción + botón desactivar
   - Formulario para agregar nuevo: date picker + campo descripción
   - SweetAlert2 antes de desactivar
   Sección 4 "Historial de actividad":
   - Tabla con las últimas 20 acciones: usuario + acción + descripción + fecha/hora
2. Registrar en historial_actividad cada acción importante del sistema
   (crear ficha, tomar asistencia, importar aprendices, etc.)
   Crear helper LogActivity::registrar($accion, $descripcion) reutilizable en todos los controllers

VERIFICAR:
- Cambiar nombre del sistema → se refleja en el headbar sin recargar la página
- Agregar festivo del 20 de julio → al intentar tomar asistencia ese día aparece el nombre del festivo
- Fecha festiva duplicada → error claro por campo
- Historial de actividad muestra acciones reales de los módulos anteriores

AL FINALIZAR: Actualiza contexto.md.
Haz commit: git add . && git commit -m "feat: M12 configuracion festivos funcional"
```

---

### MÓDULO 13 — PERFIL DE USUARIO

**Prompt:**
```
Lee contexto.md antes de escribir cualquier código.

Actúa como un desarrollador Senior guiando a un estudiante.
Comentarios del código en español, nivel básico.

TAREA: Vista de perfil de usuario — Módulo 13 (último módulo).

FRONTEND (Next.js):
1. app/(dashboard)/perfil/page.tsx (accesible para todos los roles):
   - Avatar grande (iniciales, mismo componente de M3)
   - Datos en solo lectura: Nombre completo, Documento, Correo, Rol (badge), Estado, Miembro desde
   - Mensaje fijo: "Para modificar tu información, comunícate con el administrador:
     gestradac@sena.edu.co"
   - Sección "Cambiar contraseña":
     - Campos: contraseña actual + nueva + confirmar nueva
     - Validación en tiempo real de política de contraseñas
     - PATCH /api/perfil/contrasena (verificar contraseña actual antes de cambiar)
     - SweetAlert2 de éxito
   - Sección "Preferencias de accesibilidad":
     - Guardar preferencias en localStorage (tamaño de texto, alto contraste)
     - Aplicar al cargar la página

BACKEND (Laravel):
1. PerfilController@cambiarContrasena():
   - Verificar contraseña actual con Hash::check()
   - Validar política de nueva contraseña (igual que M2)
   - Actualizar con bcrypt
   - No puede cambiar a la misma contraseña que ya tiene

VERIFICAR:
- Todos los roles pueden ver su propio perfil
- Cambiar contraseña con contraseña actual incorrecta → error descriptivo
- Nueva contraseña débil → error por requisito incumplido
- Preferencias de accesibilidad persisten al recargar la página

--- VERIFICACIÓN FINAL DEL SISTEMA COMPLETO ---
Después de este módulo, hacer el recorrido completo de la Sección 20 del PRD
(Flujo rápido de prueba del README) verificando los 21 criterios de evaluación.

AL FINALIZAR: Actualiza contexto.md marcando el proyecto como COMPLETO.
Lista todos los módulos completados, decisiones tomadas y cualquier nota para el despliegue.
Haz commit: git add . && git commit -m "feat: M13 perfil usuario - QUORUM v1.0 completo"
```

---

## 20. CÓMO PROBAR CADA MÓDULO

### Lista de verificación universal

**Funcionalidad básica:**
- [ ] El módulo carga sin errores (consola del navegador + logs de Laravel)
- [ ] Los datos se guardan correctamente en la BD (verificar en phpMyAdmin)
- [ ] Los datos se muestran correctamente desde la BD
- [ ] Los botones hacen lo que dicen

**Validaciones:**
- [ ] Formulario vacío → errores claros por campo, nunca error 500
- [ ] Doble clic en guardar → un solo registro en BD

**Seguridad:**
- [ ] Acceso a la ruta sin sesión → redirige al login
- [ ] Acceso con rol incorrecto → 403
- [ ] Datos de aprendiz: solo ve los suyos

**Interfaz:**
- [ ] Funciona en desktop (1024px+)
- [ ] Funciona en móvil (375px) — tablas con scroll horizontal
- [ ] Las alertas usan SweetAlert2 (no alert() nativo)
- [ ] Sin emojis visibles en la interfaz
- [ ] Avatar con iniciales visible correctamente
- [ ] Lucide Icons para todos los iconos

**Al terminar:**
- [ ] `git add . && git commit -m "feat: modulo [nombre] funcional y probado"`

---

# PARTE F — ENTREGABLES

---

## 21. EXPORTACIONES Y REPORTES

### Lógica de Inyección en la Plantilla CPIC (PhpSpreadsheet)

```php
// REGLA DE ORO: Cargar plantilla con IOFactory::load() — NO generar estilos nuevos
$spreadsheet = IOFactory::load(storage_path('plantilla_asistencia.xlsx'));
$worksheet   = $spreadsheet->getActiveSheet();

// PASO 1: CABECERAS ESTÁTICAS
$worksheet->getCell('A4')->setValue('Programa de Formación: ' . $data['programa']);
$worksheet->getCell('A5')->setValue('Instructor/Tutor: ' . $data['instructores']); // Gestor primero, luego los demás separados por comas
$worksheet->getCell('A6')->setValue('N° de Ficha: ' . $data['ficha']);
$worksheet->getCell('D6')->setValue('Centro de Formación: CPIC');
$worksheet->getCell('F8')->setValue('Periodo: ' . $data['fecha_inicio'] . ' a ' . $data['fecha_fin']);

// PASO 2: INYECTAR FECHAS EN FILA 9
// Las fechas de días hábiles empiezan en la columna F (índice 6)
$colInicio = 6; // Columna F
foreach ($data['fechas'] as $i => $fecha) {
    $colLetra = Coordinate::stringFromColumnIndex($colInicio + $i);
    $worksheet->getCell($colLetra . '9')->setValue($fecha); // Formato DD/MM
}

// Calcular índices de columnas finales (dinámico según cantidad de días)
$numFechas        = count($data['fechas']);
$colCausal        = $colInicio + $numFechas;       // Causal de Deserción
$colObservaciones = $colCausal + 1;                // Observaciones
$colTotal         = $colObservaciones + 1;         // Total horas inasistencia

// PASO 3: INYECTAR APRENDICES (desde fila 10)
$filaBase = 10;
if (count($data['estudiantes']) > 1) {
    // Insertar filas para no romper el pie de página
    $worksheet->insertNewRowBefore(11, count($data['estudiantes']) - 1);
}

foreach ($data['estudiantes'] as $idx => $aprendiz) {
    $fila = $filaBase + $idx;
    $worksheet->getCell('A' . $fila)->setValue($aprendiz['nombre']);
    $worksheet->getCell('D' . $fila)->setValue($aprendiz['documento']);

    // Inyectar horas de inasistencia por fecha
    foreach ($aprendiz['inasistencias'] as $i => $horas) {
        // Regla: solo inyectar si hay horas > 0 (falla o parcial)
        // excusa y presente → celda vacía
        if ($horas > 0) {
            $colLetra = Coordinate::stringFromColumnIndex($colInicio + $i);
            $worksheet->getCell($colLetra . $fila)->setValue($horas);
        }
    }

    // Columnas finales del aprendiz
    $worksheet->getCell(Coordinate::stringFromColumnIndex($colCausal) . $fila)
              ->setValue($aprendiz['causal'] ?? '');
    $worksheet->getCell(Coordinate::stringFromColumnIndex($colObservaciones) . $fila)
              ->setValue($aprendiz['observaciones'] ?? '');
    $worksheet->getCell(Coordinate::stringFromColumnIndex($colTotal) . $fila)
              ->setValue($aprendiz['total_horas_inasistencia']);
}

// PASO 4: FOOTER — Instructores diarios (texto vertical)
// Calcular fila del footer (fila del último aprendiz + 2)
$filaFooter = $filaBase + count($data['estudiantes']) + 1;
foreach ($data['instructores_diarios'] as $i => $nombreInstructor) {
    $colLetra = Coordinate::stringFromColumnIndex($colInicio + $i);
    $celda    = $colLetra . $filaFooter;
    $worksheet->getCell($celda)->setValue($nombreInstructor);
    // Rotar texto 90° (REQUISITO VISUAL ESTRICTO)
    $worksheet->getStyle($celda)->getAlignment()->setTextRotation(90);
}

// PASO 5: GUARDAR — NUNCA sobreescribir la plantilla original
$writer   = new Xlsx($spreadsheet);
$fileName = 'reporte_' . $data['ficha'] . '_' . now()->format('Y-m') . '.xlsx';
$writer->save(storage_path('temp/' . $fileName));
// Descargar y luego borrar el archivo temporal
```

### Lógica de Cálculo de Horas de Inasistencia por Aprendiz por Fecha

```php
// Para cada aprendiz, por cada fecha de sesión:
$horasInasistencia = match($registro->tipo) {
    'falla'   => $sesion->horas_programadas,     // Faltó todas las horas
    'parcial' => $registro->horas_inasistencia,  // Faltó N horas
    'excusa'  => 0,                               // Excusa → celda vacía en Excel
    'presente'=> 0,                               // Asistió → celda vacía
};
// Total del aprendiz = suma de todos los $horasInasistencia > 0
```

### Columnas del Excel CPIC

| Columna | Nombre | Fuente de datos |
|---------|--------|----------------|
| A | Nombre del Aprendiz | `usuarios.nombre + apellido` |
| B | (Vacío - merge) | Merge de A |
| C | (Vacío - merge) | Merge de A |
| D | Documento (cédula) | `usuarios.documento` |
| E | (Vacío - según plantilla) | - |
| F en adelante | Horas de inasistencia por cada día hábil | Calculadas según lógica anterior |
| Penúltima-3 | Causal de Deserción | Campo opcional |
| Penúltima-2 | Observaciones | Campo opcional |
| Penúltima | Total horas de inasistencia | Suma automática |

**Nombre del archivo descargado:** `reporte_FICHA_YYYY-MM.xlsx`
(Ejemplo: `reporte_2550000_2026-03.xlsx`)

---

## 22. README.md REQUERIDO

```markdown
# QUORUM — Sistema de Control de Asistencia SENA

## 1. DESCRIPCIÓN DEL PROYECTO
QUORUM es una aplicación web que digitaliza el control de asistencia de aprendices 
en el SENA Centro CPIC. Reemplaza los formatos en papel por un sistema centralizado 
con roles para instructores, coordinadores, aprendices y administradores.

## 2. REQUISITOS PREVIOS
- XAMPP 8.x o superior (Apache + MySQL)
- PHP 8.2 o superior
- Node.js 18+ y npm
- Composer 2.x
- Git

## 3. INSTALACIÓN

### Backend (Laravel)
1. Ir a: `C:/xampp/htdocs/quorum/quorum-backend/`
2. Copiar `.env.example` a `.env` y configurar variables (ver Sección 3.1)
3. `composer install`
4. `php artisan key:generate`
5. Iniciar MySQL en XAMPP
6. Crear BD: `quorum` en phpMyAdmin
7. `php artisan migrate --seed`
8. Copiar `plantilla_asistencia.xlsx` a `storage/`
9. `php artisan serve` → corre en http://localhost:8000

### Frontend (Next.js)
1. Ir a: `C:/xampp/htdocs/quorum/quorum-frontend/`
2. `npm install`
3. Copiar `.env.local.example` a `.env.local` y configurar
4. `npm run dev` → corre en http://localhost:3000

### 3.1 Variables de entorno del Backend (.env)
- DB_DATABASE=quorum
- DB_USERNAME=root
- DB_PASSWORD= (vacío en XAMPP por defecto)
- Las claves de reCAPTCHA y SMTP ya están configuradas (ver PRD Sección 14.1)

## 4. USUARIOS DE PRUEBA (Acceso rápido disponible en el login)
| Correo | Contraseña | Rol |
|--------|-----------|-----|
| gestradac@sena.edu.co | Admin123! | Admin |
| sbecerra@sena.edu.co | Admin123! | Coordinador |
| clopez@sena.edu.co | Admin123! | Instructor |
| andres@aprendiz.sena.edu.co + cédula: 33333333 | (sin contraseña) | Aprendiz |

## 5. FLUJO RÁPIDO DE PRUEBA
1. Abrir http://localhost:3000 → login con admin
2. Completar reCAPTCHA → configurar 2FA con Google Authenticator
3. Ir al Dashboard → verificar estadísticas
4. Crear una ficha → asignar instructores → configurar horario
5. Importar aprendices desde Excel (archivo de prueba incluido en `/docs`)
6. Cerrar sesión → login como instructor → ir a "Tomar Asistencia"
7. Marcar asistencia de todos los aprendices → guardar
8. Descargar reporte Excel → verificar que el archivo tiene los datos
9. Login como aprendiz → verificar "Mi Historial"
10. Login como coordinador → filtrar fichas → ver matrices de asistencia
```

---

## 23. LO QUE NO ESTÁ EN SCOPE

> Definir explícitamente qué NO se construirá evita confusión con Cursor.

- **Sin calificaciones:** El software está estrictamente restringido a asistencia. No existen campos para notas o evaluaciones.
- **Sin integración con SofiaPlus:** El sistema es independiente. No se conecta en tiempo real ni modifica sistemas nacionales.
- **Sin alertas automáticas al coordinador:** El coordinador no recibe alertas cuando un aprendiz supera X horas. Solo consulta manualmente.
- **Sin emojis:** Usar exclusivamente Lucide React icons en toda la interfaz.
- **Sin alert() nativo:** Solo SweetAlert2 para todas las alertas visibles al usuario.
- **Sin calificaciones, planes de mejoramiento ni integración con SofiaPlus** en tiempo real.
- **Sin módulo de horarios complejos:** No se generan calendarios automáticos. El admin configura manualmente el horario semanal por ficha.
- **Sin app móvil nativa:** Es una aplicación web responsive — funciona en el navegador del celular.
- **Sin eliminar físicamente datos de negocio:** Solo soft delete. El historial se preserva siempre.
- **Sin generación de alertas predictivas complejas:** Solo consulta de datos actuales.
- El `aprendiz` NO puede descargar el Excel CPIC.
- Los errores técnicos de PHP/Laravel NUNCA son visibles al usuario final.

---

## 24. CRITERIOS DE EVALUACIÓN

> El sistema debe cumplir los **21 criterios de evaluación** del SENA. Verificar uno por uno antes de la entrega.

| # | Criterio | Cómo se cumple en QUORUM |
|---|----------|--------------------------|
| 1 | La interfaz cumple con los requerimientos funcionales | Todos los módulos (asistencia, fichas, usuarios, reportes) implementados y funcionales sin datos hardcodeados |
| 2 | Diseño claro, intuitivo y consistente | Tailwind + identidad SENA + terminología institucional + colores diferenciadores por rol y tipo de asistencia |
| 3 | Navegación correcta entre pantallas | Sidebar con rutas por rol, redirects post-acción, SweetAlert2 de confirmación |
| 4 | Validaciones visibles en formularios | Validación en frontend (TypeScript) Y backend (Laravel Form Requests), mensajes por campo |
| 5 | Consumo correcto de servicios del backend | Toda la data viene de la API REST de Laravel — nada es estático |
| 6 | Diseño responsive | Mobile first: 375px → 768px → 1024px+, tablas con scroll horizontal, menú hamburguesa |
| 7 | Código frontend organizado y reutilizable | Estructura: app/, components/ui/, hooks/, services/, types/ con componentes reutilizables |
| 8 | Implementa correctamente la lógica del negocio | Reglas de asistencia, días hábiles, roles, permisos, tabla espejo, cálculo de horas |
| 9 | APIs funcionales (CRUD) | CRUD completo para usuarios, fichas, aprendices, asistencia, programas, centros |
| 10 | Manejo adecuado de errores y excepciones | try/catch en toda operación, mensajes amigables en español, logs en Laravel |
| 11 | Autenticación y autorización básica | Laravel Sanctum + 2FA TOTP + reCAPTCHA + Policies por rol + bloqueo de intentos |
| 12 | Integración correcta con la base de datos | Eloquent ORM + migraciones + seeders + transacciones en operaciones multi-tabla |
| 13 | Arquitectura organizada (capas / MVC) | Next.js (frontend separado) + Laravel (MVC: Controllers/Models/Services) + API REST |
| 14 | Código documentado y versionado | Comentarios en español nivel básico + Git con commit por módulo |
| 15 | Modelo de datos acorde a los requerimientos | 16 tablas normalizadas cubriendo todos los roles, relaciones y casos de uso |
| 16 | Tablas normalizadas | 3FN: centros, programas, jornadas, horarios separados. Sin datos redundantes |
| 17 | Uso correcto de claves primarias y foráneas | Todas las FK declaradas explícitamente con índices + UNIQUE constraints |
| 18 | Restricciones de integridad | CHECK constraints, UNIQUE keys, trigger para gestor único por ficha, soft delete |
| 19 | Scripts DDL y DML disponibles | `quorum-backend/database/quorum.sql` completo con tablas + datos de prueba |
| 20 | Gestión básica de usuarios y permisos | CRUD de usuarios por admin, 5 roles diferenciados, Policies de Laravel |
| 21 | Integración correcta con el backend | Next.js ↔ Laravel API REST vía axios, Sanctum stateful para SPA |

---

# INSTRUCCIÓN FINAL PARA CURSOR

> Pegar esto al inicio de CADA sesión con Cursor como recordatorio de las reglas que nunca se pueden romper:

```
Actúa como un desarrollador Senior que guía a un estudiante de programación en el
desarrollo del sistema QUORUM (Control de Asistencia SENA) con Next.js 14 (TypeScript) 
+ Tailwind CSS + Laravel 11 (PHP 8.2) + MySQL.

Los comentarios del código van en español, nivel básico.

REGLAS QUE NUNCA PUEDES ROMPER:
1. Eloquent/Query Builder en el 100% de queries — nunca SQL crudo concatenado
2. Validar SIEMPRE en el frontend (TypeScript) Y en el backend (Laravel Form Request)
3. TypeScript strict: nunca usar 'any' — tipar todos los datos correctamente
4. Nunca mostrar errores técnicos al usuario — solo mensajes amigables en español
5. Verificar token de Sanctum y rol al inicio de cada ruta protegida
6. SweetAlert2 para todas las alertas — nunca alert(), confirm(), prompt() nativos
7. Lucide React para toda la iconografía — nunca emojis en la interfaz
8. Soft delete: UPDATE activo=0, nunca DELETE en datos de negocio
9. utf8mb4 en BD, timezone America/Bogota
10. try/catch en toda operación que pueda fallar (BD, correo, APIs externas)
11. Deshabilitar botón de envío al primer clic para prevenir doble envío
12. Transacciones en operaciones que toquen más de una tabla (guardar asistencia completa)
13. Al modificar un registro de asistencia: primero insertar en registros_asistencia_backup
14. Un aprendiz jamás puede ver datos de otro aprendiz — verificar en el backend
15. Un instructor solo puede tomar/modificar asistencia de sus días asignados

TERMINOLOGÍA OBLIGATORIA EN LA INTERFAZ:
- "Aprendices" (no "estudiantes")
- "Instructores" (no "profesores")
- "Formación" (no "clase")
- "Ambientes de Formación" (no "salones")
- "Ficha de Caracterización" (no "grupo")

Si hay un error en cualquier comando o archivo: analízalo y corrígelo tú mismo
sin preguntar — solo informa qué corregiste al final.

El sistema debe quedar completamente funcional. Sin datos mockeados.
Verifica que todo corra sin errores antes de dar el módulo por terminado.
```

---

*PRD QUORUM v1.0 — Sistema de Control de Asistencia SENA CPIC*
*Elaborado por: José Germán Estrada Clavijo | gestradac@sena.edu.co*
*Basado en: IDEAS QUORUM 12042026 + PRD_MASTER_TEMPLATE v2.0*
*Listo para construcción con Cursor AI*
