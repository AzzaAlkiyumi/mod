<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $store = Store::firstOrCreate(
            ['code' => 'MAIN'],
            ['name' => 'Main Store', 'is_default' => true],
        );

        $adminRole = Role::firstOrCreate(
            ['name' => 'Admin'],
            [
                'description' => 'Full access to everything.',
                'is_system' => true,
                'permissions' => ['sales.create', 'sales.view_all', 'roles.manage', 'users.view', 'users.update'],
            ],
        );

        $cashierRole = Role::firstOrCreate(
            ['name' => 'Cashier'],
            [
                'description' => 'Day-to-day cashier: sell, return, basic customer & shift management.',
                'is_system' => true,
                'permissions' => ['sales.create', 'sales.view_own', 'customers.view'],
            ],
        );

        User::firstOrCreate(
            ['email' => 'admin@hyperpos.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'ADMIN',
                'role_id' => $adminRole->id,
                'store_id' => $store->id,
            ],
        );

        User::firstOrCreate(
            ['email' => 'cashier@hyperpos.test'],
            [
                'name' => 'Demo Cashier',
                'password' => Hash::make('password'),
                'role' => 'CASHIER',
                'role_id' => $cashierRole->id,
                'store_id' => $store->id,
            ],
        );
    }
}
