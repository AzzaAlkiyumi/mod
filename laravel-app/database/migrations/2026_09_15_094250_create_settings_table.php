<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // True singleton: the app only ever reads/writes the row with id "singleton".
        Schema::create('settings', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('currency_code')->default('OMR');
            $table->string('currency_symbol')->default('OMR');
            $table->unsignedTinyInteger('currency_decimals')->default(3);
            $table->string('thousands_separator', 1)->default(',');
            $table->string('decimal_separator', 1)->default('.');
            $table->boolean('symbol_before_amount')->default(true);
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
