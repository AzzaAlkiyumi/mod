<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Store::orderByDesc('is_default')->orderBy('name')->get(),
        ]);
    }
}
