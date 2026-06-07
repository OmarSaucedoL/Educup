<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use App\Models\Bitacora;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configurar reglas de contraseña por defecto para todo el sistema
        Password::defaults(function () {
            return Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols();
        });

        Event::listen(Login::class, function ($event) {
            try {
                Bitacora::create([
                    'USUARIO_ID' => $event->user->ID,
                    'ACCION' => 'LOGIN',
                    'TABLA' => 'USUARIO',
                    'REGISTRO_ID' => $event->user->ID,
                    'DESCRIPCION' => "El usuario '{$event->user->USERNAME}' inició sesión con éxito.",
                    'IP_DIRECCION' => request()->ip(),
                    'FECHA_REGISTRO' => now(),
                ]);
            } catch (\Exception $e) {
                \Log::error("Error guardando bitácora de login: " . $e->getMessage());
            }
        });

        Event::listen(Logout::class, function ($event) {
            if ($event->user) {
                try {
                    Bitacora::create([
                        'USUARIO_ID' => $event->user->ID,
                        'ACCION' => 'LOGOUT',
                        'TABLA' => 'USUARIO',
                        'REGISTRO_ID' => $event->user->ID,
                        'DESCRIPCION' => "El usuario '{$event->user->USERNAME}' cerró sesión.",
                        'IP_DIRECCION' => request()->ip(),
                        'FECHA_REGISTRO' => now(),
                    ]);
                } catch (\Exception $e) {
                    \Log::error("Error guardando bitácora de logout: " . $e->getMessage());
                }
            }
        });
    }
}
