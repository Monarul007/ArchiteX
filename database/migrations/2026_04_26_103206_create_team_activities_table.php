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
        Schema::create('team_activities', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->char('team_member_id', 26)->constrained('team_members')->cascadeOnDelete();
            $table->string('action')->nullable();
            $table->string('log_type')->nullable();
            $table->text('log_type_title')->nullable();
            $table->string('project_title')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_activities');
    }
};
