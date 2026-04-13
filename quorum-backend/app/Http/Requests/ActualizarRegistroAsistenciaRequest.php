<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Corrección de una fila de asistencia (auditoría en backup)
class ActualizarRegistroAsistenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'tipo'                 => ['required', 'string', 'in:presente,falla,excusa,parcial'],
            'horas_inasistencia'   => ['nullable', 'integer', 'min:1'],
            'razon'                => ['nullable', 'string', 'max:255'],
        ];
    }
}
