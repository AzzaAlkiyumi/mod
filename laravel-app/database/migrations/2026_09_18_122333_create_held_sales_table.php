<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // A parked-in-progress sale (POS "Hold" / F4) — a cart snapshot that
        // can be resumed later, possibly by a different cashier at the same store.
        Schema::create('held_sales', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('store_id')->constrained('stores');
            $table->foreignId('created_by_id')->constrained('users');
            $table->ulid('customer_id')->nullable();
            $table->string('reference')->nullable(); // customer-facing label, e.g. "John / Table 4"
            $table->json('cart'); // snapshot: [{productId, quantity}, ...]
            $table->string('discount_type')->default('FIXED');
            $table->decimal('discount_value', 12, 3)->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();

            $table->index('store_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('held_sales');
    }
};
