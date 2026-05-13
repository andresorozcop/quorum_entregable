ANALISIS Y DESARROLLO DE SOFTWARE

ESPECIFICACIÓN DE REQUERIMIENTOS DEL SOFTWARE

**Andrés Felipe Orozco Piedrahita**

Ficha: 2929061-B

**Instructores:**

Oscar Aristizabal (Instructor y Gestor de ficha)

Carlos Loaiza (Instructor)

Jose Estrada (Instructor)

**Nombre del proyecto:**

Sistema de Información para la Gestión de Asistencia y Automatización de Formatos Académicos
(QUORUM)

SERVICIO NACIONAL DE APRENDIZAJE (SENA)

CENTRO DE PROCESOS INDUSTRIALES Y CONSTRUCCION (CPIC)

ANALISIS Y DESARROLLO DE SOFTWARE (ADSO)

ETAPA PRACTICA

FORMACION PRESENCIAL (JORNADA NOCTURNA)

FECHA DE ENTREGA: 11 DE MAYO DE 2026

**FICHA DEL DOCUMENTO**:

|  |  |  |
| --- | --- | --- |
| FECHA | REVISIÓN(ES) | AUTOR(ES) |
| 12/02/2026 | Versión 1.0 - Creación del Documento y levantamiento inicial | Andrés Felipe Orozco Piedrahita |
| 19/02/2026 | Ajuste de alcance (MVP), inclusión de roles y referencias | Andrés Felipe Orozco Piedrahita |
| 11/05/2026 | Versión 2.0 - Alineación con implementación: stack Next.js/Laravel, roles, sesiones de asistencia, 2FA, módulos operativos | Andrés Felipe Orozco Piedrahita |

**DOCUMENTO VALIDADO POR LAS PARTES EN FECHA:**

|  |  |
| --- | --- |
| POR CLIENTE: SENA | DESARROLLADOR: Andres Felipe Orozco Piedrahita |
| FECHA: **19 DE FEBRERO DE 2026** | FECHA: **19 DE FEBRERO DE 2026** |
| NOMBRE DEL ENCARGADO: Jose German Estrada Clavijo | NOMBRE DEL ENCARGADO: Andres Felipe Orozco Piedrahita |

FICHA DEL DOCUMENTO

CONTENIDO

1. INTRODUCCION
2. DESCRIPCION GENERAL
3. REQUISITOS ESPECIFICOS
4. VALIDACIÓN DE REQUISITOS

---

## 1. INTRODUCCION

### 1.1. Contexto

El control de asistencia en los procesos formativos es un requisito fundamental para garantizar la permanencia y certificación de los aprendices. Actualmente, este proceso se realiza de manera manual o dispersa, lo que conlleva errores en el conteo de horas, pérdida de información física y, sobre todo, un re-proceso tedioso al momento de transcribir estos datos a los formatos institucionales oficiales del SENA. Este proyecto surge de la necesidad de optimizar este flujo, permitiendo que la toma de asistencia alimente automáticamente los informes finales requeridos.

### 1.2. Objetivo general

Desarrollar un sistema de información web llamado **QUORUM** que permita al personal autorizado registrar la asistencia por sesiones de formación, con trazabilidad por ficha y aprendiz, y genere el reporte en **Excel** alineado al formato institucional de control de inasistencias y deserción (enfoque CPIC), listo para revisión y entrega.

### 1.3. Objetivos específicos

- Digitalizar la toma de asistencia mediante una aplicación web responsiva (escritorio y móvil).
- Diferenciar flujos de acceso: personal (correo y contraseña, con endurecimiento de seguridad) y aprendiz (correo y documento).
- Permitir al aprendiz consultar su propio historial de asistencia e inasistencias sin acceso a datos de terceros.
- Ofrecer al coordinador académico (y al administrador) vistas de seguimiento por ficha y por aprendiz, con filtros y estadísticas.
- Exportar a Excel el periodo seleccionado respetando la plantilla oficial.
- Centralizar la administración de fichas, usuarios, centros de formación, configuración y días festivos (rol administrador).

### 1.4. Propósito

La finalidad del software es servir como herramienta de agilidad administrativa: reducir la transcripción manual al cierre de periodo. Lo que se registra en las sesiones de asistencia queda consolidado para consulta y para la generación del archivo oficial.

### 1.5. Alcance (según implementación actual)

El software QUORUM incluye, entre otras, las siguientes capacidades:

- **Autenticación y seguridad:** inicio de sesión para personal; inicio de sesión específico para aprendices; recuperación y restablecimiento de contraseña; verificación **2FA (TOTP)** para el personal cuando el flujo lo exige; protección de rutas en frontend y políticas de autorización en backend (Laravel).
- **Roles:** administrador, coordinador académico, instructor, **gestor de grupo** y aprendiz.
- **Gestión de fichas:** creación y mantenimiento (según rol), asignación de instructores a ficha, alta manual de aprendices e **importación de aprendices desde Excel** (administrador).
- **Catálogos:** centros de formación y programas; administración de centros desde panel (administrador).
- **Asistencia por sesión:** apertura de sesión ligada a ficha y horario; registro por aprendiz con tipos **presente**, **falla**, **excusa** (motivo y evidencia opcional en archivo) y **parcial**; cierre de sesión; **corrección controlada** de registros en sesiones ya cerradas (solo el instructor que cerró la sesión, según reglas del sistema).
- **Historial / matriz:** visualización tipo matriz (fechas × aprendices) para roles autorizados.
- **Panel coordinador:** listado y búsqueda de fichas, historial por ficha y por aprendiz, estadísticas, descarga de Excel cuando la política de acceso a la ficha lo permite.
- **Vista aprendiz:** “Mi historial” y perfil; sin permisos de edición de asistencia.
- **Reportes:** descarga **.xlsx** por ficha y **rango de fechas** (desde / hasta).
- **Configuración:** parámetros generales y **días festivos** (administrador).
- **Auditoría / trazabilidad:** módulos de apoyo para revisión de actividad según diseño del sistema (administrador).

**Fuera de alcance (sin cambio sustancial):** gestión de calificaciones, planes de mejoramiento académico, alertas predictivas complejas e **integración en tiempo real con SofiaPlus** u otros sistemas nacionales.

### 1.6. Personal involucrado

|  |  |
| --- | --- |
| **NOMBRE** | JOSE GERMAN ESTRADA CLAVIJO |
| **ROL** | INSTRUCTOR |
| **PROFESION** | Ingeniero de Sistemas |
| **RESPONSABILIDADES** | Impartir formación, gestión documental y gestión administrativa. |
| **INFORMACION DE CONTACTO** | gestradac@sena.edu.co |
| **APRUEBA** | SI |

|  |  |
| --- | --- |
| **NOMBRE** | SANTIAGO BECERRA HENAO |
| **ROL** | COORDINADOR ACADEMICO |
| **PROFESION** | Ingeniero de Sistemas |
| **RESPONSABILIDADES** | Impartir formación, gestión documental y gestión administrativa. |
| **INFORMACION DE CONTACTO** | sbecerra@sena.edu.co |
| **APRUEBA** | SI |

### 1.7. Definiciones, acrónimos y abreviaturas

- **ADSO:** Análisis y Desarrollo de Software.
- **API:** Interfaz de aplicación; en QUORUM, REST bajo `/api` en el backend Laravel.
- **CPIC:** Centro de Procesos Industriales y Construcción.
- **Ficha:** Código que identifica un grupo de aprendices en el SENA.
- **MVP:** Producto mínimo viable.
- **QUORUM:** Nombre del aplicativo.
- **Sanctum:** Paquete Laravel para autenticación de SPA (cookies de sesión) y tokens API.
- **TOTP:** Contraseña de un solo uso basada en tiempo (autenticación en dos pasos).
- **SPA:** Single Page Application (frontend Next.js).

### 1.8. Referencias

- **Additio App (España/Global):** referente de usabilidad para registro rápido de asistencia y exportación.
- **iDoceo (iOS):** referencia para lógica de estados de asistencia y seguimiento por aprendiz.
- **Phidias:** referencia de comunicación y visualización de seguimiento para familias y estudiantes.
- **Documentación del producto:** repositorio del proyecto (`README.md`, manual HTML en `Quorum-manual_y_presentacion/`, guía `EXPOSICION_QUORUM.md`).

### 1.9. Resumen

**QUORUM** es una aplicación web cuyo frontend está desarrollado en **Next.js 14 (TypeScript)** y cuyo backend es **Laravel 12 (PHP 8.2)** con base de datos **MySQL**. El instructor o el gestor de grupo registran la asistencia por sesiones; el aprendiz consulta su historial; el coordinador y el administrador supervisan fichas y aprendices; el administrador configura catálogos, usuarios y políticas operativas (festivos, etc.). Al finalizar un periodo, se exporta el Excel oficial para el rango de fechas elegido.

---

## 2. DESCRIPCION GENERAL

### 2.1. Perspectiva del producto

QUORUM es una aplicación **web responsiva** pensada para uso en aula y en oficina. La comunicación entre el navegador y el servidor se realiza mediante **API REST** autenticada con **Laravel Sanctum** (sesión por cookies en el entorno SPA). El personal puede estar sujeto a **reCAPTCHA** (según configuración del entorno) y a **2FA TOTP** tras el login.

Interacción por rol (simplificada):

- **Administrador:** dashboard, usuarios, fichas, centros de formación, historial y auditoría de asistencia, vista coordinador, configuración y festivos.
- **Coordinador académico:** dashboard, vista coordinador (fichas, aprendices, estadísticas, matriz), historial de asistencia por ficha; **no** dispone del flujo de “tomar asistencia” en el menú operativo del instructor.
- **Instructor y gestor de grupo:** dashboard, tomar asistencia, historial de las fichas a las que están asignados activamente.
- **Aprendiz:** “Mi historial” y “Mi perfil”; credenciales distintas al personal (documento en lugar de contraseña tradicional).

### 2.2. Funcionalidades del producto

1. **Autenticación multi-rol** con redirección y menú según `rol` en la sesión.
2. **Login aprendiz** independiente del login de personal.
3. **Recuperación y restablecimiento de contraseña** (flujo por correo electrónico cuando el servidor de correo está configurado).
4. **2FA (TOTP)** para personal: configuración y verificación en sesión.
5. **Módulo de asistencia:** sesiones abiertas/cerradas, marcas por aprendiz y tipos de asistencia con soporte de excusa y horas de inasistencia.
6. **Módulo de historial / matriz** por ficha para roles autorizados.
7. **Módulo coordinador / administración académica:** búsqueda, estadísticas y descarga de Excel alineada a permisos sobre la ficha.
8. **Generador de Excel CPIC** con selección de rango de fechas.
9. **Administración:** usuarios, fichas, importación Excel de aprendices, centros, configuración, días festivos, historial de actividad.

### 2.3. Características de los usuarios

- **INSTRUCTOR / GESTOR DE GRUPO:** priorizan velocidad en el aula; necesitan flujo corto para iniciar sesión, marcar y cerrar.
- **APRENDIZ:** uso esporádico desde móvil o escritorio; solo requiere claridad en su propio estado de asistencia.
- **COORDINADOR:** perfil de seguimiento y auditoría visual; consolidación sin intervención en el registro diario del docente.
- **ADMINISTRADOR:** configuración del sistema, carga de datos maestros y soporte operativo sin sustituir la responsabilidad pedagógica del instructor en el registro diario (el menú no incluye “tomar asistencia” como flujo principal del rol).

### 2.4. Restricciones

**A nivel de sistema**

- **Sin integración en tiempo real con SofiaPlus** ni con otras bases nacionales; QUORUM opera con su propia base de datos.
- **Inmutabilidad del diseño del Excel oficial:** la generación del archivo respeta encabezados, logos y disposición definidos en la plantilla CPIC implementada en código (no editable por usuarios finales desde la UI).
- **Ámbito funcional:** no se gestionan notas ni evaluaciones sumativas dentro del sistema.

**Por rol**

- **APRENDIZ:** puede consultar solo su información; no puede modificar asistencia ni ver datos de otros aprendices.
- **INSTRUCTOR / GESTOR DE GRUPO:** solo fichas asignadas; no pueden alterar fichas o usuarios globales salvo lo que las políticas explícitas permitan (la creación/edición masiva de fichas y usuarios corresponde al administrador).
- **COORDINADOR:** acceso de consulta y reportes según políticas; no es el rol operativo de “pasar lista” en el diseño actual de menús y rutas de toma de asistencia.
- **ADMINISTRADOR:** máximos privilegios de configuración; la toma de asistencia en aula sigue siendo responsabilidad del instructor/gestor de grupo en el flujo normal de uso.

---

## 3. REQUISITOS ESPECIFICOS

### 3.1. Requisitos del sistema (implementación)

| Componente | Tecnología / notas |
| --- | --- |
| **Base de datos** | MySQL 8 (entorno de desarrollo habitual: XAMPP). |
| **Backend** | Laravel 12, PHP 8.2, API REST, políticas de autorización, migraciones y seeders. |
| **Autenticación** | Laravel Sanctum (sesión SPA), middleware de verificación TOTP en rutas sensibles. |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS; variables de entorno (`NEXT_PUBLIC_API_URL`, etc.). |
| **Cliente** | Navegador actualizado; Node.js 20+ para desarrollo del frontend. |
| **Correo / seguridad** | Servidor SMTP configurable (`MAIL_*` en `.env`); reCAPTCHA configurable en entornos que lo requieran. |

### 3.2. Requisitos funcionales

| **IDENTIFICACION** | **RF-01** |
| --- | --- |
| **NOMBRE** | Autenticación, roles y refuerzo de seguridad |
| **DESCRIPCION** | El sistema autentica al personal (correo y contraseña, reCAPTCHA si aplica) y al aprendiz (correo y documento). Tras el login, aplica reglas de sesión incluyendo **2FA TOTP** cuando corresponde. Redirige al panel según rol. |
| **PRIORIDAD** | ALTA |

| **IDENTIFICACION** | **RF-02** |
| --- | --- |
| **NOMBRE** | Registro de asistencia por sesión (instructor / gestor) |
| **DESCRIPCION** | Permite iniciar sesión de asistencia para una ficha y horario, registrar por aprendiz los tipos **presente**, **falla**, **excusa** (con motivo y archivo opcional de evidencia) y **parcial**, registrar horas de inasistencia cuando aplica, guardar y **cerrar** la sesión. Permite **corrección** de un registro ya guardado solo bajo las reglas de negocio definidas (p. ej. sesión cerrada y mismo instructor responsable). |
| **PRIORIDAD** | ALTA |

| **IDENTIFICACION** | **RF-03** |
| --- | --- |
| **NOMBRE** | Consulta de historial (aprendiz) |
| **DESCRIPCION** | El aprendiz accede a su resumen y listado de registros de asistencia/inasistencia sin exponer datos de otros. Puede descargar evidencia de excusa cuando las políticas lo permiten. |
| **PRIORIDAD** | ALTA |

| **IDENTIFICACION** | **RF-04** |
| --- | --- |
| **NOMBRE** | Exportación Excel formato CPIC |
| **DESCRIPCION** | Genera archivo **.xlsx** para una ficha y un **rango de fechas** (`desde` / `hasta`), respetando la plantilla oficial. Disponible para roles con permiso de **ver** la ficha (incluye coordinador y administrador según políticas). |
| **PRIORIDAD** | ALTA |

| **IDENTIFICACION** | **RF-05** |
| --- | --- |
| **NOMBRE** | Panel coordinador y seguimiento |
| **DESCRIPCION** | Listado y filtrado de fichas, búsqueda de aprendices, visualización de matriz/historial y estadísticas agregadas para apoyo a coordinación. |
| **PRIORIDAD** | MEDIA |

| **IDENTIFICACION** | **RF-06** |
| --- | --- |
| **NOMBRE** | Gestión de fichas, usuarios y catálogos (administrador) |
| **DESCRIPCION** | CRUD de usuarios, fichas, asignación de instructores, alta manual de aprendices, importación de aprendices desde Excel, administración de centros de formación y catálogos asociados según políticas Laravel. |
| **PRIORIDAD** | ALTA |

| **IDENTIFICACION** | **RF-07** |
| --- | --- |
| **NOMBRE** | Recuperación y restablecimiento de contraseña |
| **DESCRIPCION** | Flujo seguro de solicitud de enlace o token y definición de nueva contraseña para el personal que usa contraseña. |
| **PRIORIDAD** | MEDIA |

| **IDENTIFICACION** | **RF-08** |
| --- | --- |
| **NOMBRE** | Configuración y días festivos |
| **DESCRIPCION** | El administrador mantiene parámetros del sistema y el calendario de días festivos que condicionan la lógica operativa (según reglas implementadas en backend). |
| **PRIORIDAD** | MEDIA |

| **IDENTIFICACION** | **RF-09** |
| --- | --- |
| **NOMBRE** | Dashboard y auditoría |
| **DESCRIPCION** | Indicadores por rol en dashboard; rutas de historial de actividad y auditoría de asistencia para supervisión institucional (administrador). |
| **PRIORIDAD** | MEDIA |

### 3.3. Requisitos no funcionales

| **IDENTIFICACION** | **RNF-01** |
| --- | --- |
| **NOMBRE** | Privacidad y aislamiento de datos |
| **DESCRIPCION** | Un aprendiz no puede acceder a registros de asistencia de otro aprendiz. Las consultas coordinador/administrador respetan autorización en servidor. |
| **PRIORIDAD** | ALTA |

| **IDENTIFICACION** | **RNF-02** |
| --- | --- |
| **NOMBRE** | Usabilidad e interfaz |
| **DESCRIPCION** | Interfaz responsiva; flujo de toma de asistencia acotado a pocas interacciones para el caso de uso diario. |
| **PRIORIDAD** | MEDIA |

| **IDENTIFICACION** | **RNF-03** |
| --- | --- |
| **NOMBRE** | Fidelidad del reporte Excel |
| **DESCRIPCION** | El archivo generado debe conservar encabezados, logos y columnas conforme a la plantilla CPIC versionada en el servicio de reportes. |
| **PRIORIDAD** | ALTA |

| **IDENTIFICACION** | **RNF-04** |
| --- | --- |
| **NOMBRE** | Seguridad de autenticación |
| **DESCRIPCION** | Uso de Sanctum, cookies de sesión, políticas por recurso, contraseñas almacenadas con hash; opción de 2FA para reducir riesgo de acceso indebido al personal. |
| **PRIORIDAD** | ALTA |

---

## 4. VALIDACIÓN DE REQUISITOS

### 4.1. Construcción de prototipos e implementación

La interfaz se implementa directamente en **Next.js** con componentes reutilizables (tablas, matriz de asistencia, modales de exportación, paneles por rol). Las pantallas principales validadas en código incluyen: login y flujos de recuperación/2FA, dashboard, fichas, asistencia (tomar e historial), vista coordinador, mi historial (aprendiz), usuarios, configuración, centros de formación y perfil.

### 4.2. Formato de caso de prueba

| **FORMATO DE CASOS DE PRUEBA** | |
| --- | --- |
| OBJETIVO DEL CASO DE PRUEBA | Verificar que el aprendiz ve únicamente su propio historial. |
| IDENTIFICADOR | CP-01 |
| NOMBRE DEL REQUERIMIENTO | RF-03 |
| PRECONDICIONES | 1. Existe un aprendiz activo con credenciales conocidas. 2. Un instructor registró al menos una **falla** para ese aprendiz en una sesión cerrada. |
| **PASOS** | **RESULTADOS ESPERADOS** |
| 1. Ingresar con el flujo de login de **aprendiz** (correo + documento). | 1. El sistema muestra el panel del aprendiz (Mi historial / Perfil). |
| 2. Abrir **Mi historial**. | 2. Se listan solo los registros del aprendiz autenticado. |
| 3. Localizar la fecha de la sesión de la precondición. | 3. El registro aparece como **falla** (o equivalente en la UI). |

| **FORMATO DE CASOS DE PRUEBA** | |
| --- | --- |
| OBJETIVO DEL CASO DE PRUEBA | Validar que el Excel descargado refleja las inasistencias del periodo en la plantilla CPIC. |
| IDENTIFICADOR | CP-02 |
| NOMBRE DEL REQUERIMIENTO | RF-04 |
| PRECONDICIONES | 1. Ficha con aprendices cargados. 2. Sesión(es) con al menos una **falla** registrada para un aprendiz en una fecha conocida dentro del rango a exportar. |
| **PASOS** | **RESULTADOS ESPERADOS** |
| 1. Ingresar como **instructor** o **gestor de grupo** (o rol con permiso de ver la ficha y exportar). | 1. Se muestra el panel correspondiente al rol. |
| 2. Navegar a la ficha o al historial donde esté disponible **Descargar Excel** / reporte CPIC. | 2. El sistema permite elegir rango **desde** – **hasta** que incluya la fecha de la precondición. |
| 3. Solicitar la descarga y abrir el **.xlsx**. | 3. El archivo descarga sin error; en la fila del aprendiz y columna/día esperado consta la marca de inasistencia según la plantilla. |

| **FORMATO DE CASOS DE PRUEBA** | |
| --- | --- |
| OBJETIVO DEL CASO DE PRUEBA | Validar que el personal con 2FA activo no accede al dashboard sin completar la verificación. |
| IDENTIFICADOR | CP-03 |
| NOMBRE DEL REQUERIMIENTO | RF-01 |
| PRECONDICIONES | Usuario de prueba con TOTP configurado y verificado en base de datos. |
| **PASOS** | **RESULTADOS ESPERADOS** |
| 1. Login exitoso con correo y contraseña. | 1. El sistema exige paso de verificación 2FA antes de exponer datos del dashboard protegido por middleware. |
| 2. Ingresar código TOTP válido. | 2. El usuario accede al dashboard; la sesión queda marcada como apta para rutas protegidas. |

### 4.3. Modelado (diagramas)

Los diagramas de clases, entidad-relación y casos de uso deben **actualizarse** a partir del modelo **Eloquent** y las rutas actuales en `quorum-backend` (migraciones en `database/migrations`, políticas en `app/Policies` y `routes/api.php`). Las ilustraciones generadas automáticamente por IA en versiones anteriores **no** se incluyen aquí por riesgo de inconsistencia con el código; para la entrega institucional, adjuntar diagramas exportados desde herramienta CASE o desde el IDE a partir del esquema real desplegado.

---

*Documento alineado con el estado del repositorio QUORUM (frontend `quorum-frontend`, backend `quorum-backend`). Ante divergencia entre este texto y el código, prevalece el comportamiento implementado en la rama vigente.*
