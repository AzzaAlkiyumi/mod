<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A dynamic, permission-based role — see Administration > Roles.
 * `permissions` holds keys from the static catalog in
 * resources/js/lib/permissions.ts. `is_system` roles (the built-in
 * Accountant/Admin/Cashier/Manager/Stock Keeper) can't be renamed or
 * deleted, but their permission set and description can still be edited.
 */
#[Fillable(['name', 'description', 'is_system', 'permissions'])]
class Role extends Model
{
    use HasUlids;

    protected $attributes = [
        'permissions' => '[]',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'permissions' => 'array',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
