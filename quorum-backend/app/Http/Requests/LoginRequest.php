<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Validación del formulario de login para staff (admin, coordinador, instructor, gestor_grupo)
// Requiere correo, contraseña y token de reCAPTCHA v2
class LoginRequest extends FormRequest
{
    // Todos pueden intentar hacer login (ruta pública)
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'correo'          => ['required', 'email', 'max:150'],
            'password'        => ['required', 'string', 'max:255'],
            'recaptcha_token' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'correo.required'          => 'El correo es obligatorio.',
            'correo.email'             => 'El formato del correo no es válido.',
            'password.required'        => 'La contraseña es obligatoria.',
            'recaptcha_token.required' => 'Por favor, completa el reCAPTCHA.',
        ];
    }
}
