<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A unit products are sold/measured by (pcs, kg, L...). Conversion fields
 * aren't used in any calculation yet (nothing in this app converts
 * between units).
 */
#[Fillable([
    'short_code', 'display_name', 'measurement_category_id',
    'base_unit_id', 'conversion_factor', 'active',
])]
class Unit extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'conversion_factor' => 'decimal:6',
            'active' => 'boolean',
        ];
    }

    public function measurementCategory(): BelongsTo
    {
        return $this->belongsTo(UnitCategory::class, 'measurement_category_id');
    }

    public function baseUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'base_unit_id');
    }

    public function convertsFrom(): HasMany
    {
        return $this->hasMany(Unit::class, 'base_unit_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
