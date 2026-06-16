<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Pedukuhan extends Model
{
    use HasUuids;

    protected $table = 'pedukuhans';
    protected $fillable = ['name'];

    public function patients()
    {
        return $this->hasMany(Patient::class, 'pedukuhan_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'pedukuhan_id');
    }
}
