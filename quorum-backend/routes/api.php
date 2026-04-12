<?php

use Illuminate\Support\Facades\Route;

// Rutas de la API QUORUM
// Los controladores se implementarán en los módulos correspondientes

// Ruta de prueba — verifica que la API responde correctamente
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'mensaje' => 'API QUORUM funcionando correctamente',
        'version' => '1.0',
    ]);
});

// Las rutas de autenticación, usuarios, fichas y asistencia
// se agregarán en los módulos 1 al 13
