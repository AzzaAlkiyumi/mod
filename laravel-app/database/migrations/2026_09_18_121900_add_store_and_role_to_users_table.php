<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Formalizes two columns the User model has relied on since the Roles
     * module (role_id, dynamic permission-based role) and multi-store
     * support (store_id) were built, but which were never captured in a
     * migration — guarded with hasColumn() so it no-ops on a database that
     * already has them (as this project's own dev database does) and adds
     * them cleanly on a fresh one.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'store_id')) {
                $table->foreignUlid('store_id')->nullable()->after('role')->constrained('stores')->nullOnDelete();
            }
            if (! Schema::hasColumn('users', 'role_id')) {
                $table->foreignUlid('role_id')->nullable()->after('store_id')->constrained('roles')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role_id')) {
                $table->dropConstrainedForeignId('role_id');
            }
            if (Schema::hasColumn('users', 'store_id')) {
                $table->dropConstrainedForeignId('store_id');
            }
        });
    }
};
