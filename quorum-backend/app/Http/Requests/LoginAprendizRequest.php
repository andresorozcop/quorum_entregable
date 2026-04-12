<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Validación del formulario de login para aprendices
// Correo + documento (cédula) + reCAPTCHA v2 — sin contraseña, sin 2FA
class LoginAprendizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'correo'          => ['required', 'email', 'max:150'],
            'documento'       => ['required', 'string', 'max:20'],
            'recaptcha_token' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'correo.required'    => 'El correo es obligatorio.',
            'correo.email'       => 'El formato del correo no es válido.',
            'documento.required'       => 'El número de documento es obligatorio.',
            'recaptcha_token.required' => 'Por favor, completa el reCAPTCHA.',
        ];
    }
}
