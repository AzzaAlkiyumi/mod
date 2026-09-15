<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
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
});
