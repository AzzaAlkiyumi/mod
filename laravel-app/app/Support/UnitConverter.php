<?php

namespace App\Support;

use App\Models\Unit;
use InvalidArgumentException;
use RuntimeException;

/**
 * Converts a quantity between two Units that share a common base, using
 * only each Unit's own stored conversion_factor — never an invented one.
 *
 * Semantics (matching the Units admin screen): a unit either IS a base unit
 * (base_unit_id null) or converts to one via conversion_factor, where
 * conversion_factor = how many base units one of this unit equals
 * (e.g. Gram's base is Kilogram with factor 0.001, since 1 g = 0.001 kg;
 * Box's base is Piece with factor 12, since 1 box = 12 pc).
 *
 * Nothing in the app calls this yet — POS/quotations/sales each work off a
 * single fixed Product.unit_id, so there is no live calculation that
 * currently converts between units. This exists as a correct, tested
 * building block for whenever such a feature is added.
 */
class UnitConverter
{
    /**
     * How many of $unit's own root base unit one $unit equals — 1.0 for a
     * base unit itself, otherwise the product of conversion_factor along
     * the base_unit_id chain (handles a derived unit whose base is itself
     * derived, though the admin screen normally keeps this to one level).
     */
    public static function factorToBase(Unit $unit): float
    {
        $factor = 1.0;
        $current = $unit;
        $seen = [$unit->id => true];

        while ($current->base_unit_id !== null) {
            $factor *= (float) $current->conversion_factor;
            $current = $current->baseUnit ?? Unit::findOrFail($current->base_unit_id);

            if (isset($seen[$current->id])) {
                throw new RuntimeException("Circular unit base reference detected starting at unit {$unit->id}");
            }
            $seen[$current->id] = true;
        }

        return $factor;
    }

    /** The ultimate base unit at the top of $unit's base_unit_id chain (itself, if it has none). */
    public static function rootBase(Unit $unit): Unit
    {
        $current = $unit;
        $seen = [$unit->id => true];

        while ($current->base_unit_id !== null) {
            $current = $current->baseUnit ?? Unit::findOrFail($current->base_unit_id);

            if (isset($seen[$current->id])) {
                throw new RuntimeException("Circular unit base reference detected starting at unit {$unit->id}");
            }
            $seen[$current->id] = true;
        }

        return $current;
    }

    public static function canConvert(Unit $from, Unit $to): bool
    {
        return $from->id === $to->id || self::rootBase($from)->id === self::rootBase($to)->id;
    }

    /**
     * Converts $quantity, expressed in $from, into the equivalent quantity
     * expressed in $to. Rounds only once, at the very end, to 6 decimal
     * places (matching the conversion_factor column's own precision) so
     * intermediate float arithmetic never compounds into a visible error.
     */
    public static function convert(Unit $from, Unit $to, float|string $quantity): float
    {
        $quantity = (float) $quantity;

        if ($from->id === $to->id) {
            return round($quantity, 6);
        }

        if (! self::canConvert($from, $to)) {
            throw new InvalidArgumentException(
                "Units {$from->short_code} and {$to->short_code} do not share a common base unit"
            );
        }

        $quantityInBase = $quantity * self::factorToBase($from);
        $result = $quantityInBase / self::factorToBase($to);

        return round($result, 6);
    }
}
