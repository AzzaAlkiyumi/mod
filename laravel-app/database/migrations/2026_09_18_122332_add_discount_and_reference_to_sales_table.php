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
        Schema::table('sales', function (Blueprint $table) {
            if (! Schema::hasColumn('sales', 'payment_reference')) {
                $table->string('payment_reference')->nullable()->after('payment_method');
            }
            if (! Schema::hasColumn('sales', 'discount_type')) {
                $table->string('discount_type')->default('FIXED')->after('payment_reference');
            }
            if (! Schema::hasColumn('sales', 'discount_value')) {
                $table->decimal('discount_value', 12, 3)->default(0)->after('discount_type');
            }
            if (! Schema::hasColumn('sales', 'discount_total')) {
                $table->decimal('discount_total', 12, 3)->default(0)->after('subtotal');
            }
            if (! Schema::hasColumn('sales', 'tendered_amount')) {
                $table->decimal('tendered_amount', 12, 3)->nullable()->after('total');
            }
            if (! Schema::hasColumn('sales', 'change_amount')) {
                $table->decimal('change_amount', 12, 3)->nullable()->after('tendered_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'payment_reference', 'discount_type', 'discount_value',
                'discount_total', 'tendered_amount', 'change_amount',
            ]);
        });
    }
};
