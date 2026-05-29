<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BloqueHorario extends Model
{
    protected $table = 'BLOQUE_HORARIO';
    protected $primaryKey = 'ID_BLOQUE_HORARIO';
    public $timestamps = false;

    protected $fillable = [
        'TURNO'
    ];

    public function horariosEnBloque(): HasMany
    {
        return $this->hasMany(HorarioEnBloque::class, 'ID_BLOQUE_HORARIO', 'ID_BLOQUE_HORARIO');
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'ID_BLOQUE_HORARIO', 'ID_BLOQUE_HORARIO');
    }
}
