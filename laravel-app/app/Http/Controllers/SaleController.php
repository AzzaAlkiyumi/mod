<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Store;
use App\Models\User;
use App\Support\QuotationCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    use ValidatesJson;

    public function store(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, [
            'storeId' => ['required', 'string'],
            'customerId' => ['sometimes', 'nullable', 'string'],
            'paymentMethod' => ['required', 'string', 'in:CASH,CARD'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
        ]);

        $productIds = collect($input['items'])->pluck('productId');
        $duplicateCount = $productIds->count() - $productIds->unique()->count();
        if ($duplicateCount > 0) {
            return $this->formErrorResponse('Each product can only appear once — adjust the quantity instead');
        }

        $products = Product::with('tax')->whereIn('id', $productIds)->get()->keyBy('id');
        foreach ($input['items'] as $item) {
            if (! $products->has($item['productId'])) {
                return $this->formErrorResponse("Unknown product: {$item['productId']}");
            }
        }

        if (! Store::whereKey($input['storeId'])->exists()) {
            return $this->formErrorResponse('Selected store no longer exists');
        }
        if (! empty($input['customerId']) && ! Customer::whereKey($input['customerId'])->exists()) {
            return $this->formErrorResponse('Selected customer no longer exists');
        }

        // Server is the source of truth for price + tax rate — never trust the client's copy.
        $lineInputs = array_map(function ($item) use ($products) {
            $product = $products[$item['productId']];

            return [
                'quantity' => (float) $item['quantity'],
                'unitPrice' => (float) $product->price,
                'discountType' => 'FIXED',
                'discountValue' => 0.0,
                'taxRate' => $product->tax ? (float) $product->tax->rate : 0.0,
            ];
        }, $input['items']);

        // A POS sale has no discount — this reuses QuotationCalculator purely
        // for its per-line math.
        $totals = QuotationCalculator::totals($lineInputs, 'FIXED', 0.0);

        $currentUser = User::orderBy('created_at')->first();
        $number = 'SE-'.str_pad((string) (Sale::count() + 1), 6, '0', STR_PAD_LEFT);

        $sale = DB::transaction(function () use ($input, $totals, $number, $currentUser) {
            $sale = Sale::create([
                'number' => $number,
                'store_id' => $input['storeId'],
                'created_by_id' => $currentUser?->id,
                'customer_id' => $input['customerId'] ?? null,
                'payment_method' => $input['paymentMethod'],
                'subtotal' => $totals['subtotal'],
                'tax_total' => $totals['taxTotal'],
                'total' => $totals['total'],
            ]);

            foreach ($totals['lines'] as $idx => $line) {
                $sale->items()->create([
                    'product_id' => $input['items'][$idx]['productId'],
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unitPrice'],
                    'tax_rate' => $line['taxRate'],
                    'tax_amount' => $line['taxAmount'],
                    'line_total' => $line['lineTotal'],
                    'sort_order' => $idx,
                ]);
            }

            return $sale;
        });

        $sale->load(['store', 'customer', 'items.product']);

        return response()->json(['data' => $sale], 201);
    }
}
