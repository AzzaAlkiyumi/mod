<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'sku', 'barcode', 'name', 'name_ar', 'description_en', 'description_ar',
    'price', 'image_url', 'tax_id', 'unit_id', 'category_id', 'brand_id',
    'short_description', 'available_for_sale', 'featured',
    'track_stock', 'sold_by_weight', 'track_batches', 'track_expiry',
    'expiry_date', 'reorder_at', 'reorder_quantity',
    'cost_price', 'mrp', 'price_includes_tax',
    'hsn_code', 'drug_schedule_id', 'generic_name', 'manufacturer',
])]
class Product extends Model
{
    use HasUlids;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:3',
            'available_for_sale' => 'boolean',
            'featured' => 'boolean',
            'track_stock' => 'boolean',
            'sold_by_weight' => 'boolean',
            'track_batches' => 'boolean',
            'track_expiry' => 'boolean',
            'expiry_date' => 'date',
            'cost_price' => 'decimal:3',
            'mrp' => 'decimal:3',
            'price_includes_tax' => 'boolean',
        ];
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(TaxGroup::class, 'tax_id');
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function drugSchedule(): BelongsTo
    {
        return $this->belongsTo(DrugSchedule::class);
    }

    public function quotationItems(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }
}
