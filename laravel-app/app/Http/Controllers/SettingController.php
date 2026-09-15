<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ValidatesJson;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use ValidatesJson;

    public function currency(): JsonResponse
    {
        return response()->json(['data' => Setting::singleton()->toCurrencyFormat()]);
    }

    public function updateCurrency(Request $request): JsonResponse
    {
        $input = $this->jsonValidate($request, [
            'currencyCode' => ['required', 'string', 'min:1'],
            'currencySymbol' => ['required', 'string', 'min:1'],
            'currencyDecimals' => ['required', 'integer', 'min:0', 'max:4'],
            'thousandsSeparator' => ['sometimes', 'nullable', 'string', 'max:1'],
            'decimalSeparator' => ['required', 'string', 'min:1', 'max:1'],
            'symbolBeforeAmount' => ['sometimes', 'boolean'],
        ]);

        $setting = Setting::singleton();
        $setting->update([
            'currency_code' => $input['currencyCode'],
            'currency_symbol' => $input['currencySymbol'],
            'currency_decimals' => $input['currencyDecimals'],
            'thousands_separator' => $input['thousandsSeparator'] ?? '',
            'decimal_separator' => $input['decimalSeparator'],
            'symbol_before_amount' => $input['symbolBeforeAmount'] ?? true,
        ]);

        return response()->json(['data' => $setting->toCurrencyFormat()]);
    }
}
