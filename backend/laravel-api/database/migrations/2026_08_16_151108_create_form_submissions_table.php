<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('form_submissions')) {
            Schema::create('form_submissions', function (Blueprint $table) {
                $table->id();
                $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->string('form_name');
                $table->json('form_data');
                $table->string('status');
                $table->string('icon_type')->nullable();
                $table->string('color')->nullable();
                $table->string('bg_color')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};
