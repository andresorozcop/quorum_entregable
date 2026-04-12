<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuracion';
    public $timestamps = false;

    protected $fillable = [
        'clave',
        'valor',
        'descripcion',
    ];

    // Método de ayuda para obtener un valor por su clave
    public static function obtener(string $clave, string $defecto = ''): string
    {
        $config = static::where('clave', $clave)->first();
        return $config ? $config->valor : $defecto;
    }

    // Método de ayuda para actualizar un valor por su clave
    public static function establecer(string $clave, string $valor): void
    {
        static::updateOrCreate(
            ['clave' => $clave],
            ['valor' => $valor]
        );
    }
}
