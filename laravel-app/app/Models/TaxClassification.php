<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Filing/reporting tag for a TaxGroup (Taxable, Exempt, Zero Rated...).
 */
#[Fillable(['name', 'slug', 'description', 'sort_order', 'active'])]
class TaxClassification extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function taxGroups(): HasMany
    {
        return $this->hasMany(TaxGroup::class, 'classification_id');
    }
}
