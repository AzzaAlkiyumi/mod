<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A parked-in-progress POS sale (Hold / F4) — a cart snapshot that can be
 * resumed later, possibly by a different cashier at the same store.
 */
#[Fillable([
    'store_id', 'created_by_id', 'customer_id', 'reference',
    'cart', 'discount_type', 'discount_value',
])]
class HeldSale extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected $attributes = [
        'created_at' => null,
    ];

    protected function casts(): array
    {
        return [
            'cart' => 'array',
            'discount_value' => 'decimal:3',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (HeldSale $held) {
            $held->created_at ??= now();
        });
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
