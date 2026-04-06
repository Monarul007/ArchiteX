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
        Schema::table('blueprints', function (Blueprint $table) {
            $table->longText('master_plan')->nullable()->after('implementation_plan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blueprints', function (Blueprint $table) {
            $table->dropColumn('master_plan');
        });
    }
};
