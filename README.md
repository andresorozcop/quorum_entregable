# QUORUM — Sistema de Control de Asistencia SENA

Sistema web para digitalizar el control de asistencia de aprendices del SENA — Centro de Procesos Industriales y Construcción (CPIC).

## Stack Tecnológico

- **Frontend:** Next.js 14 (TypeScript strict) + Tailwind CSS
- **Backend:** Laravel 12 (PHP 8.2) + MySQL 8 (XAMPP)
- **Auth:** Laravel Sanctum (SPA stateful)

## Cómo iniciar el proyecto

### Requisitos previos
- XAMPP con PHP 8.2 y MySQL activos
- Node.js 20+
- Composer 2.x

### Backend (Laravel)
```bash
cd quorum-backend
cp .env.example .env   # Configurar variables de entorno
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
API disponible en: http://localhost:8000

### Frontend (Next.js)
```bash
cd quorum-frontend
cp .env.local.example .env.local   # Configurar claves reCAPTCHA
npm install
npm run dev
```
App disponible en: http://localhost:3000

## Usuarios de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@quorum.sena.edu.co | Admin1234* |
| Coordinador | coordinador@quorum.sena.edu.co | Coord1234* |
| Instructor | instructor@quorum.sena.edu.co | Inst1234* |
| Aprendiz | aprendiz@quorum.sena.edu.co | cédula: 1000000004 |

## Estado del Proyecto

- [x] Módulo 0 — Setup inicial
- [ ] Módulo 1 — Autenticación
- [ ] Módulo 2 — Recuperación de contraseña
- [ ] Módulo 3 — Layout global
- [ ] Módulo 4 — Dashboard
- [ ] Módulo 5 — Gestión de fichas
- [ ] Módulo 6 — Gestión de usuarios
- [ ] Módulo 7 — Tomar asistencia
- [ ] Módulo 8 — Historial de asistencia
- [ ] Módulo 9 — Vista aprendiz
- [ ] Módulo 10 — Vista coordinador
- [ ] Módulo 11 — Reporte Excel CPIC
- [ ] Módulo 12 — Configuración y festivos
- [ ] Módulo 13 — Perfil de usuario
