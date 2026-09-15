<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\TaxComponent;
use App\Models\TaxGroup;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxComponentController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        return response()->json(['data' => TaxComponent::orderBy('name')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        try {
            $component = TaxComponent::create([
                'code' => $input['code'],
                'name' => $input['name'],
                'rate' => $input['rate'],
                'active' => $input['active'] ?? true,
            ]);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A tax component with this code already exists');
        }

        return response()->json(['data' => $component], 201);
    }

    public function update(Request $request, TaxComponent $taxComponent): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        $update = [];
        foreach (['code' => 'code', 'name' => 'name', 'rate' => 'rate', 'active' => 'active'] as $in => $col) {
            if (array_key_exists($in, $input)) {
                $update[$col] = $input[$in];
            }
        }

        try {
            $taxComponent->update($update);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A tax component with this code already exists');
        }

        // Keep every TaxGroup that includes this component in sync with its new rate.
        if (array_key_exists('rate', $input)) {
            $groups = TaxGroup::whereHas('components', fn ($q) => $q->where('tax_component_id', $taxComponent->id))
                ->with('components.taxComponent')
                ->get();
            foreach ($groups as $group) {
                $rate = $group->components->sum(fn ($c) => (float) $c->taxComponent->rate);
                $group->update(['rate' => $rate]);
            }
        }

        return response()->json(['data' => $taxComponent]);
    }

    public function destroy(TaxComponent $taxComponent): JsonResponse
    {
        try {
            $taxComponent->delete();
        } catch (QueryException $e) {
            return $this->foreignKeyViolation($e, 'Cannot delete — tax groups still use this component');
        }

        return response()->json(['data' => ['id' => $taxComponent->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'code' => [$req, 'string'],
            'name' => [$req, 'string'],
            'rate' => [$req, 'numeric', 'min:0'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
