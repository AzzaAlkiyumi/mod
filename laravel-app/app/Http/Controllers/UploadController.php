<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    use ValidatesJson;

    private const ALLOWED = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    private const MAX_BYTES = 5 * 1024 * 1024;

    public function products(Request $request): JsonResponse
    {
        return $this->store($request, 'products');
    }

    public function brands(Request $request): JsonResponse
    {
        return $this->store($request, 'brands');
    }

    private function store(Request $request, string $folder): JsonResponse
    {
        $file = $request->file('file');
        if (! $file || ! $file->isValid()) {
            return $this->formErrorResponse('No file provided');
        }

        $ext = self::ALLOWED[$file->getMimeType()] ?? null;
        if (! $ext) {
            return $this->formErrorResponse('Only JPG, PNG, or WebP images are allowed');
        }
        if ($file->getSize() > self::MAX_BYTES) {
            return $this->formErrorResponse('Image must be smaller than 5MB');
        }

        $filename = Str::uuid()->toString().'.'.$ext;
        $file->storeAs("uploads/{$folder}", $filename, 'public');

        return response()->json(['data' => ['url' => "/storage/uploads/{$folder}/{$filename}"]], 201);
    }
}
