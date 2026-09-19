<?php

namespace Tests\Unit;

use App\Models\Unit;
use App\Support\UnitConverter;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class UnitConverterTest extends TestCase
{
    private function makeUnit(string $id, string $shortCode, ?Unit $base, ?string $conversionFactor): Unit
    {
        $unit = new Unit([
            'short_code' => $shortCode,
            'display_name' => $shortCode,
            'base_unit_id' => $base?->id,
            'conversion_factor' => $conversionFactor,
        ]);
        $unit->id = $id;
        if ($base !== null) {
            $unit->setRelation('baseUnit', $base);
        }

        return $unit;
    }

    public function test_kilogram_to_gram_and_back(): void
    {
        $kg = $this->makeUnit('kg', 'kg', null, null);
        $g = $this->makeUnit('g', 'g', $kg, '0.001');

        $this->assertSame(1000.0, UnitConverter::convert($kg, $g, 1));
        $this->assertSame(500.0, UnitConverter::convert($kg, $g, 0.5));
        $this->assertSame(0.25, UnitConverter::convert($g, $kg, 250));
    }

    public function test_litre_to_millilitre_and_back(): void
    {
        $l = $this->makeUnit('l', 'L', null, null);
        $ml = $this->makeUnit('ml', 'ml', $l, '0.001');

        $this->assertSame(1000.0, UnitConverter::convert($l, $ml, 1));
        $this->assertSame(500.0, UnitConverter::convert($l, $ml, 0.5));
        $this->assertSame(0.25, UnitConverter::convert($ml, $l, 250));
    }

    public function test_box_to_pieces_and_back(): void
    {
        $piece = $this->makeUnit('piece', 'pc', null, null);
        $box = $this->makeUnit('box', 'box', $piece, '12');

        $this->assertSame(12.0, UnitConverter::convert($box, $piece, 1));
        $this->assertSame(24.0, UnitConverter::convert($box, $piece, 2));
        $this->assertSame(2.0, UnitConverter::convert($piece, $box, 24));
    }

    /** Two derived units that share the same base but aren't each other's base — g and mg both trace to kg. */
    public function test_composite_conversion_between_siblings_of_the_same_base(): void
    {
        $kg = $this->makeUnit('kg', 'kg', null, null);
        $g = $this->makeUnit('g', 'g', $kg, '0.001');
        $mg = $this->makeUnit('mg', 'mg', $g, '0.001');

        // mg -> kg is two hops (mg->g->kg): factorToBase(mg) = 0.001 * 0.001 = 0.000001
        $this->assertSame(1.0, UnitConverter::convert($mg, $kg, 1_000_000));
        $this->assertSame(1_000_000.0, UnitConverter::convert($kg, $mg, 1));
        // Sibling-to-sibling through the shared kg base, not through each other directly.
        $this->assertSame(1000.0, UnitConverter::convert($g, $mg, 1));
        $this->assertSame(0.001, UnitConverter::convert($mg, $g, 1));
    }

    public function test_same_unit_is_identity(): void
    {
        $kg = $this->makeUnit('kg', 'kg', null, null);

        $this->assertSame(3.5, UnitConverter::convert($kg, $kg, 3.5));
    }

    public function test_unrelated_units_cannot_convert(): void
    {
        $kg = $this->makeUnit('kg', 'kg', null, null);
        $l = $this->makeUnit('l', 'L', null, null);

        $this->assertFalse(UnitConverter::canConvert($kg, $l));
        $this->expectException(InvalidArgumentException::class);
        UnitConverter::convert($kg, $l, 1);
    }

    public function test_conversion_factor_from_database_is_never_invented(): void
    {
        // A real-world factor with more precision than a hand-picked example
        // (e.g. lb -> kg is 0.453592), proving the converter uses exactly
        // what's stored rather than a rounded assumption.
        $kg = $this->makeUnit('kg', 'kg', null, null);
        $lb = $this->makeUnit('lb', 'lb', $kg, '0.453592');

        $this->assertEqualsWithDelta(2.267960, UnitConverter::convert($lb, $kg, 5), 1e-6);
    }
}
