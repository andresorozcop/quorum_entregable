<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Servicio para verificar tokens de reCAPTCHA v2 contra la API de Google
class RecaptchaService
{
    // URL de verificación de reCAPTCHA de Google
    private const URL_VERIFICACION = 'https://www.google.com/recaptcha/api/siteverify';

    // Devuelve true si el token es válido, false si no
    public function verificar(string $token, string $ip): bool
    {
        try {
            $respuesta = Http::asForm()->post(self::URL_VERIFICACION, [
                'secret'   => config('services.recaptcha.secret'),
                'response' => $token,
                'remoteip' => $ip,
            ]);

            if (!$respuesta->successful()) {
                Log::warning('reCAPTCHA: error al contactar el servidor de Google');
                return false;
            }

            $datos = $respuesta->json();

            return isset($datos['success']) && $datos['success'] === true;
        } catch (\Throwable $e) {
            // Si falla la conexión con Google, registramos el error pero no bloqueamos el sistema
            Log::error('reCAPTCHA: excepción al verificar token — ' . $e->getMessage());
            return false;
        }
    }
}
