<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Docente extends Model
{
    protected $table = 'DOCENTE';
    protected $primaryKey = 'CODIGO';
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'CODIGO'
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'CODIGO', 'ID');
    }

    public function clases(): HasMany
    {
        return $this->hasMany(Clase::class, 'DOCENTE_ID', 'CODIGO');
    }
}
