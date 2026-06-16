<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Patient extends Model
{
    use HasUuids;

    protected $table = 'patients';

    protected $fillable = [
        'id', 'nik', 'name', 'age', 'gender', 'address', 'phone', 'pedukuhan_id',
    ];

    protected $casts = [
        'age' => 'integer',
    ];

    public function pedukuhan()
    {
        return $this->belongsTo(Pedukuhan::class, 'pedukuhan_id');
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class, 'patient_id')->orderByDesc('date');
    }
}
