<?php

namespace App\Http\Controllers;

use App\Models\Franchise;
use App\Models\MonthlyMetric; 
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TechFeesController extends Controller
{
    // 1. Salvar Consumo (Input das métricas)
    public function storeMetrics(Request $request, $franchiseId)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            // Validações dos campos numéricos
            'count_completed_rides' => 'nullable|integer',
            'count_incomplete_rides' => 'nullable|integer',
            'count_sms' => 'nullable|integer',
            'count_cpf_validation' => 'nullable|integer',
            'count_route_view' => 'nullable|integer',
            'gross_revenue' => 'nullable|numeric',
        ]);

        // Busca ou Cria o registro daquele mês
        $metrics = MonthlyMetric::updateOrCreate(
            [
                'franchise_id' => $franchiseId,
                'month' => $request->month,
                'year' => $request->year
            ],
            $request->all() // Atualiza os contadores
        );

        // Já recalcula o valor automaticamente
        return $this->calculateBill($metrics->id);
    }

    // 2. A MÁGICA: Calculadora de Royalties e Taxas
    public function calculateBill($metricId)
    {
        $metric = MonthlyMetric::findOrFail($metricId);
        $franchise = Franchise::findOrFail($metric->franchise_id);

        // A. Cálculo de Tecnologia (Variável)
        $techVariable = 
            ($metric->count_completed_rides * $franchise->rate_completed_ride) +
            ($metric->count_incomplete_rides * $franchise->rate_incomplete_ride) +
            ($metric->count_sms * $franchise->rate_sms) +
            ($metric->count_cpf_validation * $franchise->rate_cpf_validation) +
            ($metric->count_route_view * $franchise->rate_route_view);

        // B. Tecnologia Fixa
        $techTotal = $techVariable + $franchise->fixed_tech_fee;

        // C. Royalties (% do Faturamento)
        $royaltiesTotal = ($metric->gross_revenue * $franchise->royalty_percentage) / 100;

        // Salva os totais calculados
        $metric->total_tech_fee = $techTotal;
        $metric->total_royalties = $royaltiesTotal;
        $metric->final_bill_value = $techTotal + $royaltiesTotal;
        $metric->save();

        return response()->json([
            'message' => 'Cálculo realizado com sucesso!',
            'details' => [
                'tech_variable' => $techVariable,
                'tech_fixed' => $franchise->fixed_tech_fee,
                'royalties' => $royaltiesTotal,
                'total' => $metric->final_bill_value
            ],
            'data' => $metric
        ]);
    }
    
    // 3. Listar Histórico da Franquia
    public function index($franchiseId) {
        return MonthlyMetric::where('franchise_id', $franchiseId)
                            ->orderBy('year', 'desc')
                            ->orderBy('month', 'desc')
                            ->get();
    }

    // 4. NOVO MÉTODO: Exportar para CSV (Estilo Planilha Mara)
    public function export(Request $request)
    {
        // Valida os dados que vem do Front (mesmos campos do cálculo)
        $data = $request->validate([
            'franchise_id' => 'required|exists:franchises,id',
            'month' => 'required',
            'year' => 'required',
            'count_completed_rides' => 'required|numeric',
            'count_incomplete_rides' => 'required|numeric',
            'count_sms' => 'required|numeric',
            'count_cpf_validation' => 'required|numeric',
            'count_route_view' => 'required|numeric',
            'gross_revenue' => 'required|numeric',
        ]);

        $franchise = Franchise::findOrFail($data['franchise_id']);

        // Monta a estrutura igual a da planilha para o CSV
        $items = [
            [
                'Item' => 'CORRIDAS FINALIZADAS',
                'Taxa' => number_format($franchise->rate_completed_ride, 2, ',', '.'),
                'Qtd' => $data['count_completed_rides'],
                'Total' => $data['count_completed_rides'] * $franchise->rate_completed_ride
            ],
            [
                'Item' => 'CORRIDAS NAO FINALIZADAS',
                'Taxa' => number_format($franchise->rate_incomplete_ride, 2, ',', '.'),
                'Qtd' => $data['count_incomplete_rides'],
                'Total' => $data['count_incomplete_rides'] * $franchise->rate_incomplete_ride
            ],
            [
                'Item' => 'DISPAROS DE SMS',
                'Taxa' => number_format($franchise->rate_sms, 2, ',', '.'),
                'Qtd' => $data['count_sms'],
                'Total' => $data['count_sms'] * $franchise->rate_sms
            ],
            [
                'Item' => 'VALIDACAO CPF',
                'Taxa' => number_format($franchise->rate_cpf_validation, 2, ',', '.'),
                'Qtd' => $data['count_cpf_validation'],
                'Total' => $data['count_cpf_validation'] * $franchise->rate_cpf_validation
            ],
            [
                'Item' => 'VISUALIZACAO DE MAPAS', // Somando suas duas rotas (Estimativa+Viagem) em uma só visualização se preferir, ou mantemos separado
                'Taxa' => number_format($franchise->rate_route_view, 2, ',', '.'),
                'Qtd' => $data['count_route_view'],
                'Total' => $data['count_route_view'] * $franchise->rate_route_view
            ]
        ];

        // Adiciona Taxa Fixa se tiver
        if ($franchise->fixed_tech_fee > 0) {
            $items[] = [
                'Item' => 'TAXA FIXA MENSAL',
                'Taxa' => '-',
                'Qtd' => 1,
                'Total' => $franchise->fixed_tech_fee
            ];
        }

        // Adiciona Royalties se tiver
        $royalties = ($data['gross_revenue'] * $franchise->royalty_percentage) / 100;
        if ($royalties > 0) {
            $items[] = [
                'Item' => "ROYALTIES ({$franchise->royalty_percentage}%)",
                'Taxa' => "{$franchise->royalty_percentage}%",
                'Qtd' => 1,
                'Total' => $royalties
            ];
        }

        // Gera o nome do arquivo
        $fileName = "Fechamento_{$franchise->name}_{$data['month']}_{$data['year']}.csv";

        // Prepara o cabeçalho HTTP para download
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        // Função que escreve o CSV linha por linha
        $callback = function() use ($items, $franchise, $data) {
            $file = fopen('php://output', 'w');

            // Cabeçalho Estilizado (Igual Planilha Mara)
            fputcsv($file, ['RELATORIO DE FECHAMENTO - TE LEVO']);
            fputcsv($file, ['FRANQUIA:', mb_strtoupper($franchise->name)]);
            fputcsv($file, ['PERIODO:', "{$data['month']}/{$data['year']}"]);
            fputcsv($file, []); // Linha vazia
            
            // Títulos das Colunas
            fputcsv($file, ['DESCRICAO', 'TAXA (R$)', 'QUANTIDADE', 'TOTAL (R$)']);

            $totalGeral = 0;
            foreach ($items as $row) {
                fputcsv($file, [
                    $row['Item'], 
                    $row['Taxa'], 
                    $row['Qtd'], 
                    number_format($row['Total'], 2, ',', '.') // Formato Brasileiro
                ]);
                $totalGeral += $row['Total'];
            }

            fputcsv($file, []);
            fputcsv($file, ['TOTAL A PAGAR', '', '', number_format($totalGeral, 2, ',', '.')]);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}