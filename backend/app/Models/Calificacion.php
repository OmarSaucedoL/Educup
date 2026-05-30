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
        'CALIFICACION',
        'PONDERACION',
        'ESTUDIANTE_CLASE_ID'
    ];

    protected $casts = [
        'PONDERACION' => 'decimal:2',
        'CALIFICACION' => 'decimal:1'
    ];

    public function estudianteClase(): BelongsTo
    {
        return $this->belongsTo(EstudianteClase::class, 'ESTUDIANTE_CLASE_ID', 'ID');
    }
}
