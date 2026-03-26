<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            
            // 1. O SEGREDO: ENUM para separar Recarga de todo o resto
            $table->enum('type', ['income', 'expense', 'recharge'])->default('income');
            
            // 2. FLEXIBILIDADE: User e Franchise opcionais para gastos gerais
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); 
            $table->foreignId('franchise_id')->nullable()->constrained()->onDelete('cascade');
            
            $table->string('description');
            $table->decimal('amount', 15, 2); 
            $table->string('category')->nullable(); // Ex: 'Combustível', 'Manutenção', 'Taxa'
            $table->date('date');
            
            $table->timestamps();
            
            // 3. SEGURANÇA: Permite excluir na interface mantendo o dado oculto no banco
            $table->softDeletes(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};