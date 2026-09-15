<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A unit products are sold/measured by (pcs, kg, L...).
        Schema::create('units', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('short_code')->unique();
            $table->string('display_name');
            $table->foreignUlid('measurement_category_id')->constrained('unit_categories');
            $table->ulid('base_unit_id')->nullable();
            $table->decimal('conversion_factor', 18, 6)->nullable();
            $table->boolean('active')->default(true);

            $table->index('measurement_category_id');
        });

        // Self-referencing FK added after creation — Postgres can't validate
        // a self-reference against the table's own PK within one CREATE TABLE.
        Schema::table('units', function (Blueprint $table) {
            $table->foreign('base_unit_id')->references('id')->on('units')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
