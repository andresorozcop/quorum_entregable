<?php

namespace App\Services;

use App\Models\FichaCaracterizacion;
use App\Models\FichaInstructor;
use App\Models\Horario;
use App\Models\ImportacionAprendices;
use App\Models\JornadaFicha;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;

// Lógica de negocio de fichas: jornadas, horarios, instructores e importación (Módulo 5)
class FichaService
{
    /** Diferencia en horas entre inicio y fin (mínimo 1, máximo 24) para horas_programadas */
    public function calcularHorasProgramadas(string $horaInicio, string $horaFin): int
    {
        $a = Carbon::parse($horaInicio);
        $b = Carbon::parse($horaFin);
        if ($b->lte($a)) {
            throw ValidationException::withMessages([
                'horarios' => ['La hora de fin debe ser posterior a la hora de inicio.'],
            ]);
        }
        $minutos = $a->diffInMinutes($b);
        $horas     = (int) max(1, round($minutos / 60));

        return min(24, $horas);
    }

    /** Nombre completo del gestor activo actual, o null */
    public function nombreGestorActual(FichaCaracterizacion $ficha): ?string
    {
        $pivot = FichaInstructor::query()
            ->where('ficha_id', $ficha->id)
            ->where('es_gestor', 1)
            ->where('activo', 1)
            ->with('usuario')
            ->first();

        if (! $pivot || ! $pivot->usuario) {
            return null;
        }

        return trim($pivot->usuario->nombre.' '.$pivot->usuario->apellido);
    }

    /**
     * @param  array<int, array{usuario_id:int, es_gestor:bool}>  $instructores
     * @param  array<int, array{tipo:string, horarios:array}>  $jornadas
     */
    public function crearFicha(array $datosCabecera, array $instructores, array $jornadas): FichaCaracterizacion
    {
        return DB::transaction(function () use ($datosCabecera, $instructores, $jornadas) {
            $ficha = FichaCaracterizacion::query()->create([
                'numero_ficha'           => $datosCabecera['numero_ficha'],
                'estado'                 => $datosCabecera['estado'],
                'centro_formacion_id'    => $datosCabecera['centro_formacion_id'],
                'programa_formacion_id'  => $datosCabecera['programa_formacion_id'],
                'fecha_inicio'           => $datosCabecera['fecha_inicio'],
                'fecha_fin'              => $datosCabecera['fecha_fin'],
                'activo'                 => 1,
            ]);

            $this->sincronizarInstructoresDesdePayload($ficha, $instructores);
            $this->reemplazarJornadasYHorarios($ficha, $jornadas);

            return $ficha->fresh();
        });
    }

    /**
     * @param  array<int, array{usuario_id:int, es_gestor:bool}>  $instructores
     * @param  array<int, array{tipo:string, horarios:array}>  $jornadas
     */
    public function actualizarFicha(FichaCaracterizacion $ficha, array $datosCabecera, array $instructores, array $jornadas): FichaCaracterizacion
    {
        return DB::transaction(function () use ($ficha, $datosCabecera, $instructores, $jornadas) {
            $ficha->update([
                'numero_ficha'           => $datosCabecera['numero_ficha'],
                'estado'                 => $datosCabecera['estado'],
                'centro_formacion_id'    => $datosCabecera['centro_formacion_id'],
                'programa_formacion_id'  => $datosCabecera['programa_formacion_id'],
                'fecha_inicio'           => $datosCabecera['fecha_inicio'],
                'fecha_fin'              => $datosCabecera['fecha_fin'],
            ]);

            $this->sincronizarInstructoresDesdePayload($ficha, $instructores);
            $this->reemplazarJornadasYHorarios($ficha, $jornadas);

            return $ficha->fresh();
        });
    }

    /**
     * @param  array<int, array{usuario_id:int, es_gestor:bool}>  $instructores
     */
    public function sincronizarInstructoresDesdePayload(FichaCaracterizacion $ficha, array $instructores): void
    {
        $idsSolicitados = collect($instructores)->pluck('usuario_id')->map(fn ($id) => (int) $id)->all();

        FichaInstructor::query()
            ->where('ficha_id', $ficha->id)
            ->whereNotIn('usuario_id', $idsSolicitados)
            ->update(['activo' => 0, 'es_gestor' => 0]);

        foreach ($instructores as $fila) {
            try {
                FichaInstructor::query()->updateOrCreate(
                    [
                        'ficha_id'   => $ficha->id,
                        'usuario_id' => (int) $fila['usuario_id'],
                    ],
                    [
                        'es_gestor' => ! empty($fila['es_gestor']) ? 1 : 0,
                        'activo'    => 1,
                    ]
                );
            } catch (QueryException $e) {
                $this->lanzarSiGestorDuplicado($e);
                throw $e;
            }
        }
    }

    /**
     * @param  array<int, array{tipo:string, horarios:array<int, array{dia_semana:string, hora_inicio:string, hora_fin:string, instructor_id:int}>}>  $jornadas
     */
    public function reemplazarJornadasYHorarios(FichaCaracterizacion $ficha, array $jornadas): void
    {
        JornadaFicha::query()->where('ficha_id', $ficha->id)->delete();

        foreach ($jornadas as $j) {
            $jornada = JornadaFicha::query()->create([
                'ficha_id' => $ficha->id,
                'tipo'     => $j['tipo'],
                'activo'   => 1,
            ]);

            foreach ($j['horarios'] as $h) {
                $horas = $this->calcularHorasProgramadas($h['hora_inicio'], $h['hora_fin']);
                Horario::query()->create([
                    'ficha_id'          => $ficha->id,
                    'jornada_ficha_id'  => $jornada->id,
                    'dia_semana'        => $h['dia_semana'],
                    'hora_inicio'       => $h['hora_inicio'],
                    'hora_fin'          => $h['hora_fin'],
                    'horas_programadas' => $horas,
                    'instructor_id'     => (int) $h['instructor_id'],
                    'activo'            => 1,
                ]);
            }
        }
    }

    public function desactivarFicha(FichaCaracterizacion $ficha): void
    {
        $ficha->update(['activo' => 0]);
    }

    /**
     * @return array{exitosos: int, fallidos: int, errores: array<int, string>}
     */
    public function importarAprendicesDesdeExcel(FichaCaracterizacion $ficha, UploadedFile $archivo, int $importadoPorId): array
    {
        $errores  = [];
        $exitosos = 0;

        try {
            $spreadsheet = IOFactory::load($archivo->getRealPath());
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'archivo' => ['No se pudo leer el archivo Excel. Verifica que sea un .xlsx válido.'],
            ]);
        }

        $hoja    = $spreadsheet->getActiveSheet();
        $filas   = $hoja->toArray();
        $cabecera = array_shift($filas);
        if (! is_array($cabecera)) {
            $cabecera = [];
        }
        $mapa = $this->mapearColumnasImportacion($cabecera);

        if (count(array_filter($mapa)) < 3) {
            throw ValidationException::withMessages([
                'archivo' => ['El Excel debe tener columnas: cedula, nombre_completo, correo (primera fila).'],
            ]);
        }

        $numeroFila = 1;
        foreach ($filas as $fila) {
            $numeroFila++;
            if (! is_array($fila) || $this->filaVacia($fila)) {
                continue;
            }

            $cedula  = trim((string) ($fila[$mapa['cedula']] ?? ''));
            $nombreC = trim((string) ($fila[$mapa['nombre_completo']] ?? ''));
            $correo  = strtolower(trim((string) ($fila[$mapa['correo']] ?? '')));

            $errFila = "Fila {$numeroFila}: ";

            if ($cedula === '' || $nombreC === '' || $correo === '') {
                $errores[] = $errFila.'Faltan cédula, nombre completo o correo.';
                continue;
            }

            if (! filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                $errores[] = $errFila.'El correo no es válido.';
                continue;
            }

            if (Usuario::query()->where('correo', $correo)->exists()) {
                $errores[] = $errFila.'El correo ya está registrado en el sistema.';
                continue;
            }

            if (Usuario::query()->where('documento', $cedula)->exists()) {
                $errores[] = $errFila.'La cédula ya está registrada en el sistema.';
                continue;
            }

            [$nombre, $apellido] = $this->partirNombreCompleto($nombreC);

            try {
                Usuario::query()->create([
                    'nombre'    => $nombre,
                    'apellido'  => $apellido,
                    'documento' => $cedula,
                    'correo'    => $correo,
                    'password'  => null,
                    'rol'       => 'aprendiz',
                    'activo'    => 1,
                    'ficha_id'  => $ficha->id,
                ]);
                $exitosos++;
            } catch (\Throwable $e) {
                $errores[] = $errFila.'No se pudo crear el aprendiz.';
            }
        }

        $fallidos      = count($errores);
        $totalProceso  = $exitosos + $fallidos;

        ImportacionAprendices::query()->create([
            'importado_por'   => $importadoPorId,
            'ficha_id'        => $ficha->id,
            'nombre_archivo'  => $archivo->getClientOriginalName(),
            'total_registros' => $totalProceso,
            'exitosos'        => $exitosos,
            'fallidos'        => $fallidos,
            'errores'         => $errores,
        ]);

        return [
            'exitosos' => $exitosos,
            'fallidos' => $fallidos,
            'errores'  => $errores,
        ];
    }

    /** Primera palabra = nombre, resto = apellido */
    private function partirNombreCompleto(string $nombreCompleto): array
    {
        $partes = preg_split('/\s+/', $nombreCompleto, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if ($partes === []) {
            return ['Sin nombre', ''];
        }
        $nombre   = array_shift($partes);
        $apellido = trim(implode(' ', $partes));

        return [$nombre, $apellido !== '' ? $apellido : '-'];
    }

    /** @return array{cedula: ?int, nombre_completo: ?int, correo: ?int} */
    private function mapearColumnasImportacion(array $cabecera): array
    {
        $mapa = ['cedula' => null, 'nombre_completo' => null, 'correo' => null];
        foreach ($cabecera as $i => $titulo) {
            $clave = $this->normalizarEncabezado((string) $titulo);
            if (str_contains($clave, 'cedula') || str_contains($clave, 'cédula')) {
                $mapa['cedula'] = (int) $i;
            }
            if (str_contains($clave, 'nombre') && str_contains($clave, 'completo')) {
                $mapa['nombre_completo'] = (int) $i;
            }
            if ($clave === 'correo' || str_contains($clave, 'email')) {
                $mapa['correo'] = (int) $i;
            }
        }

        return $mapa;
    }

    private function normalizarEncabezado(string $s): string
    {
        $s = mb_strtolower(trim($s));
        $s = str_replace(['á', 'é', 'í', 'ó', 'ú', 'ñ'], ['a', 'e', 'i', 'o', 'u', 'n'], $s);

        return $s;
    }

    private function filaVacia(array $fila): bool
    {
        foreach ($fila as $celda) {
            if (trim((string) $celda) !== '') {
                return false;
            }
        }

        return true;
    }

    public function aplicarAccionInstructor(
        FichaCaracterizacion $ficha,
        int $usuarioId,
        string $accion,
        bool $esGestorSolicitado
    ): void {
        $usuario = Usuario::query()->find($usuarioId);
        if (! $usuario || ! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true) || ! (int) $usuario->activo) {
            throw ValidationException::withMessages([
                'usuario_id' => ['El usuario no es un instructor o gestor activo.'],
            ]);
        }

        try {
            if ($accion === 'asignar') {
                if ($esGestorSolicitado) {
                    $conflicto = FichaInstructor::query()
                        ->where('ficha_id', $ficha->id)
                        ->where('es_gestor', 1)
                        ->where('activo', 1)
                        ->where('usuario_id', '!=', $usuarioId)
                        ->with('usuario')
                        ->first();
                    if ($conflicto && $conflicto->usuario) {
                        $nom = trim($conflicto->usuario->nombre.' '.$conflicto->usuario->apellido);
                        throw ValidationException::withMessages([
                            'es_gestor' => ["Esta ficha ya tiene un Gestor de Grupo asignado: {$nom}."],
                        ]);
                    }
                }

                FichaInstructor::query()->updateOrCreate(
                    ['ficha_id' => $ficha->id, 'usuario_id' => $usuarioId],
                    [
                        'es_gestor' => $esGestorSolicitado ? 1 : 0,
                        'activo'    => 1,
                    ]
                );

                return;
            }

            if ($accion === 'desasignar') {
                FichaInstructor::query()
                    ->where('ficha_id', $ficha->id)
                    ->where('usuario_id', $usuarioId)
                    ->update(['activo' => 0, 'es_gestor' => 0]);

                return;
            }

            if ($accion === 'toggle_gestor') {
                $pivot = FichaInstructor::query()
                    ->where('ficha_id', $ficha->id)
                    ->where('usuario_id', $usuarioId)
                    ->first();

                if (! $pivot || ! (int) $pivot->activo) {
                    throw ValidationException::withMessages([
                        'usuario_id' => ['El instructor no está asignado activamente a esta ficha.'],
                    ]);
                }

                if ((int) $pivot->es_gestor === 1) {
                    $pivot->update(['es_gestor' => 0]);

                    return;
                }

                $conflicto = FichaInstructor::query()
                    ->where('ficha_id', $ficha->id)
                    ->where('es_gestor', 1)
                    ->where('activo', 1)
                    ->where('usuario_id', '!=', $usuarioId)
                    ->with('usuario')
                    ->first();
                if ($conflicto && $conflicto->usuario) {
                    $nom = trim($conflicto->usuario->nombre.' '.$conflicto->usuario->apellido);
                    throw ValidationException::withMessages([
                        'es_gestor' => ["Esta ficha ya tiene un Gestor de Grupo asignado: {$nom}."],
                    ]);
                }

                $pivot->update(['es_gestor' => 1]);
            }
        } catch (QueryException $e) {
            $this->lanzarSiGestorDuplicado($e);
            throw $e;
        }
    }

    private function lanzarSiGestorDuplicado(QueryException $e): void
    {
        if (str_contains($e->getMessage(), 'Gestor') || str_contains($e->getMessage(), '45000')) {
            throw ValidationException::withMessages([
                'es_gestor' => ['Esta ficha ya tiene un Gestor de Grupo asignado.'],
            ]);
        }
    }
}
