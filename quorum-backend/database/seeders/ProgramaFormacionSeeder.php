<?php

namespace Database\Seeders;

use App\Models\ProgramaFormacion;
use Illuminate\Database\Seeder;

class ProgramaFormacionSeeder extends Seeder
{
    public function run(): void
    {
        // Creamos programas de formación de prueba
        $programas = [
            [
                'nombre' => 'Análisis y Desarrollo de Software',
                'codigo' => 'ADS',
            ],
            [
                'nombre' => 'Electricidad Industrial',
                'codigo' => 'EI',
            ],
            [
                'nombre' => 'Construcción e Infraestructura',
                'codigo' => 'CI',
            ],
        ];

        foreach ($programas as $programa) {
            ProgramaFormacion::create([
                'nombre' => $programa['nombre'],
                'codigo' => $programa['codigo'],
                'activo' => 1,
            ]);
        }
    }
}
