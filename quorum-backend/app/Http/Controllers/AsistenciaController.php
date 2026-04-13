<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActualizarRegistroAsistenciaRequest;
use App\Http\Requests\GuardarAsistenciaRequest;
use App\Http\Requests\HistorialAsistenciaRequest;
use App\Http\Requests\IniciarSesionAsistenciaRequest;
use App\Models\FichaCaracterizacion;
use App\Models\RegistroAsistencia;
use App\Models\Sesion;
use App\Services\AsistenciaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

// API tomar asistencia (Módulo 7) e historial matriz (Módulo 8)
class AsistenciaController extends Controller
{
    public function __construct(
        private readonly AsistenciaService $asistenciaService
    ) {}

    /** Matriz de historial por ficha (filtros opcionales en query) */
    public function historial(HistorialAsistenciaRequest $request, FichaCaracterizacion $ficha): JsonResponse
    {
        $this->authorize('view', $ficha);

        $validados = $request->validated();
        $tipos     = [];
        if (! empty($validados['tipo']) && is_array($validados['tipo'])) {
            $tipos = array_values(array_unique(array_filter($validados['tipo'])));
        }

        $payload = $this->asistenciaService->historialMatriz(
            $ficha,
            isset($validados['desde']) ? (string) $validados['desde'] : null,
            isset($validados['hasta']) ? (string) $validados['hasta'] : null,
            $tipos
        );

        return response()->json($payload);
    }

    /** Abre o devuelve sesión abierta + lista de aprendices */
    public function iniciarSesion(IniciarSesionAsistenciaRequest $request): JsonResponse
    {
        $usuario = $request->user();
        $fichaId = (int) $request->input('ficha_id');
        $fecha   = $request->input('fecha');
        $horarioId = $request->filled('horario_id') ? (int) $request->input('horario_id') : null;

        $ficha = FichaCaracterizacion::query()->findOrFail($fichaId);
        $this->authorize('view', $ficha);

        try {
            $payload = $this->asistenciaService->iniciarSesion($usuario, $fichaId, $fecha, $horarioId);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo iniciar la sesión.',
                'errors'  => $e->errors(),
            ], 422);
        }

        return response()->json($payload);
    }

    /** Guarda todos los registros y cierra la sesión */
    public function guardar(GuardarAsistenciaRequest $request, Sesion $sesion): JsonResponse
    {
        $this->authorize('guardarAsistencia', $sesion);

        try {
            $this->asistenciaService->guardarSesionCompleta(
                $request->user(),
                $sesion,
                $request->input('registros', [])
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo guardar la asistencia.',
                'errors'  => $e->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Asistencia guardada correctamente.',
        ]);
    }

    /** Corrige un registro (sesión ya cerrada) */
    public function actualizar(ActualizarRegistroAsistenciaRequest $request, RegistroAsistencia $registro): JsonResponse
    {
        $this->authorize('update', $registro);

        try {
            $this->asistenciaService->actualizarRegistro(
                $request->user(),
                $registro,
                $request->only(['tipo', 'horas_inasistencia', 'razon'])
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo actualizar el registro.',
                'errors'  => $e->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Registro actualizado correctamente.',
        ]);
    }
}
