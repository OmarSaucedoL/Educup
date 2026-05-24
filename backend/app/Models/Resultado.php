<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resultado extends Model
{
    protected $table = 'RESULTADO';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'ESTUDIANTE_ID',
        'NOTA_FINAL',
        'CARRERA'
    ];

    protected $casts = [
        'NOTA_FINAL' => 'decimal:2'
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'ESTUDIANTE_ID', 'ID');
    }
}
