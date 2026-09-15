<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\Store;
use App\Models\User;
use App\Support\QuotationCalculator;
use App\Support\QuotationRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator as ValidatorFacade;
use Illuminate\Validation\ValidationException;

class QuotationController extends Controller
{
    use ValidatesJson;

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $from = $request->query('from');
        $to = $request->query('to');
        $q = trim((string) $request->query('q', ''));
        $page = max(1, (int) $request->query('page', 1));
        $pageSize = min(100, max(1, (int) $request->query('pageSize', 20)));

        $query = Quotation::with(['store', 'customer', 'items.product']);

        if ($status && in_array($status, QuotationRules::STATUSES, true)) {
            $query->where('status', $status);
        }
        if ($from) {
            $query->whereDate('issue_date', '>=', $from);
        }
        if ($to) {
            $query->whereDate('issue_date', '<=', $to);
        }
        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('number', 'ilike', "%{$q}%")
                    ->orWhere('prospect_name', 'ilike', "%{$q}%")
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'ilike', "%{$q}%"))
                    ->orWhereHas('items.product', fn ($p) => $p->where('name', 'ilike', "%{$q}%")->orWhere('sku', 'ilike', "%{$q}%"));
            });
        }

        $total = (clone $query)->count();
        $quotations = $query->orderByDesc('created_at')
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->get();

        return response()->json([
            'data' => $quotations,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'pageSize' => $pageSize,
                'pageCount' => max(1, (int) ceil($total / $pageSize)),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->validateForm($request);

        $products = Product::with('tax')->whereIn('id', collect($input['items'])->pluck('productId'))->get()->keyBy('id');
        foreach ($input['items'] as $item) {
            if (! $products->has($item['productId'])) {
                return $this->formErrorResponse("Unknown product: {$item['productId']}");
            }
        }

        $customer = null;
        if (! empty($input['customerId'])) {
            $customer = Customer::find($input['customerId']);
            if (! $customer) {
                return $this->formErrorResponse('Selected customer no longer exists');
            }
        }

        if (! Store::whereKey($input['storeId'])->exists()) {
            return $this->formErrorResponse('Selected store no longer exists');
        }

        $lineInputs = array_map(function ($item) use ($products) {
            $product = $products[$item['productId']];

            return [
                'quantity' => (float) $item['quantity'],
                'unitPrice' => (float) $product->price,
                'discountType' => $item['discountType'] ?? 'FIXED',
                'discountValue' => (float) ($item['discountValue'] ?? 0),
                'taxRate' => $product->tax ? (float) $product->tax->rate : 0.0,
            ];
        }, $input['items']);

        $discountType = $customer?->discount_type ?? 'FIXED';
        $discountValue = $customer ? (float) $customer->discount_value : 0.0;

        $totals = QuotationCalculator::totals($lineInputs, $discountType, $discountValue);

        $currentUser = User::orderBy('created_at')->first();
        $number = 'QT-'.str_pad((string) (Quotation::count() + 1), 6, '0', STR_PAD_LEFT);
        $hasCustomer = ! empty($input['customerId']);

        $quotation = DB::transaction(function () use ($input, $totals, $number, $currentUser, $discountType, $discountValue, $hasCustomer) {
            $quotation = Quotation::create([
                'number' => $number,
                'store_id' => $input['storeId'],
                'created_by_id' => $currentUser?->id,
                'customer_id' => $input['customerId'] ?? null,
                'prospect_name' => $hasCustomer ? null : ($input['prospectName'] ?? null),
                'prospect_email' => $hasCustomer ? null : ($input['prospectEmail'] ?? null),
                'prospect_phone' => $hasCustomer ? null : ($input['prospectPhone'] ?? null),
                'billing_address' => $input['billingAddress'] ?? null,
                'shipping_address' => $input['shippingAddress'] ?? null,
                'issue_date' => $input['issueDate'],
                'valid_until' => $input['validUntil'] ?? null,
                'expected_delivery_date' => $input['expectedDeliveryDate'] ?? null,
                'terms_and_conditions' => $input['termsAndConditions'] ?? null,
                'customer_notes' => $input['customerNotes'] ?? null,
                'status' => 'DRAFT',
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discountTotal'],
                'tax_total' => $totals['taxTotal'],
                'total' => $totals['total'],
            ]);

            foreach ($totals['lines'] as $idx => $line) {
                $quotation->items()->create([
                    'product_id' => $input['items'][$idx]['productId'],
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unitPrice'],
                    'discount_type' => $line['discountType'],
                    'discount_value' => $line['discountValue'],
                    'tax_rate' => $line['taxRate'],
                    'subtotal' => $line['taxableAmount'],
                    'tax_amount' => $line['taxAmount'],
                    'line_total' => $line['lineTotal'],
                    'sort_order' => $idx,
                ]);
            }

            return $quotation;
        });

        $quotation->load(['store', 'customer', 'items.product']);

        return response()->json(['data' => $quotation], 201);
    }

    public function show(Quotation $quotation): JsonResponse
    {
        $quotation->load(['store', 'customer', 'createdBy', 'items.product.tax', 'items.product.unit']);

        return response()->json(['data' => $quotation]);
    }

    public function update(Request $request, Quotation $quotation): JsonResponse
    {
        if (! QuotationRules::isEditable($quotation->status)) {
            return $this->formErrorResponse(
                "A quotation with status \"{$quotation->status}\" can no longer be edited",
                409,
            );
        }

        $input = $this->validateForm($request);

        $products = Product::with('tax')->whereIn('id', collect($input['items'])->pluck('productId'))->get()->keyBy('id');
        foreach ($input['items'] as $item) {
            if (! $products->has($item['productId'])) {
                return $this->formErrorResponse("Unknown product: {$item['productId']}");
            }
        }

        $customer = null;
        if (! empty($input['customerId'])) {
            $customer = Customer::find($input['customerId']);
            if (! $customer) {
                return $this->formErrorResponse('Selected customer no longer exists');
            }
        }

        $lineInputs = array_map(function ($item) use ($products) {
            $product = $products[$item['productId']];

            return [
                'quantity' => (float) $item['quantity'],
                'unitPrice' => (float) $product->price,
                'discountType' => $item['discountType'] ?? 'FIXED',
                'discountValue' => (float) ($item['discountValue'] ?? 0),
                'taxRate' => $product->tax ? (float) $product->tax->rate : 0.0,
            ];
        }, $input['items']);

        $discountType = $customer?->discount_type ?? 'FIXED';
        $discountValue = $customer ? (float) $customer->discount_value : 0.0;

        $totals = QuotationCalculator::totals($lineInputs, $discountType, $discountValue);
        $hasCustomer = ! empty($input['customerId']);

        DB::transaction(function () use ($quotation, $input, $totals, $discountType, $discountValue, $hasCustomer) {
            $quotation->items()->delete();
            $quotation->update([
                'store_id' => $input['storeId'],
                'customer_id' => $input['customerId'] ?? null,
                'prospect_name' => $hasCustomer ? null : ($input['prospectName'] ?? null),
                'prospect_email' => $hasCustomer ? null : ($input['prospectEmail'] ?? null),
                'prospect_phone' => $hasCustomer ? null : ($input['prospectPhone'] ?? null),
                'billing_address' => $input['billingAddress'] ?? null,
                'shipping_address' => $input['shippingAddress'] ?? null,
                'issue_date' => $input['issueDate'],
                'valid_until' => $input['validUntil'] ?? null,
                'expected_delivery_date' => $input['expectedDeliveryDate'] ?? null,
                'terms_and_conditions' => $input['termsAndConditions'] ?? null,
                'customer_notes' => $input['customerNotes'] ?? null,
                'discount_type' => $discountType,
                'discount_value' => $discountValue,
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discountTotal'],
                'tax_total' => $totals['taxTotal'],
                'total' => $totals['total'],
            ]);

            foreach ($totals['lines'] as $idx => $line) {
                $quotation->items()->create([
                    'product_id' => $input['items'][$idx]['productId'],
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unitPrice'],
                    'discount_type' => $line['discountType'],
                    'discount_value' => $line['discountValue'],
                    'tax_rate' => $line['taxRate'],
                    'subtotal' => $line['taxableAmount'],
                    'tax_amount' => $line['taxAmount'],
                    'line_total' => $line['lineTotal'],
                    'sort_order' => $idx,
                ]);
            }
        });

        $quotation->load(['store', 'customer', 'items.product']);

        return response()->json(['data' => $quotation]);
    }

    public function destroy(Quotation $quotation): JsonResponse
    {
        if (! QuotationRules::isDeletable($quotation->status)) {
            return $this->formErrorResponse('A converted quotation cannot be deleted', 409);
        }

        $quotation->delete();

        return response()->json(['data' => ['id' => $quotation->id]]);
    }

    public function updateStatus(Request $request, Quotation $quotation): JsonResponse
    {
        $input = $this->jsonValidate($request, [
            'status' => ['required', 'string', 'in:'.implode(',', QuotationRules::STATUSES)],
        ]);
        $nextStatus = $input['status'];

        if (! QuotationRules::canTransition($quotation->status, $nextStatus)) {
            return $this->formErrorResponse(
                "Cannot move a quotation from \"{$quotation->status}\" to \"{$nextStatus}\"",
                409,
            );
        }

        if ($nextStatus === 'CONVERTED' && ! QuotationRules::isConvertible($quotation->status)) {
            return $this->formErrorResponse('Only an accepted quotation can be converted to a sale', 409);
        }

        $quotation->update([
            'status' => $nextStatus,
            'converted_at' => $nextStatus === 'CONVERTED' ? now() : $quotation->converted_at,
        ]);
        $quotation->load(['store', 'customer', 'items.product']);

        return response()->json(['data' => $quotation]);
    }

    /** Live totals preview while a quotation is being drafted in the UI. */
    public function calculate(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, [
            'discountType' => ['sometimes', 'string', 'in:PERCENT,FIXED'],
            'discountValue' => ['sometimes', 'numeric', 'min:0'],
            // "present" (not "required") — the calculate preview fires on an
            // empty draft too, before any product has been added.
            'items' => ['present', 'array'],
            'items.*.quantity' => ['sometimes', 'numeric', 'min:0'],
            'items.*.unitPrice' => ['sometimes', 'numeric', 'min:0'],
            'items.*.discountType' => ['sometimes', 'string', 'in:PERCENT,FIXED'],
            'items.*.discountValue' => ['sometimes', 'numeric', 'min:0'],
            'items.*.taxRate' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $lines = array_map(fn ($item) => [
            'quantity' => (float) ($item['quantity'] ?? 0),
            'unitPrice' => (float) ($item['unitPrice'] ?? 0),
            'discountType' => $item['discountType'] ?? 'FIXED',
            'discountValue' => (float) ($item['discountValue'] ?? 0),
            'taxRate' => (float) ($item['taxRate'] ?? 0),
        ], $input['items']);

        $totals = QuotationCalculator::totals($lines, $input['discountType'] ?? 'FIXED', (float) ($input['discountValue'] ?? 0));

        return response()->json(['data' => $totals]);
    }

    private function validateForm(Request $request): array
    {
        $rules = [
            'storeId' => ['required', 'string'],
            'customerId' => ['sometimes', 'nullable', 'string'],
            'prospectName' => ['sometimes', 'nullable', 'string'],
            'prospectEmail' => ['sometimes', 'nullable', 'string', 'email'],
            'prospectPhone' => ['sometimes', 'nullable', 'string'],
            'billingAddress' => ['sometimes', 'nullable', 'string'],
            'shippingAddress' => ['sometimes', 'nullable', 'string'],
            'issueDate' => ['required', 'date'],
            'validUntil' => ['sometimes', 'nullable', 'date'],
            'expectedDeliveryDate' => ['sometimes', 'nullable', 'date'],
            'termsAndConditions' => ['sometimes', 'nullable', 'string'],
            'customerNotes' => ['sometimes', 'nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unitPrice' => ['required', 'numeric', 'min:0'],
            'items.*.discountType' => ['sometimes', 'string', 'in:PERCENT,FIXED'],
            'items.*.discountValue' => ['sometimes', 'numeric', 'min:0'],
            'items.*.taxRate' => ['sometimes', 'numeric', 'min:0'],
        ];

        $validator = ValidatorFacade::make($request->all(), $rules);

        $validator->after(function ($validator) use ($request) {
            $data = $request->all();
            if (empty($data['customerId']) && empty(trim($data['prospectName'] ?? ''))) {
                $validator->errors()->add('prospectName', 'Select an existing customer or enter a prospect name');
            }
            if (! empty($data['validUntil']) && ! empty($data['issueDate']) && $data['validUntil'] < $data['issueDate']) {
                $validator->errors()->add('validUntil', 'Valid until must be on or after the issue date');
            }
            $productIds = array_column($data['items'] ?? [], 'productId');
            if (count($productIds) !== count(array_unique($productIds))) {
                $validator->errors()->add('items', 'Each product can only appear once — adjust the quantity instead');
            }
        });

        if ($validator->fails()) {
            throw new ValidationException($validator, $this->validationErrorResponse($validator));
        }

        return $validator->validated();
    }
}
