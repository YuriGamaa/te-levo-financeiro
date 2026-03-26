<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Franchise;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CRIAR ADMIN (Guardamos na variável $admin para usar o ID depois)
        $admin = User::firstOrCreate(
            ['email' => 'admin@televo.com'],
            [
                'name' => 'Diretoria Te Levo',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
            ]
        );

        // 2. CRIAR FRANQUIA UBERLÂNDIA
        $uberlandia = Franchise::create([
            'name' => 'Te Levo Uberlândia',
            'location' => 'Minas Gerais',
            'investment_goal' => 100000.00,
            'rate_completed_ride' => 0.32,
            'rate_incomplete_ride' => 0.16,
            'rate_sms' => 0.13,
            'rate_cpf_validation' => 0.13,
            'rate_route_view' => 0.04,
            'cost_completed_ride' => 0.26,
            'cost_incomplete_ride' => 0.13,
            'cost_sms' => 0.13,
            'cost_cpf_validation' => 0.13,
            'cost_route_view' => 0.02,
            'fixed_tech_fee' => 0.00,
            'royalty_percentage' => 5.00
        ]);

        // 3. OUTRAS FRANQUIAS
        $uberaba = Franchise::create([
            'name' => 'Te Levo Uberaba',
            'location' => 'Minas Gerais',
            'investment_goal' => 80000.00,
            'rate_completed_ride' => 0.30, 
            'cost_completed_ride' => 0.26, 
            'fixed_tech_fee' => 1500.00,
            'royalty_percentage' => 4.00
        ]);

        $sorocaba = Franchise::create([
            'name' => 'Te Levo Sorocaba',
            'location' => 'São Paulo',
            'investment_goal' => 120000.00,
            'rate_completed_ride' => 0.35,
            'cost_completed_ride' => 0.26,
            'royalty_percentage' => 6.00
        ]);

        // 4. TRANSAÇÕES FINANCEIRAS
        $franchises = [$uberlandia, $uberaba, $sorocaba];
        $categories = ['sales', 'operational', 'personnel', 'taxes'];

        foreach ($franchises as $franchise) {
            for ($i = 0; $i < 20; $i++) {
                $date = Carbon::now()->subDays(rand(1, 30));
                
                if (rand(1, 100) > 30) {
                    Transaction::create([
                        'franchise_id' => $franchise->id,
                        'user_id' => $admin->id, // <-- AJUSTE AQUI
                        'type' => 'income',
                        'category' => 'sales',
                        'description' => 'Faturamento Corridas App',
                        'amount' => rand(1500, 5000),
                        'date' => $date
                    ]);
                } else {
                    Transaction::create([
                        'franchise_id' => $franchise->id,
                        'user_id' => $admin->id, // <-- AJUSTE AQUI
                        'type' => 'expense',
                        'category' => $categories[array_rand($categories)],
                        'description' => 'Pagamento Operacional',
                        'amount' => rand(200, 1500),
                        'date' => $date
                    ]);
                }
            }
            
            // Marketing
            Transaction::create([
                'franchise_id' => $franchise->id,
                'user_id' => $admin->id, // <-- AJUSTE AQUI
                'type' => 'expense',
                'category' => 'marketing',
                'description' => 'Meta Ads - Campanha',
                'amount' => rand(2000, 5000),
                'date' => Carbon::now()->subDays(5)
            ]);
        }
    }
}