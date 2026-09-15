<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Country-scoped regulatory drug schedule (OTC, Schedule H, H1, X...).
        Schema::create('drug_schedules', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('short_code');
            $table->string('country', 2); // ISO-2, e.g. "IN", "US"
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);

            $table->unique(['short_code', 'country']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drug_schedules');
    }
};
