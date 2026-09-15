<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The actual thing a Product/Category is taxed with. Bundles one or
        // more TaxComponents; `rate` is the cached sum of component rates.
        Schema::create('tax_groups', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignUlid('classification_id')->constrained('tax_classifications');
            $table->decimal('rate', 6, 3); // cached sum of component rates
            $table->boolean('prices_include_tax')->default(false);
            $table->boolean('is_default')->default(false);
            $table->boolean('active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_groups');
    }
};
