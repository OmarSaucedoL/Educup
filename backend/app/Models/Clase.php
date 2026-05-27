<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Clase extends Model
{
    protected $table = 'CLASE';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'DOCENTE_CUP_ID',
        'BLOQUE_HORARIO_ID',
        'MATERIA_ID',
        'GRUPO_ID',
        'AULA_ID'
    ];

    public function docenteCup(): BelongsTo
    {
        return $this->belongsTo(DocenteCup::class, 'DOCENTE_CUP_ID', 'ID');
    }

    public function bloqueHorario(): BelongsTo
    {
        return $this->belongsTo(BloqueHorario::class, 'BLOQUE_HORARIO_ID', 'ID');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class, 'MATERIA_ID', 'ID');
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class, 'GRUPO_ID', 'ID');
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(Aula::class, 'AULA_ID', 'ID');
    }

    public function calificaciones(): HasMany
    {
        return $this->hasMany(Calificacion::class, 'CLASE_ID', 'ID');
    }
}
