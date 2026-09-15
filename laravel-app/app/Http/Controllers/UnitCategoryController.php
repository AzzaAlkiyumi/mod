<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\UnitCategory;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitCategoryController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => UnitCategory::orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        try {
            $unitCategory = UnitCategory::create([
                'name' => $input['name'],
                'slug' => $input['slug'],
                'sort_order' => $input['sortOrder'] ?? 0,
                'active' => $input['active'] ?? true,
            ]);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A unit category with this slug already exists');
        }

        return response()->json(['data' => $unitCategory], 201);
    }

    public function update(Request $request, UnitCategory $unitCategory): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        $update = [];
        foreach (['name' => 'name', 'slug' => 'slug', 'sortOrder' => 'sort_order', 'active' => 'active'] as $in => $col) {
            if (array_key_exists($in, $input)) {
                $update[$col] = $input[$in];
            }
        }

        try {
            $unitCategory->update($update);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A unit category with this slug already exists');
        }

        return response()->json(['data' => $unitCategory]);
    }

    public function destroy(UnitCategory $unitCategory): JsonResponse
    {
        try {
            $unitCategory->delete();
        } catch (QueryException $e) {
            return $this->foreignKeyViolation($e, 'Cannot delete — units still use this category');
        }

        return response()->json(['data' => ['id' => $unitCategory->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'name' => [$req, 'string'],
            'slug' => [$req, 'string', 'regex:/^[a-z0-9-]+$/'],
            'sortOrder' => ['sometimes', 'integer'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
