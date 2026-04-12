<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // Creamos los usuarios de prueba del sistema QUORUM
        // Contraseñas hasheadas con bcrypt — nunca guardar en texto plano

        // Usuario administrador del sistema
        Usuario::create([
            'nombre'     => 'Admin',
            'apellido'   => 'QUORUM',
            'documento'  => '1000000001',
            'correo'     => 'admin@quorum.sena.edu.co',
            'password'   => Hash::make('Admin1234*'),
            'rol'        => 'admin',
            'activo'     => 1,
            'avatar_color' => '#7B1FA2',
        ]);

        // Coordinador académico — solo lectura de todas las fichas
        Usuario::create([
            'nombre'     => 'Coordinador',
            'apellido'   => 'Prueba',
            'documento'  => '1000000002',
            'correo'     => 'coordinador@quorum.sena.edu.co',
            'password'   => Hash::make('Coord1234*'),
            'rol'        => 'coordinador',
            'activo'     => 1,
            'avatar_color' => '#1565C0',
        ]);

        // Instructor — puede tomar asistencia en sus días asignados
        Usuario::create([
            'nombre'     => 'Instructor',
            'apellido'   => 'Prueba',
            'documento'  => '1000000003',
            'correo'     => 'instructor@quorum.sena.edu.co',
            'password'   => Hash::make('Inst1234*'),
            'rol'        => 'instructor',
            'activo'     => 1,
            'avatar_color' => '#2E7D22',
        ]);

        // Aprendiz — login con correo + cédula (sin contraseña)
        Usuario::create([
            'nombre'     => 'Aprendiz',
            'apellido'   => 'Prueba',
            'documento'  => '1000000004',
            'correo'     => 'aprendiz@quorum.sena.edu.co',
            'password'   => null,   // Los aprendices no tienen contraseña
            'rol'        => 'aprendiz',
            'activo'     => 1,
            'avatar_color' => '#616161',
        ]);
    }
}
