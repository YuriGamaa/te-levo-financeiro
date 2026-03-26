<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // GOLPE DE MISERICÓRDIA NO ERRO 419:
        // Como o senhor está usando Bearer Token (Stateless), o CSRF deve ser ignorado.
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'login',
        ]);

        // Removido o statefulApi() para evitar que o Laravel tente injetar 
        // lógica de Cookies/Sessão onde o senhor quer apenas Token Bearer.
        // Se o senhor quiser manter, o validateCsrfTokens acima é obrigatório.
        
        $middleware->alias([
            'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        
        // Impede o redirecionamento para a página de login (que causava o erro GET 405)
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Não autenticado ou token expirado.'
                ], 401);
            }
        });

        // Força resposta JSON para qualquer erro dentro do prefixo /api
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
        
    })->create();