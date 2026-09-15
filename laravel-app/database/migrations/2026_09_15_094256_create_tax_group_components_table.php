<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Join table: which TaxComponents make up a TaxGroup.
        Schema::create('tax_group_components', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('tax_group_id')->constrained('tax_groups')->cascadeOnDelete();
            $table->foreignUlid('tax_component_id')->constrained('tax_components');

            $table->unique(['tax_group_id', 'tax_component_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_group_components');
    }
};
