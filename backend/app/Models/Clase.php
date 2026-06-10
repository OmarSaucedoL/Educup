<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\LogsActivity;

class Clase extends Model
{
    use LogsActivity;
    
    protected $table = 'CLASE';
    protected $primaryKey = 'ID_CLASE';
    public $timestamps = false;

    protected $fillable = [
        'ID_CUP',
        'DOCENTE_CUP_ID',
        'ID_BLOQUE_HORARIO',
        'ID_MATERIA',
        'ID_GRUPO',
        'ID_AULA'
    ];

    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class, 'ID_CUP', 'ID_CUP');
    }

    public function docenteCup(): BelongsTo
    {
        return $this->belongsTo(DocenteCup::class, 'DOCENTE_CUP_ID', 'ID');
    }

    public function bloqueHorario(): BelongsTo
    {
        return $this->belongsTo(BloqueHorario::class, 'ID_BLOQUE_HORARIO', 'ID_BLOQUE_HORARIO');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class, 'ID_MATERIA', 'ID_MATERIA');
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class, 'ID_GRUPO', 'ID_GRUPO');
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(Aula::class, 'ID_AULA', 'ID_AULA');
    }

    public function estudianteCups(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(EstudianteCup::class, 'ESTUDIANTES_CLASE', 'ID_CLASE', 'ESTUDIANTE_CUP_ID')
                    ->using(EstudianteClase::class)
                    ->withPivot(['ID', 'NOTA_FINAL', 'ESTADO', 'FECHA_CREACION']);
    }
}
