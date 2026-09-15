<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Atomic tax rate (e.g. "CGST 9%"), combined into TaxGroups. Never
        // applied to a Product/Category directly.
        Schema::create('tax_components', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->decimal('rate', 6, 3); // percentage, e.g. 9.000 = 9%
            $table->boolean('active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_components');
    }
};
