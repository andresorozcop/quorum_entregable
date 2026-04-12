<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntentoLogin extends Model
{
    protected $table = 'intentos_login';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'correo',
        'ip',
        'exitoso',
    ];

    // El usuario que intentó iniciar sesión (puede ser null)
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
