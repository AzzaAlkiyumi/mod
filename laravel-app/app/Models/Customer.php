<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code', 'name', 'email', 'phone', 'billing_address', 'shipping_address',
    'discount_type', 'discount_value',
])]
class Customer extends Model
{
    use HasUlids;

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:3',
        ];
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
