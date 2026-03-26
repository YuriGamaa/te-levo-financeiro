<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth; 

class UserController extends Controller
{
    // 1. Listar usuários
    public function index()
    {
        $currentUser = Auth::user();

        // Se for ADMIN, vê todo mundo
        if ($currentUser->role === 'admin') {
            return User::with('franchise')->orderBy('id', 'desc')->get();
        }

        // Se for SECRETÁRIA, ela não deve ver a lista de usuários (segurança)
        // Ou, se preferir, pode retornar apenas o perfil dela mesma.
        if ($currentUser->role === 'secretary') {
            return response()->json([$currentUser], 200); 
        }

        // Se for FRANQUEADO, vê toda a equipe da cidade dele (Inclusive as secretárias)
        return User::where('franchise_id', $currentUser->franchise_id)
                   ->with('franchise')
                   ->orderBy('id', 'desc')
                   ->get();
    }

    // 2. Criar novo usuário (Ajustado para aceitar Secretária)
    public function store(Request $request)
    {
        $currentUser = Auth::user();

        // Validação Inicial
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,franchisee,employee,secretary', // <--- Aceita 'secretary'
            'franchise_id' => 'nullable|exists:franchises,id' 
        ]);

        $data = $request->all();

        // --- BLINDAGEM DE SEGURANÇA ---
        // Se quem está criando é um FRANQUEADO (não é admin)...
        if ($currentUser->role !== 'admin') {
            
            // 1. Permite criar apenas 'employee' (Operacional) ou 'secretary' (Secretária)
            // Se tentar criar 'admin' ou 'franchisee', forçamos 'employee'.
            if (!in_array($data['role'], ['employee', 'secretary'])) {
                 $data['role'] = 'employee';
            }
            
            // 2. Força a franquia ser a mesma de quem está criando
            $data['franchise_id'] = $currentUser->franchise_id;
        }

        // Criptografa a senha
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    // 3. Mostrar um usuário
    public function show($id)
    {
        $currentUser = Auth::user();
        $user = User::with('franchise')->findOrFail($id);

        // Franqueado ou Secretária só veem gente da sua própria franquia
        if ($currentUser->role !== 'admin' && $user->franchise_id !== $currentUser->franchise_id) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }

        return $user;
    }

    // 4. Atualizar usuário
    public function update(Request $request, $id)
    {
        $currentUser = Auth::user();
        $user = User::findOrFail($id);

        // Segurança: Apenas Admin ou o Dono da Franquia podem editar
        // Secretária não edita ninguém (nem ela mesma por aqui, idealmente)
        if ($currentUser->role !== 'admin' && $user->franchise_id !== $currentUser->franchise_id) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|string|in:admin,franchisee,employee,secretary',
            'franchise_id' => 'nullable|exists:franchises,id'
        ]);

        // Segurança Extra: Franqueado não pode promover ninguém a Admin
        if ($currentUser->role !== 'admin' && isset($validated['role']) && $validated['role'] === 'admin') {
            return response()->json(['message' => 'Você não tem permissão para criar Admins'], 403);
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    // 5. Deletar usuário
    public function destroy($id)
    {
        $currentUser = Auth::user();
        $user = User::findOrFail($id);

        // Segurança: Franqueado só apaga sua própria equipe
        if ($currentUser->role !== 'admin' && $user->franchise_id !== $currentUser->franchise_id) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Usuário removido com sucesso']);
    }
}