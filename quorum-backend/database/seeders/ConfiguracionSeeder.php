<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        // Configuraciones iniciales del sistema QUORUM
        $configuraciones = [
            [
                'clave'       => 'nombre_sistema',
                'valor'       => 'QUORUM',
                'descripcion' => 'Nombre del sistema que aparece en la interfaz',
            ],
            [
                'clave'       => 'nombre_institucion',
                'valor'       => 'SENA — Centro de Procesos Industriales y Construcción',
                'descripcion' => 'Nombre de la institución educativa',
            ],
            [
                'clave'       => 'max_intentos_login',
                'valor'       => '5',
                'descripcion' => 'Número máximo de intentos de login antes de bloquear la cuenta',
            ],
            [
                'clave'       => 'minutos_bloqueo_login',
                'valor'       => '15',
                'descripcion' => 'Minutos que dura el bloqueo por intentos fallidos',
            ],
            [
                'clave'       => 'timeout_sesion',
                'valor'       => '120',
                'descripcion' => 'Minutos de inactividad antes de cerrar la sesión automáticamente',
            ],
            [
                'clave'       => 'expiracion_token_reset',
                'valor'       => '60',
                'descripcion' => 'Minutos de validez del token de recuperación de contraseña',
            ],
        ];

        foreach ($configuraciones as $config) {
            Configuracion::create($config);
        }
    }
}
