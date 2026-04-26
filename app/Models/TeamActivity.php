<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class TeamActivity extends Model
{
    use HasUlids;

    protected $fillable = [
        'team_member_id',
        'action',
        'log_type',
        'log_type_title',
        'project_title',
        'created_at',
    ];

    protected $casts = [
        'id' => 'string',
        'created_at' => 'datetime',
    ];

    public function teamMember()
    {
        return $this->belongsTo(TeamMember::class);
    }
}
