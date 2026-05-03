# QUORUM — Guía rápida para exposición / sustentación

Documento de apoyo con **URLs**, **arranque**, **credenciales actuales** (según `quorum-backend/database/seeders/UsuarioSeeder.php`) y **notas para la demo**.  
Si cambias usuarios en la base de datos o en el seeder, actualiza esta guía para que coincida con tu entorno.

---

## 1. Qué es el sistema (frase para abrir)

**QUORUM** es una aplicación web que digitaliza el control de asistencia de **aprendices** del SENA (enfoque CPIC en el PRD): roles de administrador, coordinador, instructor, gestor de grupo y aprendiz; backend Laravel + MySQL; frontend Next.js.

---

## 2. URLs locales

| Servicio   | URL habitual                          |
|-----------|----------------------------------------|
| Frontend | http://localhost:3000 (o 3001 si 3000 está ocupado) |
| API      | http://localhost:8000                |
| Ping API | http://localhost:8000/api/ping       |

---

## 3. Arranque rápido (orden)

### Backend (desde `quorum-backend`)

1. XAMPP: Apache y **MySQL** encendidos.
2. Base de datos MySQL: crear esquema `quorum` (phpMyAdmin o CLI).
3. `.env` configurado (copiar de `.env.example`), `php artisan key:generate`.
4. `composer install` (si aplica).
5. `php artisan migrate --seed`
6. `php artisan serve` → API en puerto **8000**.

### Frontend (desde `quorum-frontend`)

1. `npm install`
2. Crear **`.env.local`** con al menos:  
   `NEXT_PUBLIC_API_URL=http://localhost:8000`  
   (y las variables que uses para reCAPTCHA en el front, si están configuradas).
3. `npm run dev`

### Coherencia CORS / cookies

- En el `.env` del backend, `FRONTEND_URL` debe coincidir con el puerto real del Next (3000 o 3001).
- `SESSION_DOMAIN` y `SANCTUM_STATEFUL_DOMAINS` en backend: revisar `.env.example` para `localhost` y variantes de puerto.

---

## 4. Credenciales actuales (después de `migrate --seed`)

**Contraseña única para todo el personal con login por correo + contraseña:** `Admin123!`

> **Importante:** El login del **staff** suele exigir **reCAPTCHA** y, según el flujo del sistema, **2FA (TOTP)** con app tipo Google Authenticator. Prepara el celular antes de la demo.

### Tabla de usuarios de prueba

| Rol             | Correo                                      | Contraseña   | Documento (cédula) |
|-----------------|---------------------------------------------|--------------|---------------------|
| Administrador   | andresfelipeorozcopiedrahita@gmail.com      | `Admin123!`  | 12345678            |
| Coordinador     | sbecerra@sena.edu.co                        | `Admin123!`  | 87654321            |
| Instructor      | documentosorozco25@gmail.com                | `Admin123!`  | 11111111            |
| Gestor de grupo | mgomez@sena.edu.co                          | `Admin123!`  | 22222222            |
| Aprendiz        | andres@aprendiz.sena.edu.co                 | *(ninguna)*  | **33333333**        |

### Login aprendiz

- Flujo distinto al del staff: **correo institucional de aprendiz + número de documento** (no usa la contraseña `Admin123!`).
- En el seeder: correo `andres@aprendiz.sena.edu.co` y documento **`33333333`**.

### Nombres en datos de prueba (por si preguntan en vivo)

- Admin: José Germán Estrada Clavijo  
- Coordinador: Santiago Becerra Henao  
- Instructor: Carlos López Martínez  
- Gestor: María Gómez Torres  
- Aprendiz: Andrés Felipe Orozco Piedrahita  

---

## 5. Variables de entorno que suelen preguntar en la demo

| Ámbito   | Variables / notas |
|----------|-------------------|
| Backend  | `DB_*`, `APP_URL`, `FRONTEND_URL`, `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` |
| Correo   | `MAIL_*` en `.env` (Gmail suele usar contraseña de aplicación). Sin esto, recuperación de contraseña puede fallar. |
| reCAPTCHA| `RECAPTCHA_*` en backend; clave pública en frontend si aplica. |
| Frontend | `NEXT_PUBLIC_API_URL` apuntando al mismo host/puerto donde corre `php artisan serve`. |

Detalle: ver `quorum-backend/.env.example`.

---

## 6. Guion corto de demostración (sugerido)

1. Abrir frontend → login como **administrador** (reCAPTCHA + 2FA si aplica).
2. Revisar **dashboard** / panel según lo implementado en tu rama.
3. **Cerrar sesión** → login como **instructor** → flujo de **asistencia** (si ya está cargado datos de fichas en tu BD).
4. **Cerrar sesión** → login **aprendiz** (`andres@aprendiz.sena.edu.co` + documento `33333333`) → **mi historial** (si aplica).
5. (Opcional) **Coordinador** para vista de seguimiento / estadísticas.

Si en tu base **aún no hay fichas** creadas tras el seed, el `DatabaseSeeder` actual solo carga catálogos, usuarios, configuración y festivos: para la demo puedes crear una ficha desde el panel como admin o instructor según permisos.

---

## 7. Datos que cargan los seeders (orden)

1. `CentroFormacionSeeder`  
2. `ProgramaFormacionSeeder`  
3. `UsuarioSeeder` ← credenciales de la tabla anterior  
4. `ConfiguracionSeeder`  
5. `DiaFestivoSeeder`  

---

## 8. Seguridad / ética en la exposición

- Estas credenciales son **solo para desarrollo**; no uses cuentas reales de producción en diapositivas públicas sin anonimizar.
- No subas un `.md` con **contraseñas reales** distintas a las del seeder si vas a publicar el repo; para sustentación en vivo puedes usar este archivo en local o imprimir una copia.

---

## 9. Stack (para diapositiva técnica)

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS  
- **Backend:** Laravel 12, PHP 8.2  
- **BD:** MySQL 8 (XAMPP)  
- **Auth:** Laravel Sanctum (SPA con cookies), políticas y middleware por rol  

---

*Última alineación con código: seeder `UsuarioSeeder.php` del repositorio. Si el README y este archivo difieren, prevalece el seeder tras `php artisan migrate --seed`.*
