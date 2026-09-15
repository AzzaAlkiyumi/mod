<?php

namespace App\Support;

/**
 * Server-side quotation total calculations — ported line-for-line from the
 * Next.js app's lib/calculations.ts so every quotation gets the exact same
 * numbers regardless of which backend computed them.
 *
 * Per line:
 *   lineGross     = quantity * unitPrice
 *   lineDiscount  = discountType === PERCENT ? lineGross * discountValue/100 : discountValue
 *   lineTaxable   = lineGross - lineDiscount
 *   lineTax       = lineTaxable * (taxRate / 100)
 *   lineTotal     = lineTaxable + lineTax
 *
 * Quotation:
 *   subtotal          = sum(lineGross)
 *   quotationDiscount = header-level discount (PERCENT of subtotal, or FIXED)
 *   discountTotal     = sum(lineDiscount) + quotationDiscount
 *   taxTotal          = sum(lineTax)
 *   total             = subtotal - discountTotal + taxTotal
 */
class QuotationCalculator
{
    /**
     * @param  array<int, array{quantity: float, unitPrice: float, discountType: string, discountValue: float, taxRate: float}>  $lines
     * @return array{lines: array<int, array<string, mixed>>, subtotal: float, discountTotal: float, taxTotal: float, total: float}
     */
    public static function totals(array $lines, string $discountType, float $discountValue): array
    {
        $subtotal = 0.0;
        $lineDiscountTotal = 0.0;
        $taxTotal = 0.0;

        $computedLines = array_map(function (array $line) use (&$subtotal, &$lineDiscountTotal, &$taxTotal) {
            $lineGross = self::round3($line['quantity'] * $line['unitPrice']);
            $lineDiscount = self::round3(self::lineDiscount($lineGross, $line['discountType'], $line['discountValue']));
            $taxableAmount = self::round3($lineGross - $lineDiscount);
            $taxAmount = self::round3($taxableAmount * $line['taxRate'] / 100);
            $lineTotal = self::round3($taxableAmount + $taxAmount);

            $subtotal += $lineGross;
            $lineDiscountTotal += $lineDiscount;
            $taxTotal += $taxAmount;

            return [
                ...$line,
                'lineGross' => $lineGross,
                'lineDiscount' => $lineDiscount,
                'taxableAmount' => $taxableAmount,
                'taxAmount' => $taxAmount,
                'lineTotal' => $lineTotal,
            ];
        }, $lines);

        $subtotal = self::round3($subtotal);
        $lineDiscountTotal = self::round3($lineDiscountTotal);
        $taxTotal = self::round3($taxTotal);

        $quotationDiscount = self::round3(
            $discountType === 'PERCENT'
                ? $subtotal * $discountValue / 100
                : min($discountValue, max($subtotal - $lineDiscountTotal, 0))
        );

        $discountTotal = self::round3($lineDiscountTotal + $quotationDiscount);
        $total = self::round3($subtotal - $discountTotal + $taxTotal);

        return [
            'lines' => $computedLines,
            'subtotal' => $subtotal,
            'discountTotal' => $discountTotal,
            'taxTotal' => $taxTotal,
            'total' => $total,
        ];
    }

    private static function round3(float $value): float
    {
        return round($value, 3);
    }

    private static function lineDiscount(float $gross, string $type, float $value): float
    {
        $discount = $type === 'PERCENT' ? $gross * $value / 100 : $value;

        return min(max($discount, 0), $gross);
    }
}
