<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarreraCup extends Model
{
    protected $table = 'CARRERA_CUP';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'CARRERA_ID',
        'CUP_ID',
        'CUPOS'
    ];

    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class, 'CARRERA_ID', 'ID');
    }

    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class, 'CUP_ID', 'ID');
    }

    public function opcionesCarrera(): HasMany
    {
        return $this->hasMany(OpcionCarrera::class, 'CARRERA_CUP_ID', 'ID');
    }
}
