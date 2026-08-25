<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use App\Models\MedicalRecord;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Str;
use Tests\TestCase;

class UserWorkflowTest extends TestCase
{
    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::where('role', 'ADMIN')->first() ?? User::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Admin Testing',
            'username' => 'admintesting',
            'password' => bcrypt('password123'),
            'role' => 'ADMIN',
        ]);
    }

    /**
     * Test patient creation and unique NIK validation handling.
     */
    public function test_patient_creation_and_duplicate_nik_handling(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $testNik = '340101' . rand(10000000, 99999999);
        
        $patientData = [
            'nik' => $testNik,
            'name' => 'Budi UserTest',
            'age' => 45,
            'gender' => 'MALE',
            'address' => 'Dusun Krajan',
            'phone' => '08123456789',
        ];

        // 1. Create Patient 1
        $response = $this->postJson('/api/patients', $patientData);
        $response->assertStatus(201)
                 ->assertJsonPath('name', 'Budi UserTest');

        $patientId = $response->json('id');
        $this->assertNotEmpty($patientId);

        // 2. Try creating Patient 2 with duplicate NIK -> Expect 422 Validation Error (NOT 500)
        Sanctum::actingAs($this->admin, ['*']);
        $duplicateResponse = $this->postJson('/api/patients', $patientData);
        $duplicateResponse->assertStatus(422)
                          ->assertJsonValidationErrors(['nik']);
    }

    /**
     * Test medical record creation with PARTIAL optional fields.
     */
    public function test_partial_medical_record_creation(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $patient = Patient::first() ?? Patient::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Siti PartialTest',
            'age' => 50,
            'gender' => 'FEMALE',
            'address' => 'Dusun Pedukuhan',
        ]);

        $payload = [
            'patient_id' => $patient->id,
            'date' => '2026-08-10T10:30', // ISO datetime format from input
            'blood_pressure' => '120/80',
            'notes' => 'Pemeriksaan tensi rutin saja',
        ];

        $response = $this->postJson('/api/records', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('blood_pressure', '120/80')
                 ->assertJsonPath('blood_pressure_status', 'waspada')
                 ->assertJsonPath('blood_sugar', null)
                 ->assertJsonPath('cholesterol', null)
                 ->assertJsonPath('lila', null)
                 ->assertJsonPath('notes', 'Pemeriksaan tensi rutin saja');
    }

    /**
     * Test full medical record creation including LILA and laboratory values.
     */
    public function test_full_medical_record_creation_with_lila(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $patient = Patient::first() ?? Patient::create([
            'id' => Str::uuid()->toString(),
            'name' => 'Ahmad FullTest',
            'age' => 60,
            'gender' => 'MALE',
            'address' => 'Dusun Utama',
        ]);

        $payload = [
            'patient_id' => $patient->id,
            'date' => '2026-08-10',
            'blood_pressure' => '145/95',
            'blood_sugar' => 150.5,
            'cholesterol' => 210.0,
            'uric_acid' => 7.5,
            'weight' => 70.0,
            'height' => 165.0,
            'waist_circumference' => 88.5,
            'lila' => 28.5,
            'mental_health_score' => 4,
            'mental_health_q17' => false,
            'puma_score' => 2,
            'dependency_level' => 'M',
            'smoking_status' => true,
            'activity_level' => 'sedang',
            'notes' => 'Pemeriksaan lengkap lansia',
        ];

        $response = $this->postJson('/api/records', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('blood_pressure_status', 'bahaya')
                 ->assertJsonPath('blood_sugar_status', 'waspada')
                 ->assertJsonPath('cholesterol_status', 'waspada')
                 ->assertJsonPath('uric_acid_status', 'bahaya')
                 ->assertJsonPath('lila', 28.5)
                 ->assertJsonPath('waist_circumference', 88.5)
                 ->assertJsonPath('is_risk', true);
    }
}
