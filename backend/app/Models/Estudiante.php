<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estudiante extends Model
{
    protected $table = 'ESTUDIANTE';
    protected $primaryKey = 'ID_ESTUDIANTE';
    public $timestamps = false;

    protected $fillable = [
        'CARNET',
        'NOMBRE',
        'APELLIDO',
        'FECHA_NAC',
        'DIRECCION',
        'TELEFONO',
        'CORREO',
        'TITULO_BACHILLER',
        'SEXO',
        'ESTADO',
        'COLEGIO_ID',
        'CIUDAD_ID'
    ];

    protected $casts = [
        'FECHA_NAC' => 'date',
    ];

    public function colegio(): BelongsTo
    {
        return $this->belongsTo(Colegio::class, 'COLEGIO_ID', 'ID');
    }

    public function ciudad(): BelongsTo
    {
        return $this->belongsTo(Ciudad::class, 'CIUDAD_ID', 'ID');
    }

    public function carreras(): BelongsToMany
    {
        return $this->belongsToMany(Carrera::class, 'CARRERA_EST', 'ID_ESTUDIANTE', 'ID_CARRERA')
                    ->withPivot('OPCION');
    }

    public function estudianteCups(): HasMany
    {
        return $this->hasMany(EstudianteCup::class, 'ID_ESTUDIANTE', 'ID_ESTUDIANTE');
    }
}
