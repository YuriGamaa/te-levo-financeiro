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
        Schema::create('franchises', function (Blueprint $table) {
            $table->id();
            
            // --- DADOS GERAIS ---
            $table->string('name');             // Ex: Te Levo Uberlândia
            $table->string('location');         // Ex: Minas Gerais
            $table->decimal('investment_goal', 15, 2)->default(0); // Meta de Investimento em Marketing
            $table->boolean('active')->default(true);

            // --- SEÇÃO 1: RECEITA (Quanto a Te Levo COBRA do Franqueado) ---
            // Baseado na parte superior da planilha
            $table->decimal('rate_completed_ride', 10, 2)->default(0.00);  // Ex: 0.32
            $table->decimal('rate_incomplete_ride', 10, 2)->default(0.00); // Ex: 0.16
            $table->decimal('rate_sms', 10, 2)->default(0.00);             // Ex: 0.13
            $table->decimal('rate_cpf_validation', 10, 2)->default(0.00);  // Ex: 0.13
            $table->decimal('rate_route_view', 10, 2)->default(0.00);      // Ex: 0.04
            
            // Taxas Extras
            $table->decimal('fixed_tech_fee', 10, 2)->default(0.00);       // Mensalidade Fixa
            $table->decimal('royalty_percentage', 5, 2)->default(0.00);    // % sobre Faturamento

            // --- SEÇÃO 2: CUSTOS (Quanto a Te Levo PAGA ao Fornecedor) ---
            // Baseado na parte inferior da planilha (Módulo de Lucro)
            $table->decimal('cost_completed_ride', 10, 2)->default(0.00);  // Ex: 0.26
            $table->decimal('cost_incomplete_ride', 10, 2)->default(0.00); // Ex: 0.13
            $table->decimal('cost_sms', 10, 2)->default(0.00);             // Ex: 0.13
            $table->decimal('cost_cpf_validation', 10, 2)->default(0.00);  // Ex: 0.13
            $table->decimal('cost_route_view', 10, 2)->default(0.00);      // Ex: 0.02

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('franchises');
    }
};