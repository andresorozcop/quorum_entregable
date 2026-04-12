<?php

namespace App\Policies;

use App\Models\CentroFormacion;
use App\Models\Usuario;

// Listado de centros para formularios de ficha (solo admin en M5)
class CentroFormacionPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->rol === 'admin';
    }

    public function view(Usuario $usuario, CentroFormacion $centro): bool
    {
        return $usuario->rol === 'admin';
    }
}
