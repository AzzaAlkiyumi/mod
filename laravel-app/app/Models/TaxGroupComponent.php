<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Join table: which TaxComponents make up a TaxGroup. */
#[Fillable(['tax_group_id', 'tax_component_id'])]
class TaxGroupComponent extends Model
{
    use HasUlids;

    public $timestamps = false;

    public function taxGroup(): BelongsTo
    {
        return $this->belongsTo(TaxGroup::class);
    }

    public function taxComponent(): BelongsTo
    {
        return $this->belongsTo(TaxComponent::class);
    }
}
