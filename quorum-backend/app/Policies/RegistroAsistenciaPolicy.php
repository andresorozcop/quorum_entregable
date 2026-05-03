<?php

namespace App\Policies;

use App\Models\RegistroAsistencia;
use App\Models\Usuario;

// Corrección de un registro ya guardado (sesión cerrada)
class RegistroAsistenciaPolicy
{
    public function update(Usuario $usuario, RegistroAsistencia $registro): bool
    {
        if (! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            return false;
        }

        $registro->loadMissing('sesion');
        $sesion = $registro->sesion;

        if (! $sesion) {
            return false;
        }

        return (int) $sesion->instructor_id === (int) $usuario->id
            && $sesion->estado === 'cerrada';
    }

    /** Descargar evidencia de excusa: instructor que cerró la sesión o el aprendiz del registro. */
    public function viewExcusaEvidencia(Usuario $usuario, RegistroAsistencia $registro): bool
    {
        $registro->loadMissing('sesion');
        $sesion = $registro->sesion;
        if (! $sesion) {
            return false;
        }

        if ($usuario->rol === 'aprendiz' && (int) $registro->aprendiz_id === (int) $usuario->id) {
            return true;
        }

        if (! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            return false;
        }

        return (int) $sesion->instructor_id === (int) $usuario->id;
    }
}
