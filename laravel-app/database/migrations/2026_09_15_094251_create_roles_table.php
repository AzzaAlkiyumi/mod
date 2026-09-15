<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            // Permission keys from the static catalog — see resources/js/lib/permissions.ts.
            // Default '[]' is set on the Role model's $attributes, not here.
            $table->json('permissions');
            $table->timestamps();

            $table->index('name');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->ulid('store_id')->nullable()->after('email');
            $table->ulid('role_id')->nullable()->after('store_id');
            $table->foreign('store_id')->references('id')->on('stores')->nullOnDelete();
            $table->foreign('role_id')->references('id')->on('roles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropForeign(['role_id']);
            $table->dropColumn(['store_id', 'role_id']);
        });
        Schema::dropIfExists('roles');
    }
};
