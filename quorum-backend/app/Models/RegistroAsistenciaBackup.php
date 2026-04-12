<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Modelo de auditoría — guarda el estado anterior de registros de asistencia
class RegistroAsistenciaBackup extends Model
{
    protected $table = 'registros_asistencia_backup';
    public $timestamps = false;

    protected $fillable = [
        'registro_original_id',
        'sesion_id',
        'usuario_id',
        'tipo',
        'horas_inasistencia',
        'modificado_por',
    ];

    // La sesión a la que pertenece este backup
    public function sesion(): BelongsTo
    {
        return $this->belongsTo(Sesion::class, 'sesion_id');
    }

    // El aprendiz del registro original
    public function aprendiz(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // El instructor que hizo el cambio
    public function modificadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'modificado_por');
    }
}
