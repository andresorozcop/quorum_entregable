<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiaFestivo extends Model
{
    protected $table = 'dias_festivos';
    public $timestamps = false;

    protected $fillable = [
        'fecha',
        'descripcion',
        'activo',
    ];
}
