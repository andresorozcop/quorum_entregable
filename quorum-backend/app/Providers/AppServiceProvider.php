<?php

namespace App\Providers;

use App\Models\CentroFormacion;
use App\Models\FichaCaracterizacion;
use App\Models\ProgramaFormacion;
use App\Policies\CentroFormacionPolicy;
use App\Policies\FichaPolicy;
use App\Policies\ProgramaFormacionPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registrar servicios del contenedor de la aplicación.
     */
    public function register(): void
    {
        //
    }

    /**
     * Inicializar servicios al arrancar la aplicación.
     */
    public function boot(): void
    {
        Gate::policy(FichaCaracterizacion::class, FichaPolicy::class);
        Gate::policy(CentroFormacion::class, CentroFormacionPolicy::class);
        Gate::policy(ProgramaFormacion::class, ProgramaFormacionPolicy::class);

        // Configuramos la zona horaria de MySQL para que coincida con Bogotá
        // Solo lo hacemos si la conexión es MySQL, y capturamos errores de conexión
        try {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("SET time_zone = '-05:00'");
            }
        } catch (\Exception $e) {
            // Si la base de datos no está disponible todavía, ignoramos el error
            // Esto evita problemas al correr comandos de artisan antes de crear la BD
        }
    }
}
