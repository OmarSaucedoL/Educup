<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BloqueHorario extends Model
{
    protected $table = 'BLOQUE_HORARIO';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'TURNO'
    ];

    public function horariosEnBloque(): HasMany
    {
        return $this->hasMany(HorarioEnBloque::class, 'BLOQUE_HORARIO_ID', 'ID');
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'BLOQUE_HORARIO_ID', 'ID');
    }
}
