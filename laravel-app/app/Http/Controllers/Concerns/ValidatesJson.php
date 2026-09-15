<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator as ValidatorFacade;
use Illuminate\Validation\ValidationException;

/** Keeps every catalog controller's JSON error body in the same
 * {error:{formErrors, fieldErrors}} shape the SPA's api.ts error handling
 * expects (mirrors the original Next.js app's Zod `.flatten()` contract). */
trait ValidatesJson
{
    protected function jsonValidate(Request $request, array $rules): array
    {
        $validator = ValidatorFacade::make($request->all(), $rules);
        if ($validator->fails()) {
            throw new ValidationException($validator, $this->validationErrorResponse($validator));
        }

        return $validator->validated();
    }

    protected function validationErrorResponse(Validator $validator): JsonResponse
    {
        return response()->json([
            'error' => ['formErrors' => [], 'fieldErrors' => $validator->errors()->toArray()],
        ], 400);
    }

    protected function formErrorResponse(string $message, int $status = 400): JsonResponse
    {
        return response()->json(['error' => ['formErrors' => [$message]]], $status);
    }

    protected function uniqueViolation(QueryException $e, string $message): JsonResponse
    {
        if ((string) $e->getCode() === '23505') {
            return $this->formErrorResponse($message, 409);
        }
        throw $e;
    }

    protected function foreignKeyViolation(QueryException $e, string $message): JsonResponse
    {
        if ((string) $e->getCode() === '23503') {
            return $this->formErrorResponse($message, 409);
        }
        throw $e;
    }
}
