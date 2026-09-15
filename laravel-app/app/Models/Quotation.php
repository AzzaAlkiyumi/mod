<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'number', 'store_id', 'created_by_id', 'customer_id',
    'prospect_name', 'prospect_email', 'prospect_phone',
    'billing_address', 'shipping_address',
    'issue_date', 'valid_until', 'expected_delivery_date',
    'terms_and_conditions', 'customer_notes', 'status',
    'discount_type', 'discount_value',
    'subtotal', 'discount_total', 'tax_total', 'total',
    'converted_sale_id', 'converted_at',
])]
class Quotation extends Model
{
    use HasUlids;

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'valid_until' => 'date',
            'expected_delivery_date' => 'date',
            'discount_value' => 'decimal:3',
            'subtotal' => 'decimal:3',
            'discount_total' => 'decimal:3',
            'tax_total' => 'decimal:3',
            'total' => 'decimal:3',
            'converted_at' => 'datetime',
        ];
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
        return $this->hasMany(QuotationItem::class)->orderBy('sort_order');
    }
}
