<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Alta de centro de formación — solo admin
class StoreCentroFormacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:150'],
            'codigo' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del centro es obligatorio.',
        ];
    }
}
