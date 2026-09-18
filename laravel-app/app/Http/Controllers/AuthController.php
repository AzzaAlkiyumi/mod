<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use ValidatesJson;

    public function login(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, [
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt(['email' => $input['email'], 'password' => $input['password']], true)) {
            return $this->formErrorResponse('Invalid email or password', 422);
        }

        $request->session()->regenerate();

        return response()->json(['data' => $this->serializeUser($request->user())]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['data' => ['loggedOut' => true]]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->serializeUser($request->user())]);
    }

    private function serializeUser(User $user): array
    {
        $user->loadMissing('customRole');
        $permissions = $user->customRole?->permissions ?? [];

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'roleId' => $user->role_id,
            'roleName' => $user->customRole?->name,
            'permissions' => $permissions,
            'storeId' => $user->store_id,
        ];
    }
}
