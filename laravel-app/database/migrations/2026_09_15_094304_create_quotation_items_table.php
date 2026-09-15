<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('quotation_id')->constrained('quotations')->cascadeOnDelete();
            $table->foreignUlid('product_id')->constrained('products');

            $table->decimal('quantity', 12, 3);
            $table->decimal('unit_price', 12, 3);

            $table->string('discount_type')->default('FIXED');
            $table->decimal('discount_value', 12, 3)->default(0);

            $table->decimal('tax_rate', 6, 3)->default(0);

            $table->decimal('subtotal', 12, 3); // quantity * unitPrice - lineDiscount
            $table->decimal('tax_amount', 12, 3)->default(0);
            $table->decimal('line_total', 12, 3); // subtotal + taxAmount

            $table->integer('sort_order')->default(0);

            $table->index('quotation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
    }
};
