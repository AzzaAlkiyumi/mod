<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Customer;
use App\Models\HeldSale;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HeldSaleController extends Controller
{
    use ValidatesJson;

    public function index(Request $request): JsonResponse
    {
        $heldSales = HeldSale::with(['customer', 'createdBy'])
            ->when($request->query('storeId'), fn ($q, $storeId) => $q->where('store_id', $storeId))
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $heldSales]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, [
            'storeId' => ['required', 'string'],
            'customerId' => ['sometimes', 'nullable', 'string'],
            'reference' => ['sometimes', 'nullable', 'string', 'max:255'],
            'discountType' => ['sometimes', 'string', 'in:FIXED,PERCENT'],
            'discountValue' => ['sometimes', 'numeric', 'min:0'],
            'cart' => ['required', 'array', 'min:1'],
            'cart.*.productId' => ['required', 'string'],
            'cart.*.quantity' => ['required', 'numeric', 'gt:0'],
        ]);

        if (! Store::whereKey($input['storeId'])->exists()) {
            return $this->formErrorResponse('Selected store no longer exists');
        }
        if (! empty($input['customerId']) && ! Customer::whereKey($input['customerId'])->exists()) {
            return $this->formErrorResponse('Selected customer no longer exists');
        }

        $heldSale = HeldSale::create([
            'store_id' => $input['storeId'],
            'created_by_id' => Auth::id(),
            'customer_id' => $input['customerId'] ?? null,
            'reference' => $input['reference'] ?? null,
            'cart' => $input['cart'],
            'discount_type' => $input['discountType'] ?? 'FIXED',
            'discount_value' => $input['discountValue'] ?? 0,
        ]);

        $heldSale->load(['customer', 'createdBy']);

        return response()->json(['data' => $heldSale], 201);
    }

    public function destroy(HeldSale $heldSale): JsonResponse
    {
        $heldSale->delete();

        return response()->json(['data' => true]);
    }
}
