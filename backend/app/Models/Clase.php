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
        'CUP_ID',
        'MATERIA_ID',
        'GRUPO_ID',
        'AULA_ID',
        'DOCENTE_ID'
    ];

    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class, 'CUP_ID', 'ID');
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

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'DOCENTE_ID', 'CODIGO');
    }

    public function estudiantes(): BelongsToMany
    {
        return $this->belongsToMany(Estudiante::class, 'ESTUDIANTE_CLASE', 'CLASE_ID', 'ESTUDIANTE_ID')
                    ->withPivot('NOTA1', 'NOTA2', 'NOTA3', 'NOTA_PROM');
    }
}
