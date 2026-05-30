<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Traits\LogsActivity;

class Usuario extends Authenticatable
{
    use Notifiable, LogsActivity;

    protected $table = 'USUARIO';
    protected $primaryKey = 'ID';

    protected $appends = ['name', 'email'];

    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->NOMBRE . ' ' . $this->APELLIDO,
        );
    }

    protected function email(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->CORREO,
        );
    }

    public function setCorreoAttribute($value)
    {
        $this->attributes['CORREO'] = strtolower(trim($value));
    }

    public function getAuthPasswordName()
    {
        return 'CONTRASENIA';
    }

    public function getAuthPassword()
    {
        return $this->CONTRASENIA;
    }

    public function getRememberTokenName()
    {
        return 'REMEMBER_TOKEN';
    }
    
    public $timestamps = false;

    protected $fillable = [
        'USERNAME',
        'CONTRASENIA',
        'CARNET',
        'NOMBRE',
        'APELLIDO',
        'CORREO',
        'ESTADO',
        'FECHA_CREACION',
        'ROL_ID'
    ];

    protected $casts = [
        'FECHA_CREACION' => 'datetime'
    ];

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'ROL_ID', 'ID');
    }

    public function permisos(): BelongsToMany
    {
        return $this->belongsToMany(Permiso::class, 'PERMISOS_USUARIO', 'USUARIO_ID', 'PERMISOS_ID')
                    ->withPivot('ESTADO', 'FECHA_MOD');
    }

    public function cups(): HasMany
    {
        return $this->hasMany(Cup::class, 'USUARIO_ID', 'ID');
    }

    public function docente(): HasOne
    {
        return $this->hasOne(Docente::class, 'CODIGO', 'ID');
    }
}
