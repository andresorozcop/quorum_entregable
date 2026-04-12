<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginAprendizRequest;
use App\Http\Requests\LoginRequest;
use App\Models\IntentoLogin;
use App\Models\Usuario;
use App\Services\RecaptchaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

// Controlador de autenticación — maneja los dos flujos de login y el logout
class AuthController extends Controller
{
    // Número máximo de intentos fallidos antes de bloquear
    private const MAX_INTENTOS = 5;
    // Minutos de ventana para contar intentos fallidos
    private const MINUTOS_BLOQUEO = 15;

    // -------------------------------------------------------------------------
    // Login para staff: admin, coordinador, instructor, gestor_grupo
    // Requiere correo + contraseña + reCAPTCHA
    // -------------------------------------------------------------------------
    public function login(LoginRequest $request, RecaptchaService $recaptcha): JsonResponse
    {
        $correo = $request->input('correo');
        $ip     = $request->ip();

        // Verificamos si el correo está bloqueado por exceso de intentos fallidos
        $intentosRecientes = IntentoLogin::recientesFallidos($correo, self::MINUTOS_BLOQUEO)->count();

        if ($intentosRecientes >= self::MAX_INTENTOS) {
            return response()->json([
                'message' => 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.',
            ], 429);
        }

        // Verificamos que el token de reCAPTCHA sea válido
        if (!$recaptcha->verificar($request->input('recaptcha_token'), $ip)) {
            return response()->json([
                'message' => 'La verificación reCAPTCHA no es válida. Por favor, inténtalo de nuevo.',
            ], 422);
        }

        // Buscamos al usuario por correo
        $usuario = Usuario::where('correo', $correo)->first();

        // Si el usuario no existe o está inactivo, registramos intento fallido
        // Mensaje genérico para no revelar si el correo existe o no
        if (!$usuario || $usuario->activo == 0) {
            $this->registrarIntento($correo, $ip, false);

            // Mensaje especial para cuentas desactivadas (sin revelar la existencia del correo)
            if ($usuario && $usuario->activo == 0) {
                return response()->json([
                    'message' => 'Tu cuenta está desactivada. Comunícate con el administrador.',
                ], 401);
            }

            return response()->json([
                'message' => 'Las credenciales no son correctas.',
            ], 401);
        }

        // Aprendices u otros sin contraseña no pueden usar este flujo (evita Hash::check con null)
        if (empty($usuario->password)) {
            $this->registrarIntento($correo, $ip, false);

            return response()->json([
                'message' => 'Las credenciales no son correctas.',
            ], 401);
        }

        // Verificamos que la contraseña sea correcta
        if (!Hash::check($request->input('password'), $usuario->password)) {
            $this->registrarIntento($correo, $ip, false);

            return response()->json([
                'message' => 'Las credenciales no son correctas.',
            ], 401);
        }

        // Login exitoso — registramos el intento, autenticamos en el guard web y regeneramos sesión
        $this->registrarIntento($correo, $ip, true);
        Auth::guard('web')->login($usuario, false);
        $request->session()->regenerate();

        return response()->json([
            'usuario' => [
                'id'               => $usuario->id,
                'nombre'           => $usuario->nombre,
                'apellido'         => $usuario->apellido,
                'correo'           => $usuario->correo,
                'rol'              => $usuario->rol,
                'avatar_color'     => $usuario->avatar_color,
                // El frontend usa este flag para decidir si ir a /2fa/configurar o /2fa/verificar
                'totp_configurado' => (bool) $usuario->totp_verificado,
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // Login para aprendices: correo + documento (cédula)
    // Sin reCAPTCHA, sin 2FA
    // -------------------------------------------------------------------------
    public function loginAprendiz(LoginAprendizRequest $request): JsonResponse
    {
        $correo    = $request->input('correo');
        $documento = $request->input('documento');
        $ip        = $request->ip();

        // Buscamos al usuario que sea aprendiz con ese correo y documento
        $usuario = Usuario::where('correo', $correo)
            ->where('rol', 'aprendiz')
            ->first();

        // Mensaje genérico para no revelar qué campo falló
        if (!$usuario) {
            return response()->json([
                'message' => 'Las credenciales no son correctas.',
            ], 401);
        }

        if ($usuario->activo == 0) {
            return response()->json([
                'message' => 'Tu cuenta está desactivada. Comunícate con el administrador.',
            ], 401);
        }

        // Verificamos que el documento coincida (es la "contraseña" del aprendiz)
        if ($usuario->documento !== $documento) {
            return response()->json([
                'message' => 'Las credenciales no son correctas.',
            ], 401);
        }

        // Login exitoso — autenticamos en el guard web y regeneramos la sesión
        Auth::guard('web')->login($usuario, false);
        $request->session()->regenerate();

        return response()->json([
            'usuario' => [
                'id'           => $usuario->id,
                'nombre'       => $usuario->nombre,
                'apellido'     => $usuario->apellido,
                'correo'       => $usuario->correo,
                'rol'          => $usuario->rol,
                'ficha_id'     => $usuario->ficha_id,
                'avatar_color' => $usuario->avatar_color,
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // Logout — cierra la sesión del usuario autenticado
    // -------------------------------------------------------------------------
    public function logout(Request $request): JsonResponse
    {
        // Cerramos sesión en el guard, invalidamos la sesión y renovamos el token CSRF
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    // -------------------------------------------------------------------------
    // Me — retorna los datos del usuario actualmente autenticado
    // -------------------------------------------------------------------------
    public function me(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'message' => 'No autenticado.',
            ], 401);
        }

        return response()->json([
            'usuario' => [
                'id'               => $usuario->id,
                'nombre'           => $usuario->nombre,
                'apellido'         => $usuario->apellido,
                'correo'           => $usuario->correo,
                'documento'        => $usuario->documento,
                'rol'              => $usuario->rol,
                'ficha_id'         => $usuario->ficha_id,
                'avatar_color'     => $usuario->avatar_color,
                'activo'           => $usuario->activo,
                'totp_configurado' => (bool) $usuario->totp_verificado,
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // Registra un intento de login en la tabla intentos_login
    // -------------------------------------------------------------------------
    private function registrarIntento(string $correo, string $ip, bool $exitoso): void
    {
        IntentoLogin::create([
            'correo'  => $correo,
            'ip'      => $ip,
            'exitoso' => $exitoso ? 1 : 0,
        ]);
    }
}
