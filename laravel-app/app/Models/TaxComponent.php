<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Atomic tax rate (e.g. "CGST 9%"). Combined into TaxGroups; never applied
 * to a Product/Category directly.
 */
#[Fillable(['code', 'name', 'rate', 'active'])]
class TaxComponent extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:3',
            'active' => 'boolean',
        ];
    }

    public function groups(): HasMany
    {
        return $this->hasMany(TaxGroupComponent::class);
    }
}
