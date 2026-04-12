<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorialActividad extends Model
{
    protected $table = 'historial_actividad';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'accion',
        'descripcion',
        'ip',
    ];

    // El usuario que realizó la acción registrada
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
