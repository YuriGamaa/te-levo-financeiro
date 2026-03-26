<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FranchiseController;
use App\Http\Controllers\TransactionController;

/*
|--------------------------------------------------------------------------
| API Routes - Grupo Amsterdam
|--------------------------------------------------------------------------
*/

// Rota Pública de Autenticação
// Adicionado o nome da rota para evitar redirecionamentos indesejados
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Rotas Protegidas via Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    // Perfil do Usuário Logado
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // --- TRANSAÇÕES ---
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);

    // --- USUÁRIOS ---
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // --- FRANQUIAS ---
    Route::get('/franchises', [FranchiseController::class, 'index']);
    Route::post('/franchises', [FranchiseController::class, 'store']);
    Route::get('/franchises/{franchise}', [FranchiseController::class, 'show']);
    Route::put('/franchises/{franchise}', [FranchiseController::class, 'update']);
    Route::delete('/franchises/{franchise}', [FranchiseController::class, 'destroy']);
});