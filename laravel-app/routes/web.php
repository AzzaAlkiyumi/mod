<?php

use Illuminate\Support\Facades\Route;

// Pure SPA: every non-API, non-asset path serves the same shell and React
// Router takes over client-side routing from there (see resources/js/app.tsx).
Route::get('/{any}', fn () => view('app'))->where('any', '^(?!api|storage|up).*$');
