<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\TaxClassification;
use App\Models\TaxComponent;
use App\Models\TaxGroup;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaxGroupController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        $groups = TaxGroup::with(['classification', 'components.taxComponent'])
            ->withCount(['products', 'categories'])
            ->orderByDesc('is_default')->orderBy('name')
            ->get();

        return response()->json(['data' => $groups]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        if (! TaxClassification::whereKey($input['classificationId'])->exists()) {
            return $this->formErrorResponse('Selected classification no longer exists');
        }

        $components = TaxComponent::whereIn('id', $input['componentIds'])->get();
        if ($components->count() !== count($input['componentIds'])) {
            return $this->formErrorResponse('One or more selected tax components no longer exist');
        }
        $rate = $components->sum(fn ($c) => (float) $c->rate);

        try {
            $group = DB::transaction(function () use ($input, $rate) {
                if ($input['isDefault'] ?? false) {
                    TaxGroup::where('is_default', true)->update(['is_default' => false]);
                }
                $group = TaxGroup::create([
                    'code' => $input['code'],
                    'name' => $input['name'],
                    'classification_id' => $input['classificationId'],
                    'rate' => $rate,
                    'prices_include_tax' => $input['pricesIncludeTax'] ?? false,
                    'is_default' => $input['isDefault'] ?? false,
                    'active' => $input['active'] ?? true,
                ]);
                $group->components()->createMany(
                    collect($input['componentIds'])->map(fn ($id) => ['tax_component_id' => $id])->all(),
                );

                return $group;
            });
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A tax group with this code already exists');
        }

        $group->load(['classification', 'components.taxComponent']);
        $group->loadCount(['products', 'categories']);

        return response()->json(['data' => $group], 201);
    }

    public function update(Request $request, TaxGroup $taxGroup): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        if (array_key_exists('classificationId', $input)
            && ! TaxClassification::whereKey($input['classificationId'])->exists()) {
            return $this->formErrorResponse('Selected classification no longer exists');
        }

        $rate = null;
        if (array_key_exists('componentIds', $input)) {
            $components = TaxComponent::whereIn('id', $input['componentIds'])->get();
            if ($components->count() !== count($input['componentIds'])) {
                return $this->formErrorResponse('One or more selected tax components no longer exist');
            }
            $rate = $components->sum(fn ($c) => (float) $c->rate);
        }

        try {
            DB::transaction(function () use ($input, $rate, $taxGroup) {
                if ($input['isDefault'] ?? false) {
                    TaxGroup::where('is_default', true)->where('id', '!=', $taxGroup->id)
                        ->update(['is_default' => false]);
                }
                if (array_key_exists('componentIds', $input)) {
                    $taxGroup->components()->delete();
                }

                $update = [];
                foreach ([
                    'code' => 'code', 'name' => 'name', 'classificationId' => 'classification_id',
                    'pricesIncludeTax' => 'prices_include_tax', 'isDefault' => 'is_default',
                    'active' => 'active',
                ] as $in => $col) {
                    if (array_key_exists($in, $input)) {
                        $update[$col] = $input[$in];
                    }
                }
                if ($rate !== null) {
                    $update['rate'] = $rate;
                }
                $taxGroup->update($update);

                if (array_key_exists('componentIds', $input)) {
                    $taxGroup->components()->createMany(
                        collect($input['componentIds'])->map(fn ($id) => ['tax_component_id' => $id])->all(),
                    );
                }
            });
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A tax group with this code already exists');
        }

        $taxGroup->load(['classification', 'components.taxComponent']);
        $taxGroup->loadCount(['products', 'categories']);

        return response()->json(['data' => $taxGroup]);
    }

    public function destroy(TaxGroup $taxGroup): JsonResponse
    {
        try {
            $taxGroup->delete();
        } catch (QueryException $e) {
            return $this->foreignKeyViolation(
                $e,
                'Cannot delete — products or categories still use this tax group',
            );
        }

        return response()->json(['data' => ['id' => $taxGroup->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'code' => [$req, 'string'],
            'name' => [$req, 'string'],
            'classificationId' => [$req, 'string'],
            'componentIds' => [$req, 'array', 'min:1'],
            'componentIds.*' => ['string'],
            'pricesIncludeTax' => ['sometimes', 'boolean'],
            'isDefault' => ['sometimes', 'boolean'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
