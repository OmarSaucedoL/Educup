<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Calificacion extends Model
{
    protected $table = 'CALIFICACIONES';
    protected $primaryKey = 'ID_CALIFICACIONES';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE',
        'PONDERACION',
        'ESTUDIANTE_CUP_ID',
        'ID_CLASE'
    ];

    protected $casts = [
        'PONDERACION' => 'decimal:2'
    ];

    public function estudianteCup(): BelongsTo
    {
        return $this->belongsTo(EstudianteCup::class, 'ESTUDIANTE_CUP_ID', 'ID');
    }

    public function clase(): BelongsTo
    {
        return $this->belongsTo(Clase::class, 'ID_CLASE', 'ID_CLASE');
    }
}
