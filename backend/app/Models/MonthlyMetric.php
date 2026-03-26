<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'franchise_id', 'month', 'year',
        'count_completed_rides', 'count_incomplete_rides',
        'count_sms', 'count_cpf_validation', 'count_route_view',
        'gross_revenue', 'status',
        'total_tech_fee', 'total_royalties', 'final_bill_value'
    ];
}