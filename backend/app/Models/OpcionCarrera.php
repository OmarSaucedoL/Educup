<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpcionCarrera extends Model
{
    protected $table = 'OPCION_CARRERA';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'ESTUDIANTE_CUP_ID',
        'CARRERA_CUP_ID',
        'OPCION'
    ];

    public function estudianteCup(): BelongsTo
    {
        return $this->belongsTo(EstudianteCup::class, 'ESTUDIANTE_CUP_ID', 'ID');
    }

    public function carreraCup(): BelongsTo
    {
        return $this->belongsTo(CarreraCup::class, 'CARRERA_CUP_ID', 'ID');
    }
}
