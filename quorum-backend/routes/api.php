<?php

use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CentroFormacionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FichaController;
use App\Http\Controllers\ProgramaFormacionController;
use App\Http\Controllers\UsuarioController;
use App\Http\Middleware\EnsureTotpSessionOk;
use Illuminate\Support\Facades\Route;

// Rutas de la API QUORUM

// Ruta de prueba — verifica que la API responde correctamente
Route::get('/ping', function () {
    return response()->json([
        'status'  => 'ok',
        'mensaje' => 'API QUORUM funcionando correctamente',
        'version' => '1.0',
    ]);
});

// -----------------------------------------------------------------------
// Módulo 1 — Autenticación
// -----------------------------------------------------------------------
Route::prefix('auth')->group(function () {
    // Rutas públicas — no requieren sesión activa
    Route::post('login',          [AuthController::class, 'login']);
    Route::post('login-aprendiz', [AuthController::class, 'loginAprendiz']);

    // Rutas protegidas — requieren sesión Sanctum activa
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',      [AuthController::class, 'me']);
        Route::post('2fa/configurar', [AuthController::class, 'configurar2FA']);
        Route::post('2fa/verificar',  [AuthController::class, 'verificar2FA']);
    });
});

// -----------------------------------------------------------------------
// Módulo 4 — Dashboard por rol (requiere 2FA completado en sesión)
// -----------------------------------------------------------------------
Route::middleware(['auth:sanctum', EnsureTotpSessionOk::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Módulo 6 — Usuarios (solo admin vía UsuarioPolicy)
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::post('/usuarios/{usuario}/reactivar', [UsuarioController::class, 'reactivar']);
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy']);

    // Módulo 5 — Fichas de caracterización y catálogos
    Route::get('/centros-formacion', [CentroFormacionController::class, 'index']);
    Route::get('/programas-formacion', [ProgramaFormacionController::class, 'index']);
    Route::get('/instructores-disponibles', [FichaController::class, 'instructoresDisponibles']);

    Route::get('/fichas', [FichaController::class, 'index']);
    Route::post('/fichas', [FichaController::class, 'store']);
    Route::get('/fichas/{ficha}', [FichaController::class, 'show']);
    Route::put('/fichas/{ficha}', [FichaController::class, 'update']);
    Route::delete('/fichas/{ficha}', [FichaController::class, 'destroy']);
    Route::post('/fichas/{ficha}/reactivar', [FichaController::class, 'reactivar']);
    Route::post('/fichas/{ficha}/instructores', [FichaController::class, 'asignarInstructor']);
    Route::post('/fichas/{ficha}/aprendices', [FichaController::class, 'storeAprendiz']);
    Route::put('/fichas/{ficha}/aprendices/{usuario}', [FichaController::class, 'updateAprendiz']);
    Route::delete('/fichas/{ficha}/aprendices/{usuario}', [FichaController::class, 'destroyAprendiz']);
    Route::post('/fichas/{ficha}/importar-aprendices', [FichaController::class, 'importarAprendices']);

    // Módulo 8 — Historial / matriz por ficha (admin, coordinador, instructor, gestor)
    Route::get('/asistencia/historial/{ficha}', [AsistenciaController::class, 'historial']);

    // Módulo 7 — Tomar asistencia (instructor / gestor)
    Route::post('/asistencia/iniciar-sesion', [AsistenciaController::class, 'iniciarSesion']);
    Route::post('/asistencia/sesiones/{sesion}/guardar', [AsistenciaController::class, 'guardar']);
    Route::put('/asistencia/registros/{registro}', [AsistenciaController::class, 'actualizar']);
});

// -----------------------------------------------------------------------
// Módulo 2 — Recuperación de contraseña
// throttle:5,1 → máximo 5 solicitudes por minuto por IP (protección anti-spam)
// -----------------------------------------------------------------------
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    // Solicitar enlace de recuperación por correo
    Route::post('recuperar', [AuthController::class, 'solicitarReset']);
    // Procesar el cambio de contraseña con el token recibido
    Route::post('reset',     [AuthController::class, 'procesarReset']);
});
