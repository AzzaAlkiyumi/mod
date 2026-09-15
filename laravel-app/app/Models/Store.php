<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name', 'code', 'is_default',
    'legal_name_en', 'legal_name_ar', 'cr_number', 'po_box',
    'country_en', 'country_ar', 'address_en', 'address_ar',
    'vat_number', 'mobile', 'email', 'logo_url',
])]
class Store extends Model
{
    use HasUlids;

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
