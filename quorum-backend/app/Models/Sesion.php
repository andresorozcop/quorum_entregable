<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sesion extends Model
{
    protected $table = 'sesiones';
    public $timestamps = false;

    protected $fillable = [
        'horario_id',
        'fecha',
        'estado',
        'tomado_por',
    ];

    // La sesión pertenece a un horario
    public function horario(): BelongsTo
    {
        return $this->belongsTo(Horario::class, 'horario_id');
    }

    // El instructor que tomó la asistencia en esta sesión
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'tomado_por');
    }

    // Los registros de asistencia de todos los aprendices en esta sesión
    public function registros(): HasMany
    {
        return $this->hasMany(RegistroAsistencia::class, 'sesion_id');
    }
}
