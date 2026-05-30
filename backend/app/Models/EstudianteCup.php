<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstudianteCup extends Model
{
    protected $table = 'ESTUDIANTE_CUP';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'ID_ESTUDIANTE',
        'ID_CUP',
        'FECHA',
        'ESTADO',
        'NOTA_FINAL',
        'CARRERA'
    ];

    protected $casts = [
        'FECHA' => 'date'
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'ID_ESTUDIANTE', 'ID_ESTUDIANTE');
    }

    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class, 'ID_CUP', 'ID_CUP');
    }

    public function opcionesCarrera(): HasMany
    {
        return $this->hasMany(OpcionCarrera::class, 'ESTUDIANTE_CUP_ID', 'ID');
    }

    public function clases(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Clase::class, 'ESTUDIANTES_CLASE', 'ESTUDIANTE_CUP_ID', 'ID_CLASE')
                    ->using(EstudianteClase::class)
                    ->withPivot(['ID', 'NOTA_FINAL', 'ESTADO', 'FECHA_CREACION']);
    }
}
