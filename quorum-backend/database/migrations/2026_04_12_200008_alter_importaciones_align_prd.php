<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Alineación con PRD §5 tabla importaciones_aprendices:
// La tabla M0 NO creó las FK reales (solo tenía índices sueltos)
// Cambios:
// 1. Renombrar usuario_id → importado_por (con CHANGE COLUMN para MariaDB)
// 2. Renombrar índice y crear FK reales según PRD
// La columna errores JSON extra se mantiene (aporta utilidad, PRD no la prohíbe)
return new class extends Migration
{
    public function up(): void
    {
        // Eliminar índice suelto sobre usuario_id (si existe) antes de renombrar
        $hasIdxUsuario = DB::select("
            SELECT INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA='quorum' AND TABLE_NAME='importaciones_aprendices'
            AND INDEX_NAME='importaciones_aprendices_usuario_id_foreign'
            LIMIT 1
        ");
        if ($hasIdxUsuario) {
            DB::statement('ALTER TABLE importaciones_aprendices DROP INDEX `importaciones_aprendices_usuario_id_foreign`');
        }

        // Renombrar columna usuario_id → importado_por (CHANGE COLUMN para MariaDB)
        DB::statement('ALTER TABLE importaciones_aprendices CHANGE COLUMN usuario_id importado_por BIGINT(20) UNSIGNED NOT NULL');

        // Crear las FK reales según PRD (que M0 nunca creó)
        Schema::table('importaciones_aprendices', function (Blueprint $table) {
            // ficha_id → CASCADE según PRD
            $table->foreign('ficha_id')
                  ->references('id')
                  ->on('fichas_caracterizacion')
                  ->cascadeOnDelete();

            // importado_por → RESTRICT según PRD
            $table->foreign('importado_por')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('importaciones_aprendices', function (Blueprint $table) {
            $table->dropForeign(['importado_por']);
            $table->dropForeign(['ficha_id']);
        });

        DB::statement('ALTER TABLE importaciones_aprendices CHANGE COLUMN importado_por usuario_id BIGINT(20) UNSIGNED NOT NULL');

        Schema::table('importaciones_aprendices', function (Blueprint $table) {
            $table->index('usuario_id', 'importaciones_aprendices_usuario_id_foreign');
        });
    }
};
