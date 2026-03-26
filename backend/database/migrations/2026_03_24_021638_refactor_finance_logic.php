<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ajustes na tabela de Franquias (Localização e Identificação de Matriz)
        Schema::table('franchises', function (Blueprint $table) {
            if (!Schema::hasColumn('franchises', 'location')) {
                $table->string('location')->nullable();
            }
            if (!Schema::hasColumn('franchises', 'is_matriz')) {
                $table->boolean('is_matriz')->default(false);
            }
        });

        // 2. Ajustes na tabela de Transações (Suporte a Edição Detalhada e Quantidade)
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'unit_value')) {
                $table->decimal('unit_value', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('transactions', 'quantity')) {
                $table->integer('quantity')->default(1);
            }
        });

        // 3. Nova tabela para o Demonstrativo (Itens dinâmicos do botão +)
        // Esta tabela isola o acerto de contas do fluxo de caixa diário.
        if (!Schema::hasTable('demonstrative_items')) {
            Schema::create('demonstrative_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('franchise_id')->constrained()->onDelete('cascade');
                $table->string('description');
                $table->decimal('unit_value', 15, 2);
                $table->integer('quantity');
                $table->string('reference_month'); // Formato YYYY-MM
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demonstrative_items');
        
        Schema::table('franchises', function (Blueprint $table) {
            $table->dropColumn(['location', 'is_matriz']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['unit_value', 'quantity']);
        });
    }
};