<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Brand;
use App\Models\Category;
use App\Models\DrugSchedule;
use App\Models\Product;
use App\Models\TaxGroup;
use App\Models\Unit;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use ValidatesJson;

    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $categoryId = $request->query('categoryId');
        $takeParam = $request->query('take');
        $take = $takeParam === 'all' ? null : min(200, (int) ($takeParam ?: 20));

        $query = Product::query()->with(['tax', 'category', 'unit', 'brand'])->orderBy('name');

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'ilike', "%{$q}%")
                    ->orWhere('sku', 'ilike', "%{$q}%")
                    ->orWhere('barcode', 'ilike', "%{$q}%");
            });
        }
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }
        if ($take !== null) {
            $query->limit($take);
        }

        return response()->json(['data' => $query->get()]);
    }

    /** Products list page: filters + pagination-free 100-row window, plus
     * the active category list the filter dropdown needs. */
    public function catalog(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $categoryId = $request->query('categoryId');

        $query = Product::query()->with(['tax', 'category', 'unit', 'brand'])
            ->orderByDesc('created_at')
            ->limit(100);

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'ilike', "%{$q}%")
                    ->orWhere('name_ar', 'ilike', "%{$q}%")
                    ->orWhere('sku', 'ilike', "%{$q}%")
                    ->orWhere('barcode', 'ilike', "%{$q}%");
            });
        }
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        return response()->json([
            'data' => [
                'products' => $query->get(),
                'categories' => Category::where('active', true)->orderBy('name')->get(),
            ],
        ]);
    }

    /** Options + (optionally) the existing product for the New/Edit form. */
    public function formOptions(?Product $product = null): JsonResponse
    {
        return response()->json([
            'data' => [
                'categories' => Category::where('active', true)->orderBy('name')->get(['id', 'name']),
                'units' => Unit::where('active', true)->orderBy('display_name')->get(['id', 'display_name as name']),
                'brands' => Brand::where('active', true)->orderBy('name')->get(['id', 'name']),
                'taxes' => TaxGroup::where('active', true)
                    ->orderByDesc('is_default')->orderBy('name')
                    ->get()->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'rate' => (float) $t->rate]),
                'drugSchedules' => DrugSchedule::where('active', true)->orderBy('display_name')
                    ->get()->map(fn ($d) => ['id' => $d->id, 'name' => "{$d->short_code} — {$d->display_name}"]),
                'product' => $product,
            ],
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['tax', 'category', 'unit', 'brand']);

        return response()->json(['data' => $product]);
    }

    public function store(Request $request): JsonResponse
    {
        $input = $this->validateProduct($request, isUpdate: false);

        if ($error = $this->assertReferencesExist($input)) {
            return $error;
        }

        $sku = $input['sku'] ?? $this->generateSku();

        try {
            $product = DB::transaction(function () use ($input, $sku) {
                return Product::create([
                    'sku' => $sku,
                    'barcode' => $input['barcode'] ?? null,
                    'name' => $input['name'],
                    'name_ar' => $input['nameAr'] ?? null,
                    'unit_id' => $input['unitId'],
                    'price' => $input['price'],
                    'tax_id' => $input['taxId'] ?? null,
                    'category_id' => $input['categoryId'] ?? null,
                    'brand_id' => $input['brandId'] ?? null,
                    'image_url' => $input['imageUrl'] ?? null,
                    'description_en' => $input['descriptionEn'] ?? null,
                    'description_ar' => $input['descriptionAr'] ?? null,
                    'short_description' => $input['shortDescription'] ?? null,
                    'available_for_sale' => $input['availableForSale'] ?? true,
                    'featured' => $input['featured'] ?? false,
                    'track_stock' => $input['trackStock'] ?? true,
                    'sold_by_weight' => $input['soldByWeight'] ?? false,
                    'track_batches' => $input['trackBatches'] ?? false,
                    'track_expiry' => $input['trackExpiry'] ?? false,
                    'expiry_date' => $input['expiryDate'] ?? null,
                    'reorder_at' => $input['reorderAt'] ?? null,
                    'reorder_quantity' => $input['reorderQuantity'] ?? null,
                    'cost_price' => $input['costPrice'] ?? null,
                    'mrp' => $input['mrp'] ?? null,
                    'price_includes_tax' => $input['priceIncludesTax'] ?? false,
                    'hsn_code' => $input['hsnCode'] ?? null,
                    'drug_schedule_id' => $input['drugScheduleId'] ?? null,
                    'generic_name' => $input['genericName'] ?? null,
                    'manufacturer' => $input['manufacturer'] ?? null,
                ]);
            });
        } catch (QueryException $e) {
            return $this->uniqueViolationResponse($e);
        }

        $product->load(['tax', 'category', 'unit', 'brand']);

        return response()->json(['data' => $product], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $input = $this->validateProduct($request, isUpdate: true);

        if ($error = $this->assertReferencesExist($input)) {
            return $error;
        }

        $map = [
            'sku' => 'sku', 'barcode' => 'barcode', 'name' => 'name', 'nameAr' => 'name_ar',
            'unitId' => 'unit_id', 'price' => 'price', 'taxId' => 'tax_id',
            'categoryId' => 'category_id', 'brandId' => 'brand_id', 'imageUrl' => 'image_url',
            'descriptionEn' => 'description_en', 'descriptionAr' => 'description_ar',
            'shortDescription' => 'short_description', 'availableForSale' => 'available_for_sale',
            'featured' => 'featured', 'trackStock' => 'track_stock', 'soldByWeight' => 'sold_by_weight',
            'trackBatches' => 'track_batches', 'trackExpiry' => 'track_expiry',
            'expiryDate' => 'expiry_date', 'reorderAt' => 'reorder_at',
            'reorderQuantity' => 'reorder_quantity', 'costPrice' => 'cost_price', 'mrp' => 'mrp',
            'priceIncludesTax' => 'price_includes_tax', 'hsnCode' => 'hsn_code',
            'drugScheduleId' => 'drug_schedule_id', 'genericName' => 'generic_name',
            'manufacturer' => 'manufacturer',
        ];

        $update = [];
        foreach ($map as $inKey => $column) {
            if (array_key_exists($inKey, $input)) {
                $update[$column] = $input[$inKey] === '' && in_array($inKey, ['barcode', 'nameAr', 'taxId', 'categoryId', 'brandId', 'imageUrl', 'descriptionEn', 'descriptionAr', 'shortDescription', 'hsnCode', 'drugScheduleId', 'genericName', 'manufacturer'], true)
                    ? null
                    : $input[$inKey];
            }
        }

        try {
            $product->update($update);
        } catch (QueryException $e) {
            return $this->uniqueViolationResponse($e);
        }

        $product->load(['tax', 'category', 'unit', 'brand']);

        return response()->json(['data' => $product]);
    }

    private function validateProduct(Request $request, bool $isUpdate): array
    {
        $rules = [
            'name' => [$isUpdate ? 'sometimes' : 'required', 'string'],
            'nameAr' => ['sometimes', 'nullable', 'string'],
            'categoryId' => [$isUpdate ? 'sometimes' : 'required', 'string'],
            'unitId' => [$isUpdate ? 'sometimes' : 'required', 'string'],
            'brandId' => ['sometimes', 'nullable', 'string'],
            'price' => [$isUpdate ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'taxId' => ['sometimes', 'nullable', 'string'],
            'sku' => ['sometimes', 'nullable', 'string'],
            'barcode' => ['sometimes', 'nullable', 'string'],
            'descriptionEn' => ['sometimes', 'nullable', 'string'],
            'descriptionAr' => ['sometimes', 'nullable', 'string'],
            'imageUrl' => ['sometimes', 'nullable', 'string'],
            'shortDescription' => ['sometimes', 'nullable', 'string'],
            'availableForSale' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
            'trackStock' => ['sometimes', 'boolean'],
            'soldByWeight' => ['sometimes', 'boolean'],
            'trackBatches' => ['sometimes', 'boolean'],
            'trackExpiry' => ['sometimes', 'boolean'],
            'expiryDate' => ['sometimes', 'nullable', 'date'],
            'reorderAt' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'reorderQuantity' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'costPrice' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'mrp' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'priceIncludesTax' => ['sometimes', 'boolean'],
            'hsnCode' => ['sometimes', 'nullable', 'string'],
            'drugScheduleId' => ['sometimes', 'nullable', 'string'],
            'genericName' => ['sometimes', 'nullable', 'string'],
            'manufacturer' => ['sometimes', 'nullable', 'string'],
        ];

        return $this->jsonValidate($request, $rules);
    }

    private function assertReferencesExist(array $input): ?JsonResponse
    {
        $checks = [
            ['taxId', TaxGroup::class, 'Selected tax no longer exists'],
            ['drugScheduleId', DrugSchedule::class, 'Selected drug schedule no longer exists'],
            ['unitId', Unit::class, 'Selected unit no longer exists'],
            ['categoryId', Category::class, 'Selected category no longer exists'],
            ['brandId', Brand::class, 'Selected brand no longer exists'],
        ];
        foreach ($checks as [$key, $model, $message]) {
            if (! empty($input[$key]) && ! $model::whereKey($input[$key])->exists()) {
                return $this->formErrorResponse($message);
            }
        }

        return null;
    }

    private function uniqueViolationResponse(QueryException $e): JsonResponse
    {
        return $this->uniqueViolation($e, 'A product with this sku/barcode already exists');
    }

    private function generateSku(): string
    {
        $count = Product::count();

        return 'PRD-'.str_pad((string) ($count + 1), 6, '0', STR_PAD_LEFT);
    }
}
