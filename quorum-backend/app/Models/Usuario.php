<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

// Modelo principal de usuarios — extiende Authenticatable para que Sanctum funcione
// Cubre todos los roles: admin, coordinador, instructor, gestor_grupo, aprendiz
class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';
    public $timestamps = false;

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'nombre',
        'apellido',
        'documento',
        'correo',
        'password',
        'rol',
        'activo',
        'ficha_id',
        'totp_secret',
        'totp_verificado',
        'avatar_color',
    ];

    // Campos que NO se deben mostrar en respuestas JSON (por seguridad)
    protected $hidden = [
        'password',
        'totp_secret',
    ];

    // Usamos 'correo' como campo de autenticación (en lugar de 'email')
    public function getAuthIdentifierName(): string
    {
        return 'correo';
    }

    // Los aprendices pertenecen a una sola ficha
    public function ficha(): BelongsTo
    {
        return $this->belongsTo(FichaCaracterizacion::class, 'ficha_id');
    }

    // Los instructores pueden estar asignados a varias fichas
    public function fichasComoInstructor(): BelongsToMany
    {
        return $this->belongsToMany(
            FichaCaracterizacion::class,
            'ficha_instructor',
            'usuario_id',
            'ficha_id'
        )->withPivot('es_gestor');
    }

    // Las sesiones que tomó este instructor
    public function sesiones(): HasMany
    {
        return $this->hasMany(Sesion::class, 'tomado_por');
    }

    // Los registros de asistencia de este aprendiz
    public function registrosAsistencia(): HasMany
    {
        return $this->hasMany(RegistroAsistencia::class, 'usuario_id');
    }

    // Los intentos de login de este usuario
    public function intentosLogin(): HasMany
    {
        return $this->hasMany(IntentoLogin::class, 'usuario_id');
    }

    // Tokens de recuperación de contraseña
    public function tokensReset(): HasMany
    {
        return $this->hasMany(TokenReset::class, 'usuario_id');
    }

    // Historial de actividad
    public function historialActividad(): HasMany
    {
        return $this->hasMany(HistorialActividad::class, 'usuario_id');
    }
}
