<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A completed POS sale — unlike a Quotation, a real, immediate, one-shot
 * transaction with no draft/status workflow, no header-level discount.
 */
#[Fillable([
    'number', 'store_id', 'created_by_id', 'customer_id',
    'payment_method', 'subtotal', 'tax_total', 'total',
])]
class Sale extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected $attributes = [
        'created_at' => null,
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:3',
            'tax_total' => 'decimal:3',
            'total' => 'decimal:3',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Sale $sale) {
            $sale->created_at ??= now();
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

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class)->orderBy('sort_order');
    }
}
