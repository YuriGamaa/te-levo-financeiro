<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ESTE ARQUIVO DEVE CRIAR A TABELA DE HISTÓRICO (METRICS), NÃO MEXER NA DE FRANQUIAS
        Schema::create('monthly_metrics', function (Blueprint $table) {
            $table->id();
            
            // Relacionamento com a Franquia
            $table->foreignId('franchise_id')->constrained('franchises')->onDelete('cascade');
            
            // Período
            $table->integer('month');
            $table->integer('year');

            // Métricas de Uso (Inputs)
            $table->integer('count_completed_rides')->default(0);
            $table->integer('count_incomplete_rides')->default(0);
            $table->integer('count_sms')->default(0);
            $table->integer('count_cpf_validation')->default(0);
            $table->integer('count_route_view')->default(0);
            
            // Financeiro Base
            $table->decimal('gross_revenue', 15, 2)->default(0); // Faturamento Bruto

            // Valores Calculados (Outputs Salvos)
            $table->decimal('total_tech_fee', 15, 2)->default(0); // Total Taxas
            $table->decimal('total_royalties', 15, 2)->default(0); // Total Royalties
            $table->decimal('final_bill_value', 15, 2)->default(0); // Boleto Final

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_metrics');
    }
};