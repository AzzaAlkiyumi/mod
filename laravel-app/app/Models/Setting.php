<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * True singleton — always operate on Setting::singleton(), never create()
 * or find() with an arbitrary id.
 */
#[Fillable([
    'id', 'currency_code', 'currency_symbol', 'currency_decimals',
    'thousands_separator', 'decimal_separator', 'symbol_before_amount',
])]
class Setting extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $attributes = [
        'id' => 'singleton',
        'currency_code' => 'OMR',
        'currency_symbol' => 'OMR',
        'currency_decimals' => 3,
        'thousands_separator' => ',',
        'decimal_separator' => '.',
        'symbol_before_amount' => true,
    ];

    protected function casts(): array
    {
        return [
            'currency_decimals' => 'integer',
            'symbol_before_amount' => 'boolean',
        ];
    }

    public static function singleton(): self
    {
        return static::firstOrCreate(['id' => 'singleton']);
    }

    /** Shape consumed by resources/js/lib/utils.ts's CurrencyFormat type. */
    public function toCurrencyFormat(): array
    {
        return [
            'code' => $this->currency_code,
            'symbol' => $this->currency_symbol,
            'decimals' => $this->currency_decimals,
            'thousandsSeparator' => $this->thousands_separator,
            'decimalSeparator' => $this->decimal_separator,
            'symbolBefore' => $this->symbol_before_amount,
        ];
    }
}
