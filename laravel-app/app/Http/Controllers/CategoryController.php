<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Category;
use App\Models\TaxGroup;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Category::with(['tax', 'parent'])->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        if ($error = $this->assertReferences($input)) {
            return $error;
        }

        $category = Category::create([
            'name' => $input['name'],
            'icon_color' => $input['iconColor'] ?? 'orange',
            'tax_id' => $input['taxId'] ?? null,
            'parent_id' => $input['parentId'] ?? null,
            'active' => $input['active'] ?? true,
        ]);
        $category->load(['tax', 'parent']);

        return response()->json(['data' => $category], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        if (($input['parentId'] ?? null) === $category->id) {
            return $this->formErrorResponse('A category cannot be its own parent');
        }
        if ($error = $this->assertReferences($input)) {
            return $error;
        }

        $update = [];
        if (array_key_exists('name', $input)) {
            $update['name'] = $input['name'];
        }
        if (array_key_exists('iconColor', $input)) {
            $update['icon_color'] = $input['iconColor'];
        }
        if (array_key_exists('taxId', $input)) {
            $update['tax_id'] = $input['taxId'] ?: null;
        }
        if (array_key_exists('parentId', $input)) {
            $update['parent_id'] = $input['parentId'] ?: null;
        }
        if (array_key_exists('active', $input)) {
            $update['active'] = $input['active'];
        }

        $category->update($update);
        $category->load(['tax', 'parent']);

        return response()->json(['data' => $category]);
    }

    public function destroy(Category $category): JsonResponse
    {
        try {
            $category->delete();
        } catch (QueryException $e) {
            return $this->foreignKeyViolation(
                $e,
                'Cannot delete — products or sub-categories still use this category',
            );
        }

        return response()->json(['data' => ['id' => $category->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'name' => [$req, 'string'],
            'iconColor' => ['sometimes', 'string'],
            'taxId' => ['sometimes', 'nullable', 'string'],
            'parentId' => ['sometimes', 'nullable', 'string'],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    private function assertReferences(array $input): ?JsonResponse
    {
        if (! empty($input['taxId']) && ! TaxGroup::whereKey($input['taxId'])->exists()) {
            return $this->formErrorResponse('Selected tax no longer exists');
        }
        if (! empty($input['parentId']) && ! Category::whereKey($input['parentId'])->exists()) {
            return $this->formErrorResponse('Selected parent category no longer exists');
        }

        return null;
    }
}
