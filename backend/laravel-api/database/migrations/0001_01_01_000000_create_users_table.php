<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedukuhans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('username')->unique();
            $table->string('password');
            $table->string('name');
            $table->enum('role', ['ADMIN', 'VILLAGE_HEAD', 'HEALTH_WORKER'])->default('HEALTH_WORKER');
            $table->uuid('pedukuhan_id')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('pedukuhan_id')->references('id')->on('pedukuhans')->nullOnDelete();
        });

        Schema::create('patients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nik', 20)->nullable()->unique();
            $table->string('name');
            $table->integer('age');
            $table->enum('gender', ['MALE', 'FEMALE']);
            $table->text('address');
            $table->string('phone', 20)->nullable();
            $table->uuid('pedukuhan_id')->nullable();
            $table->timestamps();

            $table->foreign('pedukuhan_id')->references('id')->on('pedukuhans')->nullOnDelete();
        });

        Schema::create('medical_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('patient_id');
            $table->date('date');
            $table->string('blood_pressure', 20)->nullable();
            $table->decimal('blood_sugar', 8, 2)->nullable();
            $table->decimal('cholesterol', 8, 2)->nullable();
            $table->decimal('uric_acid', 8, 2)->nullable();
            $table->decimal('weight', 6, 2)->nullable();
            $table->decimal('height', 6, 2)->nullable();
            $table->boolean('smoking_status')->default(false);
            $table->enum('activity_level', ['rendah', 'sedang', 'tinggi'])->nullable();
            $table->text('notes')->nullable();
            $table->decimal('bmi', 6, 2)->nullable();
            $table->string('blood_pressure_status', 20)->nullable();
            $table->string('blood_sugar_status', 20)->nullable();
            $table->string('cholesterol_status', 20)->nullable();
            $table->string('uric_acid_status', 20)->nullable();
            $table->boolean('is_risk')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('users');
        Schema::dropIfExists('pedukuhans');
    }
};
