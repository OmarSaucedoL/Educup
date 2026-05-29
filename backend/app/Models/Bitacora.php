<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bitacora extends Model
{
    protected $table = 'BITACORA';
    protected $primaryKey = 'ID_BITACORA';
    
    public $timestamps = false;

    protected $fillable = [
        'USUARIO_ID',
        'ACCION',
        'TABLA',
        'REGISTRO_ID',
        'DESCRIPCION',
        'IP_DIRECCION',
        'FECHA_REGISTRO',
    ];

    protected $casts = [
        'FECHA_REGISTRO' => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'USUARIO_ID', 'ID');
    }
}
