<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

// Validación de query params del historial / matriz (Módulo 8)
class HistorialAsistenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $tipo = $this->input('tipo');
        if (is_string($tipo) && $tipo !== '') {
            $this->merge(['tipo' => [$tipo]]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'desde'   => ['nullable', 'date_format:Y-m-d'],
            'hasta'   => ['nullable', 'date_format:Y-m-d'],
            'tipo'    => ['nullable', 'array'],
            'tipo.*'  => ['string', Rule::in(['presente', 'falla', 'excusa', 'parcial'])],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $desde = $this->input('desde');
            $hasta = $this->input('hasta');
            if (is_string($desde) && is_string($hasta) && $hasta < $desde) {
                $v->errors()->add('hasta', 'La fecha hasta debe ser igual o posterior a la fecha desde.');
            }
        });
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'desde'   => 'fecha desde',
            'hasta'   => 'fecha hasta',
            'tipo'    => 'tipo de asistencia',
            'tipo.*'  => 'tipo de asistencia',
        ];
    }
}
