<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstudianteClase extends Pivot
{
    protected $table = 'ESTUDIANTES_CLASE';
    protected $primaryKey = 'ID';
    
    // Disable default timestamps since we use FECHA_CREACION instead of created_at/updated_at
    public $timestamps = false;

    protected $fillable = [
        'ESTUDIANTE_CUP_ID',
        'ID_CLASE',
        'NOTA_FINAL',
        'ESTADO',
        'FECHA_CREACION'
    ];

    protected $casts = [
        'NOTA_FINAL' => 'decimal:2',
        'FECHA_CREACION' => 'datetime',
    ];

    public function estudianteCup(): BelongsTo
    {
        return $this->belongsTo(EstudianteCup::class, 'ESTUDIANTE_CUP_ID', 'ID');
    }

    public function clase(): BelongsTo
    {
        return $this->belongsTo(Clase::class, 'ID_CLASE', 'ID_CLASE');
    }

    public function calificaciones(): HasMany
    {
        return $this->hasMany(Calificacion::class, 'ESTUDIANTE_CLASE_ID', 'ID');
    }
}
