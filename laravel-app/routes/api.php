<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DrugScheduleController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\TaxClassificationController;
use App\Http\Controllers\TaxComponentController;
use App\Http\Controllers\TaxGroupController;
use App\Http\Controllers\UnitCategoryController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UploadController;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::get('/settings/currency', fn () => response()->json(['data' => Setting::singleton()->toCurrencyFormat()]));

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/catalog', [ProductController::class, 'catalog']);
    Route::get('/products/form-options', [ProductController::class, 'formOptions']);
    Route::get('/products/{product}/form-options', [ProductController::class, 'formOptions']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::match(['put', 'patch'], '/products/{product}', [ProductController::class, 'update']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::match(['put', 'patch'], '/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::get('/brands', [BrandController::class, 'index']);
    Route::post('/brands', [BrandController::class, 'store']);
    Route::match(['put', 'patch'], '/brands/{brand}', [BrandController::class, 'update']);
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy']);

    Route::get('/units', [UnitController::class, 'index']);
    Route::post('/units', [UnitController::class, 'store']);
    Route::match(['put', 'patch'], '/units/{unit}', [UnitController::class, 'update']);
    Route::delete('/units/{unit}', [UnitController::class, 'destroy']);

    Route::get('/unit-categories', [UnitCategoryController::class, 'index']);
    Route::post('/unit-categories', [UnitCategoryController::class, 'store']);
    Route::match(['put', 'patch'], '/unit-categories/{unit_category}', [UnitCategoryController::class, 'update']);
    Route::delete('/unit-categories/{unit_category}', [UnitCategoryController::class, 'destroy']);

    Route::post('/uploads/products', [UploadController::class, 'products']);
    Route::post('/uploads/brands', [UploadController::class, 'brands']);

    Route::get('/tax-components', [TaxComponentController::class, 'index']);
    Route::post('/tax-components', [TaxComponentController::class, 'store']);
    Route::match(['put', 'patch'], '/tax-components/{tax_component}', [TaxComponentController::class, 'update']);
    Route::delete('/tax-components/{tax_component}', [TaxComponentController::class, 'destroy']);

    Route::get('/tax-classifications', [TaxClassificationController::class, 'index']);
    Route::post('/tax-classifications', [TaxClassificationController::class, 'store']);
    Route::match(['put', 'patch'], '/tax-classifications/{tax_classification}', [TaxClassificationController::class, 'update']);
    Route::delete('/tax-classifications/{tax_classification}', [TaxClassificationController::class, 'destroy']);

    Route::get('/tax-groups', [TaxGroupController::class, 'index']);
    Route::post('/tax-groups', [TaxGroupController::class, 'store']);
    Route::match(['put', 'patch'], '/tax-groups/{tax_group}', [TaxGroupController::class, 'update']);
    Route::delete('/tax-groups/{tax_group}', [TaxGroupController::class, 'destroy']);

    Route::get('/drug-schedules', [DrugScheduleController::class, 'index']);
    Route::post('/drug-schedules', [DrugScheduleController::class, 'store']);
    Route::match(['put', 'patch'], '/drug-schedules/{drug_schedule}', [DrugScheduleController::class, 'update']);
    Route::delete('/drug-schedules/{drug_schedule}', [DrugScheduleController::class, 'destroy']);

    Route::get('/quotations', [QuotationController::class, 'index']);
    Route::post('/quotations', [QuotationController::class, 'store']);
    Route::post('/quotations/calculate', [QuotationController::class, 'calculate']);
    Route::get('/quotations/{quotation}', [QuotationController::class, 'show']);
    Route::put('/quotations/{quotation}', [QuotationController::class, 'update']);
    Route::delete('/quotations/{quotation}', [QuotationController::class, 'destroy']);
    Route::patch('/quotations/{quotation}/status', [QuotationController::class, 'updateStatus']);

    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/stores', [StoreController::class, 'index']);

    Route::post('/sales', [SaleController::class, 'store']);
});
