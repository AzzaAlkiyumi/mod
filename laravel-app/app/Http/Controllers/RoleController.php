<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    use ValidatesJson;

    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $roles]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules());

        $role = Role::create([
            'name' => $input['name'],
            'description' => $input['description'] ?: null,
            'permissions' => $input['permissions'] ?? [],
        ]);
        $role->loadCount('users');

        return response()->json(['data' => $role], 201);
    }

    public function show(Role $role): JsonResponse
    {
        $role->loadCount('users');

        return response()->json(['data' => $role]);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $input = $this->jsonValidate($request, $this->rules(partial: true));

        if ($role->is_system && array_key_exists('name', $input) && $input['name'] !== $role->name) {
            return $this->formErrorResponse("System roles can't be renamed");
        }

        $update = [];
        if (! $role->is_system && array_key_exists('name', $input)) {
            $update['name'] = $input['name'];
        }
        if (array_key_exists('description', $input)) {
            $update['description'] = $input['description'] ?: null;
        }
        if (array_key_exists('permissions', $input)) {
            $update['permissions'] = $input['permissions'];
        }

        $role->update($update);
        $role->loadCount('users');

        return response()->json(['data' => $role]);
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->is_system) {
            return $this->formErrorResponse("System roles can't be deleted", 409);
        }

        $role->delete();

        return response()->json(['data' => ['id' => $role->id]]);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'name' => [$req, 'string', 'min:1'],
            'description' => ['sometimes', 'nullable', 'string'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string'],
        ];
    }
}
