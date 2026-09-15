<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Eloquent serializes models using their raw (snake_case) database column
 * names. Every ported React component expects the Next.js/Prisma app's
 * camelCase JSON shape (product.imageUrl, unit.displayName, ...), so every
 * API response's keys are recursively camelCased here instead of adding a
 * transformation layer (API Resource, accessor, etc.) to each of the ~20
 * models individually.
 */
class CamelizeJsonResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response instanceof JsonResponse) {
            $response->setData($this->camelizeKeys($response->getData(true)));
        }

        return $response;
    }

    private function camelizeKeys(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        $isList = array_is_list($value);
        $out = [];
        foreach ($value as $key => $item) {
            $newKey = $isList ? $key : Str::camel((string) $key);
            $out[$newKey] = $this->camelizeKeys($item);
        }

        return $out;
    }
}
