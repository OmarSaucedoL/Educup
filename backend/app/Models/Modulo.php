<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Modulo extends Model
{
    protected $table = 'MODULO';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'NOMBRE'
    ];

    public function permisos(): HasMany
    {
        return $this->hasMany(Permiso::class, 'MODULO_ID', 'ID');
    }
}
