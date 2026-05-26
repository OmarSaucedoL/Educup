<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Horario extends Model
{
    protected $table = 'HORARIO';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = ['DIA', 'HORA_INI', 'HORA_FIN'];

    public function clases(): BelongsToMany
    {
        return $this->belongsToMany(Clase::class, 'HORARIO_CLASE', 'HORARIO_ID', 'CLASE_ID');
    }
}