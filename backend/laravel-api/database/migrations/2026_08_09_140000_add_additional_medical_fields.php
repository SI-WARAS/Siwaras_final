<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            if (!Schema::hasColumn('medical_records', 'waist_circumference')) {
                $table->decimal('waist_circumference', 5, 2)->nullable()->after('height');
            }
            if (!Schema::hasColumn('medical_records', 'mental_health_score')) {
                $table->integer('mental_health_score')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'mental_health_q17')) {
                $table->boolean('mental_health_q17')->default(false);
            }
            if (!Schema::hasColumn('medical_records', 'puma_score')) {
                $table->integer('puma_score')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'dependency_level')) {
                $table->string('dependency_level', 20)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $cols = array_filter([
                'waist_circumference',
                'mental_health_score',
                'mental_health_q17',
                'puma_score',
                'dependency_level',
            ], fn($col) => Schema::hasColumn('medical_records', $col));

            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
