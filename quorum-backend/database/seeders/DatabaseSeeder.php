<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// Seeder principal — llama a todos los seeders en el orden correcto
// El orden es importante porque algunos seeders dependen de datos de otros
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // 1. Catálogos base (sin dependencias entre sí)
            CentroFormacionSeeder::class,
            ProgramaFormacionSeeder::class,

            // 2. Usuarios de prueba (exactamente los del PRD §5 y §22)
            UsuarioSeeder::class,

            // 3. Configuración inicial del sistema (claves del PRD §5)
            ConfiguracionSeeder::class,

            // 4. Días festivos Colombia 2026 (PRD §5)
            DiaFestivoSeeder::class,
        ]);
    }
}
