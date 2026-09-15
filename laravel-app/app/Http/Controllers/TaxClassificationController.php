<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\TaxClassification;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxClassificationController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => TaxClassification::orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        try {
            $classification = TaxClassification::create([
                'name' => $input['name'],
                'slug' => $input['slug'],
                'description' => $input['description'] ?? null,
                'sort_order' => $input['sortOrder'] ?? 0,
                'active' => $input['active'] ?? true,
            ]);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A classification with this slug already exists');
        }

        return response()->json(['data' => $classification], 201);
    }

    public function update(Request $request, TaxClassification $taxClassification): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        $update = [];
        if (array_key_exists('name', $input)) {
            $update['name'] = $input['name'];
        }
        if (array_key_exists('slug', $input)) {
            $update['slug'] = $input['slug'];
        }
        if (array_key_exists('description', $input)) {
            $update['description'] = $input['description'] ?: null;
        }
        if (array_key_exists('sortOrder', $input)) {
            $update['sort_order'] = $input['sortOrder'];
        }
        if (array_key_exists('active', $input)) {
            $update['active'] = $input['active'];
        }

        try {
            $taxClassification->update($update);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A classification with this slug already exists');
        }

        return response()->json(['data' => $taxClassification]);
    }

    public function destroy(TaxClassification $taxClassification): JsonResponse
    {
        try {
            $taxClassification->delete();
        } catch (QueryException $e) {
            return $this->foreignKeyViolation($e, 'Cannot delete — tax groups still use this classification');
        }

        return response()->json(['data' => ['id' => $taxClassification->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'name' => [$req, 'string'],
            'slug' => [$req, 'string', 'regex:/^[a-z0-9_]+$/'],
            'description' => ['sometimes', 'nullable', 'string'],
            'sortOrder' => ['sometimes', 'integer'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
