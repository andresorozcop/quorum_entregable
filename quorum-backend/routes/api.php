<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
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
    });
});

// -----------------------------------------------------------------------
// Módulo 4 — Dashboard por rol
// -----------------------------------------------------------------------
Route::middleware('auth:sanctum')->get('/dashboard', [DashboardController::class, 'index']);

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
