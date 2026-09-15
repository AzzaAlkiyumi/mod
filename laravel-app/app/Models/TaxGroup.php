<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * The actual thing a Product/Category is taxed with. Bundles one or more
 * TaxComponents; `rate` is the cached sum of component rates, so
 * Quotation/POS calculations keep reading one plain number.
 */
#[Fillable(['code', 'name', 'classification_id', 'rate', 'prices_include_tax', 'is_default', 'active'])]
class TaxGroup extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:3',
            'prices_include_tax' => 'boolean',
            'is_default' => 'boolean',
            'active' => 'boolean',
        ];
    }

    public function classification(): BelongsTo
    {
        return $this->belongsTo(TaxClassification::class, 'classification_id');
    }

    public function components(): HasMany
    {
        return $this->hasMany(TaxGroupComponent::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'tax_id');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class, 'tax_id');
    }
}
