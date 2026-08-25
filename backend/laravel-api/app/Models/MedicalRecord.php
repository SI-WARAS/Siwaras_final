<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MedicalRecord extends Model
{
    use HasUuids;

    protected $table = 'medical_records';

    protected $fillable = [
        'id', 'patient_id', 'date',
        'blood_pressure', 'blood_sugar', 'cholesterol', 'uric_acid',
        'weight', 'height', 'waist_circumference', 'lila', 'mental_health_score',
        'mental_health_q17', 'puma_score', 'dependency_level',
        'smoking_status', 'activity_level', 'notes',
        'bmi', 'blood_pressure_status', 'blood_sugar_status',
        'cholesterol_status', 'uric_acid_status', 'is_risk',
    ];

    protected $casts = [
        'date'                => 'date',
        'blood_sugar'         => 'float',
        'cholesterol'         => 'float',
        'uric_acid'           => 'float',
        'weight'              => 'float',
        'height'              => 'float',
        'waist_circumference' => 'float',
        'lila'                => 'float',
        'mental_health_score' => 'integer',
        'mental_health_q17'   => 'boolean',
        'puma_score'          => 'integer',
        'smoking_status'      => 'boolean',
        'is_risk'             => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }
}
