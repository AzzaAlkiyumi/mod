<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A completed POS sale — unlike a Quotation, a real, immediate,
        // one-shot transaction with no draft/status workflow.
        Schema::create('sales', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('number')->unique(); // e.g. SE-000001

            $table->foreignUlid('store_id')->constrained('stores');
            $table->foreignId('created_by_id')->constrained('users');
            $table->ulid('customer_id')->nullable(); // walk-in sale has none

            $table->string('payment_method'); // CASH | CARD

            $table->decimal('subtotal', 12, 3)->default(0);
            $table->decimal('tax_total', 12, 3)->default(0);
            $table->decimal('total', 12, 3)->default(0);

            $table->timestamp('created_at')->nullable();

            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();

            $table->index('created_at');
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
