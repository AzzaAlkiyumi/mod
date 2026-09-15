<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Unit;
use App\Models\UnitCategory;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Unit::with(['measurementCategory', 'baseUnit'])->orderBy('display_name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        if (! UnitCategory::whereKey($input['measurementCategoryId'])->exists()) {
            return $this->formErrorResponse('Selected measurement category no longer exists');
        }
        if (! empty($input['baseUnitId']) && ! Unit::whereKey($input['baseUnitId'])->exists()) {
            return $this->formErrorResponse('Selected base unit no longer exists');
        }

        try {
            $unit = Unit::create([
                'short_code' => $input['shortCode'],
                'display_name' => $input['displayName'],
                'measurement_category_id' => $input['measurementCategoryId'],
                'base_unit_id' => $input['baseUnitId'] ?? null,
                'conversion_factor' => $input['conversionFactor'] ?? null,
                'active' => $input['active'] ?? true,
            ]);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A unit with this short code already exists');
        }
        $unit->load(['measurementCategory', 'baseUnit']);

        return response()->json(['data' => $unit], 201);
    }

    public function update(Request $request, Unit $unit): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        $update = [];
        if (array_key_exists('shortCode', $input)) {
            $update['short_code'] = $input['shortCode'];
        }
        if (array_key_exists('displayName', $input)) {
            $update['display_name'] = $input['displayName'];
        }
        if (array_key_exists('measurementCategoryId', $input)) {
            $update['measurement_category_id'] = $input['measurementCategoryId'];
        }
        if (array_key_exists('baseUnitId', $input)) {
            $update['base_unit_id'] = $input['baseUnitId'] ?: null;
        }
        if (array_key_exists('conversionFactor', $input)) {
            $update['conversion_factor'] = $input['conversionFactor'];
        }
        if (array_key_exists('active', $input)) {
            $update['active'] = $input['active'];
        }

        try {
            $unit->update($update);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A unit with this short code already exists');
        }
        $unit->load(['measurementCategory', 'baseUnit']);

        return response()->json(['data' => $unit]);
    }

    public function destroy(Unit $unit): JsonResponse
    {
        try {
            $unit->delete();
        } catch (QueryException $e) {
            return $this->foreignKeyViolation($e, 'Cannot delete — products still use this unit');
        }

        return response()->json(['data' => ['id' => $unit->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'shortCode' => [$req, 'string'],
            'displayName' => [$req, 'string'],
            'measurementCategoryId' => [$req, 'string'],
            'baseUnitId' => ['sometimes', 'nullable', 'string'],
            'conversionFactor' => ['sometimes', 'nullable', 'numeric', 'gt:0'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
