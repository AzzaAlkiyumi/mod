<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\DrugSchedule;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DrugScheduleController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => DrugSchedule::orderBy('country')->orderBy('display_name')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        try {
            $schedule = DrugSchedule::create([
                'short_code' => $input['shortCode'],
                'country' => strtoupper($input['country']),
                'display_name' => $input['displayName'],
                'description' => $input['description'] ?? null,
                'active' => $input['active'] ?? true,
            ]);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A drug schedule with this code already exists for this country');
        }

        return response()->json(['data' => $schedule], 201);
    }

    public function update(Request $request, DrugSchedule $drugSchedule): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        $update = [];
        if (array_key_exists('shortCode', $input)) {
            $update['short_code'] = $input['shortCode'];
        }
        if (array_key_exists('country', $input)) {
            $update['country'] = strtoupper($input['country']);
        }
        if (array_key_exists('displayName', $input)) {
            $update['display_name'] = $input['displayName'];
        }
        if (array_key_exists('description', $input)) {
            $update['description'] = $input['description'] ?: null;
        }
        if (array_key_exists('active', $input)) {
            $update['active'] = $input['active'];
        }

        try {
            $drugSchedule->update($update);
        } catch (QueryException $e) {
            return $this->uniqueViolation($e, 'A drug schedule with this code already exists for this country');
        }

        return response()->json(['data' => $drugSchedule]);
    }

    public function destroy(DrugSchedule $drugSchedule): JsonResponse
    {
        try {
            $drugSchedule->delete();
        } catch (QueryException $e) {
            return $this->foreignKeyViolation($e, 'Cannot delete — products still use this drug schedule');
        }

        return response()->json(['data' => ['id' => $drugSchedule->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'shortCode' => [$req, 'string', 'max:16'],
            'country' => [$req, 'string', 'size:2'],
            'displayName' => [$req, 'string'],
            'description' => ['sometimes', 'nullable', 'string'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
