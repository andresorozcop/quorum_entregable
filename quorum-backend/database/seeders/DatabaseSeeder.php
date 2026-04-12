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
            // 1. Primero los catálogos base (sin dependencias entre sí)
            CentroFormacionSeeder::class,
            ProgramaFormacionSeeder::class,

            // 2. Los usuarios de prueba
            UsuarioSeeder::class,

            // 3. La configuración inicial del sistema
            ConfiguracionSeeder::class,
        ]);
    }
}
