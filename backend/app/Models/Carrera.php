<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Carrera extends Model
{
    protected $table = 'CARRERA';
    protected $primaryKey = 'ID_CARRERA';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE'
    ];

    public function carreraCups(): HasMany
    {
        return $this->hasMany(CarreraCup::class, 'ID_CARRERA', 'ID_CARRERA');
    }

    public function estudiantes(): BelongsToMany
    {
        return $this->belongsToMany(Estudiante::class, 'CARRERA_EST', 'ID_CARRERA', 'ID_ESTUDIANTE')
                    ->withPivot('OPCION');
    }
}
