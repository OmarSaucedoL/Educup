<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MateriaCup extends Model
{
    protected $table = 'MATERIA_CUP';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'ID_CUP',
        'ID_MATERIA'
    ];

    public function cup(): BelongsTo
    {
        return $this->belongsTo(Cup::class, 'ID_CUP', 'ID_CUP');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class, 'ID_MATERIA', 'ID_MATERIA');
    }
}
