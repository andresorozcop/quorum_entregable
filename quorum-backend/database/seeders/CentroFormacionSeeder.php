<?php

namespace Database\Seeders;

use App\Models\CentroFormacion;
use Illuminate\Database\Seeder;

class CentroFormacionSeeder extends Seeder
{
    public function run(): void
    {
        // Creamos el centro de formación principal del SENA CPIC
        CentroFormacion::create([
            'nombre' => 'Centro de Procesos Industriales y Construcción',
            'codigo' => 'CPIC',
            'activo' => 1,
        ]);
    }
}
