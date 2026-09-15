<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->foreignUlid('product_id')->constrained('products');

            $table->decimal('quantity', 12, 3);
            $table->decimal('unit_price', 12, 3);

            $table->decimal('tax_rate', 6, 3)->default(0);
            $table->decimal('tax_amount', 12, 3)->default(0);
            $table->decimal('line_total', 12, 3); // quantity * unitPrice + taxAmount

            $table->integer('sort_order')->default(0);

            $table->index('sale_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
