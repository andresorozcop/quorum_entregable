<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacionAprendices extends Model
{
    protected $table = 'importaciones_aprendices';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'ficha_id',
        'nombre_archivo',
        'total_registros',
        'exitosos',
        'fallidos',
        'errores',
    ];

    protected $casts = [
        // El campo errores es JSON — Eloquent lo convierte automáticamente a array
        'errores' => 'array',
    ];

    // El admin que realizó la importación
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // La ficha a la que se importaron los aprendices
    public function ficha(): BelongsTo
    {
        return $this->belongsTo(FichaCaracterizacion::class, 'ficha_id');
    }
}
