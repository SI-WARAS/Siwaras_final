<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to ensure all required columns exist on medical_records with safe nullable defaults.
     */
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
                $table->boolean('mental_health_q17')->default(false)->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'puma_score')) {
                $table->integer('puma_score')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'dependency_level')) {
                $table->string('dependency_level', 20)->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'lila')) {
                $table->decimal('lila', 5, 2)->nullable();
            }

            // Ensure boolean columns allow nullable or default false
            if (Schema::hasColumn('medical_records', 'smoking_status')) {
                $table->boolean('smoking_status')->default(false)->nullable()->change();
            }
            if (Schema::hasColumn('medical_records', 'mental_health_q17')) {
                $table->boolean('mental_health_q17')->default(false)->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe no-op down method to preserve medical data
    }
};
