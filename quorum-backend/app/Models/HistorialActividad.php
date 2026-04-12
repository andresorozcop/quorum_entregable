<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Auditoría general del sistema — registra cualquier acción relevante
// usuario_id es nullable: permite registrar eventos sin usuario autenticado
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

    // El usuario que realizó la acción (puede ser null para eventos del sistema)
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // Helper estático para registrar una acción fácilmente desde cualquier controlador
    public static function registrar(string $accion, ?int $usuarioId = null, ?string $descripcion = null, ?string $ip = null): void
    {
        static::create([
            'accion'      => $accion,
            'usuario_id'  => $usuarioId,
            'descripcion' => $descripcion,
            'ip'          => $ip ?? request()->ip(),
        ]);
    }
}
