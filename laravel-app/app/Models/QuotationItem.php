<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'quotation_id', 'product_id', 'quantity', 'unit_price',
    'discount_type', 'discount_value', 'tax_rate',
    'subtotal', 'tax_amount', 'line_total', 'sort_order',
])]
class QuotationItem extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'unit_price' => 'decimal:3',
            'discount_value' => 'decimal:3',
            'tax_rate' => 'decimal:3',
            'subtotal' => 'decimal:3',
            'tax_amount' => 'decimal:3',
            'line_total' => 'decimal:3',
        ];
    }

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
