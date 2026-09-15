<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->decimal('price', 12, 3);
            $table->string('image_url')->nullable();

            $table->ulid('tax_id')->nullable();
            $table->foreignUlid('unit_id')->constrained('units');
            $table->ulid('category_id')->nullable();
            $table->ulid('brand_id')->nullable();

            $table->string('short_description')->nullable();
            $table->boolean('available_for_sale')->default(true);
            $table->boolean('featured')->default(false);

            // Inventory tab — display/config only, no stock ledger yet.
            $table->boolean('track_stock')->default(true);
            $table->boolean('sold_by_weight')->default(false);
            $table->boolean('track_batches')->default(false);
            $table->boolean('track_expiry')->default(false);
            $table->date('expiry_date')->nullable();
            $table->integer('reorder_at')->nullable();
            $table->integer('reorder_quantity')->nullable();

            // Cost/MRP are for margin tracking only, never used in pricing math.
            $table->decimal('cost_price', 12, 3)->nullable();
            $table->decimal('mrp', 12, 3)->nullable();
            $table->boolean('price_includes_tax')->default(false);

            // Compliance tab.
            $table->string('hsn_code')->nullable();
            $table->ulid('drug_schedule_id')->nullable();
            $table->string('generic_name')->nullable();
            $table->string('manufacturer')->nullable();

            $table->timestamps();

            $table->foreign('tax_id')->references('id')->on('tax_groups')->nullOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->foreign('brand_id')->references('id')->on('brands')->nullOnDelete();
            $table->foreign('drug_schedule_id')->references('id')->on('drug_schedules')->nullOnDelete();

            $table->index('name');
            $table->index('category_id');
            $table->index('unit_id');
            $table->index('tax_id');
            $table->index('drug_schedule_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
