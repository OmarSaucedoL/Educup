<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocenteCup extends Model
{
    protected $table = 'DOCENTE_CUP';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'DOCENTE_CODIGO',
        'CUP_ID',
        'FECHA_CREACION'
    ];

    protected $casts = [
        'FECHA_CREACION' => 'date'
    ];

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'DOCENTE_CODIGO', 'CODIGO');
    }

    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class, 'CUP_ID', 'ID');
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'DOCENTE_CUP_ID', 'ID');
    }
}
