<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\LogsActivity;

class Docente extends Model
{
    use LogsActivity;
    protected $table = 'DOCENTE';
    protected $primaryKey = 'CODIGO_DOCENTE';
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'CODIGO_DOCENTE'
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'CODIGO_DOCENTE', 'ID');
    }

    public function docenteCups(): HasMany
    {
        return $this->hasMany(DocenteCup::class, 'CODIGO_DOCENTE', 'CODIGO_DOCENTE');
    }
}
