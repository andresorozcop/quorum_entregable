<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistroAsistencia extends Model
{
    protected $table = 'registros_asistencia';
    public $timestamps = false;

    protected $fillable = [
        'sesion_id',
        'usuario_id',
        'tipo',
        'horas_inasistencia',
    ];

    // El registro pertenece a una sesión
    public function sesion(): BelongsTo
    {
        return $this->belongsTo(Sesion::class, 'sesion_id');
    }

    // El aprendiz al que corresponde este registro
    public function aprendiz(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
