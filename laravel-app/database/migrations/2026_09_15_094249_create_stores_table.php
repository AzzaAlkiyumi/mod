<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->boolean('is_default')->default(false);
            // Company/legal details printed on quotations & receipts.
            $table->string('legal_name_en')->nullable();
            $table->string('legal_name_ar')->nullable();
            $table->string('cr_number')->nullable();
            $table->string('po_box')->nullable();
            $table->string('country_en')->nullable();
            $table->string('country_ar')->nullable();
            $table->string('address_en')->nullable();
            $table->string('address_ar')->nullable();
            $table->string('vat_number')->nullable();
            $table->string('mobile')->nullable();
            $table->string('email')->nullable();
            $table->string('logo_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
