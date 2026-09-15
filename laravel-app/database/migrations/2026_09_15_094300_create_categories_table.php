<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Product category — supports one level of parent/child nesting.
        Schema::create('categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('icon_color')->default('orange');
            $table->ulid('tax_id')->nullable();
            $table->ulid('parent_id')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->foreign('tax_id')->references('id')->on('tax_groups')->nullOnDelete();
            $table->index('parent_id');
        });

        // Self-referencing FK added after creation — see units migration.
        Schema::table('categories', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
