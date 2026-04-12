<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FichaCaracterizacion extends Model
{
    protected $table = 'fichas_caracterizacion';
    public $timestamps = false;

    protected $fillable = [
        'numero_ficha',
        'estado',
        'centro_formacion_id',
        'programa_formacion_id',
        'fecha_inicio',
        'fecha_fin',
        'activo',
    ];

    // Una ficha pertenece a un centro de formación
    public function centro(): BelongsTo
    {
        return $this->belongsTo(CentroFormacion::class, 'centro_formacion_id');
    }

    // Una ficha pertenece a un programa de formación
    public function programa(): BelongsTo
    {
        return $this->belongsTo(ProgramaFormacion::class, 'programa_formacion_id');
    }

    // Una ficha puede tener varias jornadas (mañana, tarde, noche, etc.)
    public function jornadas(): HasMany
    {
        return $this->hasMany(JornadaFicha::class, 'ficha_id');
    }

    // Los horarios semanales de esta ficha
    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class, 'ficha_id');
    }

    // Los instructores asignados a esta ficha (relación many-to-many)
    public function instructores(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'ficha_instructor',
            'ficha_id',
            'usuario_id'
        )->withPivot('es_gestor');
    }

    // El gestor del grupo de esta ficha (solo uno)
    public function gestor()
    {
        return $this->instructores()->wherePivot('es_gestor', 1)->first();
    }

    // Los aprendices de esta ficha
    public function aprendices(): HasMany
    {
        return $this->hasMany(Usuario::class, 'ficha_id')
                    ->where('rol', 'aprendiz');
    }
}
