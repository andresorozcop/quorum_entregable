<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Cierre de asistencia: un registro por aprendiz
class GuardarAsistenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'registros'                  => ['required', 'array', 'min:1'],
            'registros.*.aprendiz_id'    => ['required', 'integer', 'exists:usuarios,id'],
            'registros.*.tipo'           => ['required', 'string', 'in:presente,falla,excusa,parcial'],
            'registros.*.horas_inasistencia' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
