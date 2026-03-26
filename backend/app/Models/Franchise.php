<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Franchise extends Model
{
    protected $fillable = [
        'name',
        'location',
        'active',
        'investment_goal',
        'rate_completed_ride',
        'rate_incomplete_ride',
        'rate_sms',
        'rate_cpf_validation',
        'rate_route_view',
        'fixed_tech_fee',
        'royalty_percentage',
        'cost_completed_ride',
        'cost_incomplete_ride',
        'cost_sms',
        'cost_cpf_validation',
        'cost_route_view'
    ];
}