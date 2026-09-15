<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'locale' => fn () => $this->resolveLocale($request),
            'currencyFormat' => fn () => Setting::singleton()->toCurrencyFormat(),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /** Explicit cookie (set by the language switcher) wins; otherwise falls
     * back to the browser's Accept-Language, then to English. Mirrors the
     * original Next.js app's getLocale() exactly. */
    private function resolveLocale(Request $request): string
    {
        $cookieLocale = $request->cookie('NEXT_LOCALE');
        if (in_array($cookieLocale, ['en', 'ar'], true)) {
            return $cookieLocale;
        }

        $header = $request->header('Accept-Language', '');
        foreach (explode(',', $header) as $part) {
            $tag = strtolower(trim(explode(';', $part)[0] ?? ''));
            $base = explode('-', $tag)[0] ?? '';
            if (in_array($base, ['en', 'ar'], true)) {
                return $base;
            }
        }

        return 'en';
    }
}
