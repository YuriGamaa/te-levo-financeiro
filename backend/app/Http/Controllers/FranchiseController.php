<?php

namespace App\Http\Controllers;

use App\Models\Franchise;
use Illuminate\Http\Request;

class FranchiseController extends Controller
{
    // Listar todas
    public function index()
    {
        return Franchise::all();
    }

    // Criar nova (Blindado)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'investment_goal' => 'nullable|numeric',
        ]);

        // Correção: Mapeamos campo a campo para evitar erro de dados extras
        $franchise = Franchise::create([
            'name' => $request->name,
            'location' => $request->location,
            // Se não vier meta, definimos 50000 como padrão
            'investment_goal' => $request->investment_goal ?? 50000, 
        ]);

        return response()->json($franchise, 201);
    }

    // Buscar UMA específica
    public function show($id)
    {
        return Franchise::findOrFail($id);
    }

    // Atualizar (Blindado)
    public function update(Request $request, $id)
    {
        $franchise = Franchise::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'investment_goal' => 'nullable|numeric',
        ]);

        // Correção: Atualizamos apenas o que interessa
        $franchise->update([
            'name' => $request->name,
            'location' => $request->location,
            'investment_goal' => $request->investment_goal ?? $franchise->investment_goal,
        ]);

        return response()->json($franchise, 200);
    }

    // Deletar
    public function destroy($id)
    {
        Franchise::destroy($id);
        return response()->json(null, 204);
    }
}