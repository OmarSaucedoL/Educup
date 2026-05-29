<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarreraCup extends Model
{
    protected $table = 'CARRERA_CUP';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'ID_CARRERA',
        'ID_CUP',
        'CUPOS'
    ];

    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class, 'ID_CARRERA', 'ID_CARRERA');
    }

    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class, 'ID_CUP', 'ID_CUP');
    }

    public function opcionesCarrera(): HasMany
    {
        return $this->hasMany(OpcionCarrera::class, 'CARRERA_CUP_ID', 'ID');
    }
}
