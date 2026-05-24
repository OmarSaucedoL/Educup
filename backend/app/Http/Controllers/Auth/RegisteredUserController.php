<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.\App\Models\Usuario::class.',CORREO',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Separar el nombre completo para que encaje en NOMBRE y APELLIDO
        $nameParts = explode(' ', $request->name, 2);
        $nombre = $nameParts[0];
        $apellido = $nameParts[1] ?? '';

        // Asignar un rol por defecto (ej. ESTUDIANTE)
        $rol = \App\Models\Rol::firstOrCreate(['NOMBRE' => 'ESTUDIANTE']);

        $user = \App\Models\Usuario::create([
            'USERNAME' => explode('@', $request->email)[0], // Generar un username basado en el correo
            'CONTRASENIA' => Hash::make($request->password),
            'CARNET' => rand(1000000, 9999999), // Carnet temporal generado al azar
            'NOMBRE' => $nombre,
            'APELLIDO' => $apellido,
            'CORREO' => $request->email,
            'ESTADO' => 'ACTIVO',
            'ROL_ID' => $rol->ID,
            'FECHA_CREACION' => now(),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}
