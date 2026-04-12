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
# Crear .env.local con al menos: NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
```
App disponible en: http://localhost:3000 (o el puerto que muestre la consola; alinear `FRONTEND_URL` en el `.env` del backend).

## Usuarios de prueba

Datos del seeder [`UsuarioSeeder.php`](quorum-backend/database/seeders/UsuarioSeeder.php). Contraseña staff: **`Admin123!`**. Lista detallada en [`contexto.md`](contexto.md).

| Rol | Correo | Notas |
|-----|--------|--------|
| Administrador | andresfelipeorozcopiedrahita@gmail.com | Gmail de pruebas (M2) |
| Coordinador | sbecerra@sena.edu.co | |
| Instructor | documentosorozco25@gmail.com | Gmail de pruebas (M2) |
| Gestor de grupo | mgomez@sena.edu.co | |
| Aprendiz | andres@aprendiz.sena.edu.co | Sin contraseña: usa cédula **33333333** |

> El PRD institucional puede listar otros correos (`@sena.edu.co`); en desarrollo el seeder usa Gmail en admin e instructor para probar correo real y recuperación de contraseña.

## Estado del Proyecto

- [x] Módulo 0 — Setup inicial
- [x] Módulo 1 — Autenticación
- [x] Módulo 2 — Recuperación de contraseña
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
