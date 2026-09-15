<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('number')->unique(); // e.g. QT-000001

            $table->foreignUlid('store_id')->constrained('stores');
            $table->foreignId('created_by_id')->constrained('users');

            // Either an existing Customer OR walk-in "prospect" details, never both.
            $table->ulid('customer_id')->nullable();
            $table->string('prospect_name')->nullable();
            $table->string('prospect_email')->nullable();
            $table->string('prospect_phone')->nullable();

            $table->text('billing_address')->nullable();
            $table->text('shipping_address')->nullable();

            $table->date('issue_date');
            $table->date('valid_until')->nullable();
            $table->date('expected_delivery_date')->nullable();

            $table->text('terms_and_conditions')->nullable();
            $table->text('customer_notes')->nullable();

            $table->string('status')->default('DRAFT');

            $table->string('discount_type')->default('FIXED');
            $table->decimal('discount_value', 12, 3)->default(0);

            $table->decimal('subtotal', 12, 3)->default(0);
            $table->decimal('discount_total', 12, 3)->default(0);
            $table->decimal('tax_total', 12, 3)->default(0);
            $table->decimal('total', 12, 3)->default(0);

            $table->ulid('converted_sale_id')->nullable();
            $table->timestamp('converted_at')->nullable();

            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();

            $table->index('status');
            $table->index('customer_id');
            $table->index('issue_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
