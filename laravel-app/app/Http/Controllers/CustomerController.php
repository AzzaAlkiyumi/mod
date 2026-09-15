<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $query = Customer::query();
        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'ilike', "%{$q}%")
                    ->orWhere('code', 'ilike', "%{$q}%")
                    ->orWhere('phone', 'ilike', "%{$q}%")
                    ->orWhere('email', 'ilike', "%{$q}%");
            });
        }

        return response()->json(['data' => $query->orderBy('name')->limit(20)->get()]);
    }
}
