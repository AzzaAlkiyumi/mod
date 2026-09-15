<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Brand;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        return response()->json(['data' => Brand::orderBy('name')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        $brand = Brand::create([
            'name' => $input['name'],
            'logo_url' => $input['logoUrl'] ?? null,
            'description' => $input['description'] ?? null,
            'active' => $input['active'] ?? true,
        ]);

        return response()->json(['data' => $brand], 201);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        $update = [];
        if (array_key_exists('name', $input)) {
            $update['name'] = $input['name'];
        }
        if (array_key_exists('logoUrl', $input)) {
            $update['logo_url'] = $input['logoUrl'] ?: null;
        }
        if (array_key_exists('description', $input)) {
            $update['description'] = $input['description'] ?: null;
        }
        if (array_key_exists('active', $input)) {
            $update['active'] = $input['active'];
        }

        $brand->update($update);

        return response()->json(['data' => $brand]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        try {
            $brand->delete();
        } catch (QueryException $e) {
            return $this->foreignKeyViolation($e, 'Cannot delete — products still use this brand');
        }

        return response()->json(['data' => ['id' => $brand->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'name' => [$req, 'string'],
            'logoUrl' => ['sometimes', 'nullable', 'string'],
            'description' => ['sometimes', 'nullable', 'string'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
