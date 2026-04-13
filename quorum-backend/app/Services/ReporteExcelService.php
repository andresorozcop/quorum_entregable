<?php

namespace App\Services;

use App\Models\DiaFestivo;
use App\Models\FichaCaracterizacion;
use App\Models\FichaInstructor;
use App\Models\RegistroAsistencia;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Throwable;

// Genera el Excel CPIC desde plantilla (Módulo 11 — PRD sección 21)
class ReporteExcelService
{
    /** Plantilla oficial: en storage/app (no se sobrescribe nunca) */
    private function rutaPlantilla(): string
    {
        return storage_path('app/plantilla_asistencia.xlsx');
    }

    /**
     * Crea el archivo temporal y devuelve [ruta absoluta, nombre para descarga].
     *
     * @return array{0: string, 1: string}
     */
    public function generarYGuardarTemporal(FichaCaracterizacion $ficha, string $desde, string $hasta): array
    {
        $rutaPlantilla = $this->rutaPlantilla();
        if (! File::isFile($rutaPlantilla)) {
            throw new \RuntimeException('No se encontró la plantilla de asistencia en el servidor.');
        }

        $ficha->load(['programa', 'centro']);

        $sesiones = $this->sesionesCerradasPeriodo($ficha->id, $desde, $hasta);
        if ($sesiones->isEmpty()) {
            throw ValidationException::withMessages([
                'periodo' => ['No hay sesiones cerradas en el periodo seleccionado.'],
            ]);
        }

        $aprendices = $this->listarAprendicesFicha($ficha->id);
        if ($aprendices->isEmpty()) {
            throw ValidationException::withMessages([
                'ficha' => ['No hay aprendices activos en esta ficha.'],
            ]);
        }

        $sesionIds = $sesiones->pluck('id')->all();
        $registrosPorSesionYAprendiz = RegistroAsistencia::query()
            ->whereIn('sesion_id', $sesionIds)
            ->where('activo', 1)
            ->get()
            ->groupBy(fn (RegistroAsistencia $r) => $r->sesion_id.'_'.$r->aprendiz_id);

        $dataPrograma = (string) ($ficha->programa?->nombre ?? '');
        $dataInstructores = 'Instructor/Tutor: '.$this->cadenaInstructores($ficha->id);
        $dataFicha = 'N° de Ficha: '.(string) $ficha->numero_ficha;
        $nombreCentro = (string) ($ficha->centro?->nombre ?? '');
        $dataCentro = 'Centro de Formación: '.$nombreCentro;

        $desdeFmt = Carbon::parse($desde, 'America/Bogota')->format('d/m/Y');
        $hastaFmt = Carbon::parse($hasta, 'America/Bogota')->format('d/m/Y');
        $dataPeriodo = 'Periodo: '.$desdeFmt.' a '.$hastaFmt;

        $fechasCabecera = $sesiones->map(function (Sesion $s) {
            $fecha = $s->fecha instanceof \Carbon\CarbonInterface
                ? $s->fecha
                : Carbon::parse((string) $s->fecha, 'America/Bogota');

            return $fecha->format('d/m');
        })->all();

        $instructoresDiarios = $sesiones->map(function (Sesion $s) {
            $inst = $s->instructor;

            return $inst ? trim($inst->nombre.' '.$inst->apellido) : '—';
        })->all();

        // Matriz: por aprendiz, horas por índice de sesión (0 = vacío si no aplica)
        $estudiantes = [];
        foreach ($aprendices as $ap) {
            $inasistencias = [];
            $total = 0;
            foreach ($sesiones as $i => $sesion) {
                $key = $sesion->id.'_'.$ap->id;
                /** @var RegistroAsistencia|null $reg */
                $reg = $registrosPorSesionYAprendiz->get($key)?->first();
                $horas = $this->horasInasistenciaCelda($reg, $sesion);
                $inasistencias[$i] = $horas;
                if ($horas > 0) {
                    $total += $horas;
                }
            }
            $estudiantes[] = [
                'nombre'                     => trim($ap->nombre.' '.$ap->apellido),
                'documento'                  => (string) $ap->documento,
                'inasistencias'              => $inasistencias,
                'causal'                     => '',
                'observaciones'              => '',
                'total_horas_inasistencia'   => $total,
            ];
        }

        try {
            $spreadsheet = IOFactory::load($rutaPlantilla);
        } catch (Throwable $e) {
            report($e);
            throw new \RuntimeException('No se pudo leer la plantilla Excel.');
        }

        $worksheet = $spreadsheet->getActiveSheet();

        // Cabeceras estáticas (PRD §21)
        $worksheet->getCell('A4')->setValue('Programa de Formación: '.$dataPrograma);
        $worksheet->getCell('A5')->setValue($dataInstructores);
        $worksheet->getCell('A6')->setValue($dataFicha);
        $worksheet->getCell('D6')->setValue($dataCentro);
        $worksheet->getCell('F8')->setValue($dataPeriodo);

        $colInicio = 6; // Columna F
        foreach ($fechasCabecera as $i => $fechaTxt) {
            $colLetra = Coordinate::stringFromColumnIndex($colInicio + $i);
            $worksheet->getCell($colLetra.'9')->setValue($fechaTxt);
        }

        $numFechas = count($fechasCabecera);
        $colCausal = $colInicio + $numFechas;
        $colObservaciones = $colCausal + 1;
        $colTotal = $colObservaciones + 1;

        $filaBase = 10;
        if (count($estudiantes) > 1) {
            // Insertar filas para no romper el pie de página de la plantilla
            $worksheet->insertNewRowBefore(11, count($estudiantes) - 1);
        }

        foreach ($estudiantes as $idx => $aprendiz) {
            $fila = $filaBase + $idx;
            $worksheet->getCell('A'.$fila)->setValue($aprendiz['nombre']);
            $worksheet->getCell('D'.$fila)->setValue($aprendiz['documento']);

            foreach ($aprendiz['inasistencias'] as $i => $horas) {
                $colLetra = Coordinate::stringFromColumnIndex($colInicio + $i);
                $celda = $colLetra.$fila;
                if ($horas > 0) {
                    $worksheet->getCell($celda)->setValue($horas);
                } else {
                    // Presente / excusa / sin dato: celda vacía (no cero)
                    $worksheet->getCell($celda)->setValue('');
                }
            }

            $worksheet->getCell(Coordinate::stringFromColumnIndex($colCausal).$fila)
                ->setValue($aprendiz['causal'] ?? '');
            $worksheet->getCell(Coordinate::stringFromColumnIndex($colObservaciones).$fila)
                ->setValue($aprendiz['observaciones'] ?? '');
            $worksheet->getCell(Coordinate::stringFromColumnIndex($colTotal).$fila)
                ->setValue($aprendiz['total_horas_inasistencia']);
        }

        $filaFooter = $filaBase + count($estudiantes) + 1;
        foreach ($instructoresDiarios as $i => $nombreInstructor) {
            $colLetra = Coordinate::stringFromColumnIndex($colInicio + $i);
            $celda = $colLetra.$filaFooter;
            $worksheet->getCell($celda)->setValue($nombreInstructor);
            $worksheet->getStyle($celda)->getAlignment()->setTextRotation(90);
        }

        $dirTemp = storage_path('app/temp');
        File::ensureDirectoryExists($dirTemp);

        $ym = Carbon::now('America/Bogota')->format('Y-m');
        $nombreArchivo = 'reporte_'.$ficha->numero_ficha.'_'.$ym.'.xlsx';
        $rutaSalida = $dirTemp.DIRECTORY_SEPARATOR.$nombreArchivo;

        try {
            $writer = new Xlsx($spreadsheet);
            $writer->save($rutaSalida);
        } catch (Throwable $e) {
            report($e);
            if (File::exists($rutaSalida)) {
                File::delete($rutaSalida);
            }
            throw new \RuntimeException('No se pudo generar el archivo Excel.');
        }

        return [$rutaSalida, $nombreArchivo];
    }

    /**
     * Sesiones cerradas en rango, sin domingos ni días festivos activos.
     *
     * @return \Illuminate\Support\Collection<int, Sesion>
     */
    private function sesionesCerradasPeriodo(int $fichaId, string $desde, string $hasta)
    {
        $festivos = DiaFestivo::query()
            ->where('activo', 1)
            ->whereBetween('fecha', [$desde, $hasta])
            ->pluck('fecha')
            ->map(fn ($f) => (string) $f)
            ->flip();

        return Sesion::query()
            ->where('ficha_id', $fichaId)
            ->where('estado', 'cerrada')
            ->whereBetween('fecha', [$desde, $hasta])
            ->with(['instructor:id,nombre,apellido'])
            ->orderBy('fecha')
            ->orderBy('id')
            ->get()
            ->filter(function (Sesion $s) use ($festivos) {
                $fechaStr = $s->fecha instanceof \Carbon\CarbonInterface
                    ? $s->fecha->format('Y-m-d')
                    : Carbon::parse((string) $s->fecha, 'America/Bogota')->format('Y-m-d');
                $d = Carbon::parse($fechaStr, 'America/Bogota');
                if ((int) $d->format('N') === 7) {
                    return false;
                }
                if ($festivos->has($fechaStr)) {
                    return false;
                }

                return true;
            })
            ->values();
    }

    /** Aprendices activos de la ficha (mismo criterio que historial M8) */
    private function listarAprendicesFicha(int $fichaId)
    {
        return Usuario::query()
            ->where('rol', 'aprendiz')
            ->where('ficha_id', $fichaId)
            ->where('activo', 1)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'apellido', 'documento']);
    }

    /** Gestor primero, luego el resto por apellido y nombre */
    private function cadenaInstructores(int $fichaId): string
    {
        $filas = FichaInstructor::query()
            ->where('ficha_id', $fichaId)
            ->where('activo', 1)
            ->with(['usuario:id,nombre,apellido'])
            ->get();

        $clave = static fn (FichaInstructor $fi): string => strtolower(
            trim(($fi->usuario?->apellido ?? '').' '.($fi->usuario?->nombre ?? ''))
        );

        $gestores = $filas->where('es_gestor', 1)->sortBy($clave)->values();
        $otros = $filas->where('es_gestor', 0)->sortBy($clave)->values();
        $ordenados = $gestores->concat($otros);

        $nombres = [];
        foreach ($ordenados as $fi) {
            $u = $fi->usuario;
            if ($u) {
                $nombres[] = trim($u->nombre.' '.$u->apellido);
            }
        }

        return implode(', ', array_filter($nombres));
    }

    /** Horas a mostrar en celda: 0 si presente, excusa o sin registro */
    private function horasInasistenciaCelda(?RegistroAsistencia $reg, Sesion $sesion): int
    {
        if ($reg === null) {
            return 0;
        }

        return match ($reg->tipo) {
            'falla' => (int) $sesion->horas_programadas,
            'parcial' => (int) ($reg->horas_inasistencia ?? 0),
            default => 0,
        };
    }
}
