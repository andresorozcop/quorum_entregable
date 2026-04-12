<?php

namespace App\Http\Controllers;

use App\Models\CentroFormacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Listado de centros de formación para formularios (Módulo 5)
class CentroFormacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CentroFormacion::class);

        $items = CentroFormacion::query()
            ->where('activo', 1)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'codigo']);

        return response()->json(['data' => $items]);
    }
}
