<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    /**
     * Listar (Extrato) com isolamento e stats
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        // Garante que se não for admin, ele nunca veja dados de outra franquia
        $franchiseId = ($user->role === 'admin') 
            ? $request->query('franchise_id', $user->franchise_id) 
            : $user->franchise_id;

        $transactions = Transaction::where('franchise_id', $franchiseId)
                            ->orderBy('date', 'desc')
                            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');

        return response()->json([
            'transactions' => $transactions,
            'stats' => [
                'income' => (float)$income,
                'expense' => (float)$expense,
                'balance' => (float)($income - $expense)
            ]
        ]);
    }

    /**
     * Criar Lançamento
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => 'required|string',
            'amount'      => 'required|numeric',
            'type'        => 'required|in:income,expense',
            'category'    => 'required|string',
            'date'        => 'required|date',
            'unit_value'  => 'nullable|numeric',
            'quantity'    => 'nullable|integer',
        ]);

        $user = Auth::user();

        $transaction = Transaction::create(array_merge($data, [
            'user_id'      => $user->id,
            'franchise_id' => $user->franchise_id, // Lança sempre na franquia do autor
            'quantity'     => $request->quantity ?? 1
        ]));

        return response()->json($transaction, 201);
    }

    /**
     * Atualizar Lançamento
     */
    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        $user = Auth::user();

        // Trava de Segurança: Somente dono ou Admin da própria franquia
        if ($user->role !== 'admin' && $user->id !== $transaction->user_id) {
            return response()->json(['message' => 'Não autorizado'], 403);
        }

        $data = $request->validate([
            'description' => 'sometimes|string',
            'amount'      => 'sometimes|numeric',
            'type'        => 'sometimes|in:income,expense',
            'category'    => 'sometimes|string',
            'date'        => 'sometimes|date',
            'unit_value'  => 'nullable|numeric',
            'quantity'    => 'nullable|integer',
        ]);

        $transaction->update($data);

        return response()->json($transaction);
    }

    /**
     * Excluir Lançamento
     */
    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $user = Auth::user();

        // Trava de Segurança Dupla: Unidade + Autoridade
        if ($user->role !== 'admin' && $user->id !== $transaction->user_id) {
            return response()->json(['message' => 'Não autorizado para excluir este registro'], 403);
        }

        // Garante que nem um Admin de outra franquia possa apagar via ID
        if ($user->role === 'admin' && $user->franchise_id !== $transaction->franchise_id) {
             return response()->json(['message' => 'Acesso negado à unidade'], 403);
        }

        $transaction->delete();

        return response()->json(['message' => 'Removido com sucesso']);
    }
}