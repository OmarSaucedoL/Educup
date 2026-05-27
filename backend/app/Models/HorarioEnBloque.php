<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorarioEnBloque extends Model
{
    protected $table = 'HORARIO_EN_BLOQUE';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'HORARIO_ID',
        'BLOQUE_HORARIO_ID',
        'CARGA_HORARIA'
    ];

    public function horario(): BelongsTo
    {
        return $this->belongsTo(Horario::class, 'HORARIO_ID', 'ID');
    }

    public function bloqueHorario(): BelongsTo
    {
        return $this->belongsTo(BloqueHorario::class, 'BLOQUE_HORARIO_ID', 'ID');
    }
}
