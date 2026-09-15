<?php

use App\Http\Middleware\CamelizeJsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Lets the SPA authenticate via first-party session cookies (Sanctum
        // "SPA authentication") instead of bearer tokens, since the React
        // app is served from the same Laravel origin.
        $middleware->statefulApi();
        $middleware->api(append: [CamelizeJsonResponse::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Every API controller relies on route-model-binding 404s coming
        // back in the same {error:{formErrors:[...]}} shape the rest of
        // the JSON API uses, instead of Laravel's default {message} body.
        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }
            $words = preg_split('/(?=[A-Z])/', class_basename($e->getModel()), -1, PREG_SPLIT_NO_EMPTY);
            $label = $words[0].(count($words) > 1 ? ' '.strtolower(implode(' ', array_slice($words, 1))) : '');

            return response()->json(['error' => ['formErrors' => ["{$label} not found"]]], 404);
        });
    })->create();
