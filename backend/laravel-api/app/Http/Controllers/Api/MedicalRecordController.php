<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Pedukuhan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MedicalRecordController extends Controller
{
    // -----------------------------------------------------------------------
    // Health logic helpers (sesuai Node.js healthLogic.js)
    // -----------------------------------------------------------------------
    private function getBPStatus(?string $bp): ?string
    {
        if (!$bp) return null;
        $parts = explode('/', trim($bp));
        if (count($parts) < 2) return null;
        [$s, $d] = [(int) $parts[0], (int) $parts[1]];
        if ($s === 0 && $d === 0) return null;
        if ($s < 90 || $d < 60) return 'rendah';
        if ($s >= 140 || $d >= 90) return 'bahaya';
        if ($s > 120 || $d > 80) return 'waspada';
        return 'normal';
    }

    private function getBSStatus(?float $v): ?string
    {
        if ($v === null) return null;
        if ($v < 70) return 'rendah';
        return $v >= 200 ? 'bahaya' : ($v >= 140 ? 'waspada' : 'normal');
    }

    private function getCholesterolStatus(?float $v): ?string
    {
        if ($v === null) return null;
        return $v >= 240 ? 'bahaya' : ($v >= 200 ? 'waspada' : 'normal');
    }

    private function getUAStatus(?float $v, ?string $gender): ?string
    {
        if ($v === null) return null;
        $limit = ($gender === 'FEMALE') ? 6.0 : 7.0;
        return $v > $limit ? 'bahaya' : ($v > ($limit - 1) ? 'waspada' : 'normal');
    }

    private function computeMetrics(array $data, ?string $gender): array
    {
        $weight  = isset($data['weight']) && $data['weight'] !== null ? (float) $data['weight'] : 0;
        $height  = isset($data['height']) && $data['height'] !== null ? (float) $data['height'] : 0;
        $heightM = $height / 100;
        $bmi     = ($heightM > 0 && $weight > 0) ? round($weight / ($heightM * $heightM), 2) : null;

        $bpStatus   = $this->getBPStatus($data['blood_pressure'] ?? null);
        $bsStatus   = $this->getBSStatus(isset($data['blood_sugar']) && $data['blood_sugar'] !== null ? (float) $data['blood_sugar'] : null);
        $cholStatus = $this->getCholesterolStatus(isset($data['cholesterol']) && $data['cholesterol'] !== null ? (float) $data['cholesterol'] : null);
        $uaStatus   = $this->getUAStatus(isset($data['uric_acid']) && $data['uric_acid'] !== null ? (float) $data['uric_acid'] : null, $gender);

        $statuses = array_filter([$bpStatus, $bsStatus, $cholStatus, $uaStatus]);

        return [
            'bmi'                   => $bmi,
            'blood_pressure_status' => $bpStatus,
            'blood_sugar_status'    => $bsStatus,
            'cholesterol_status'    => $cholStatus,
            'uric_acid_status'      => $uaStatus,
            'is_risk'               => in_array('bahaya', $statuses),
        ];
    }

    private function tenantScope($query, $user)
    {
        if ($user && !in_array($user->role, ['ADMIN', 'VILLAGE_HEAD'])) {
            $query->whereHas('patient', fn($q) => $q->where('pedukuhan_id', $user->pedukuhan_id));
        }
        return $query;
    }

    // -----------------------------------------------------------------------
    // GET /api/records
    // -----------------------------------------------------------------------
    public function index(Request $request)
    {
        try {
            $query = MedicalRecord::with(['patient.pedukuhan']);
            $this->tenantScope($query, $request->user());
            return response()->json($query->orderByDesc('date')->get());
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal mengambil rekam medis', 'message' => $e->getMessage()], 500);
        }
    }

    // -----------------------------------------------------------------------
    // GET /api/records/{id}
    // -----------------------------------------------------------------------
    public function show(Request $request, string $id)
    {
        try {
            $query = MedicalRecord::with('patient');
            $this->tenantScope($query, $request->user());
            $record = $query->find($id);
            if (!$record) return response()->json(['error' => 'Record not found'], 404);
            return response()->json($record);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal mengambil rekam medis', 'message' => $e->getMessage()], 500);
        }
    }

    // -----------------------------------------------------------------------
    // GET /api/records/patient/{patientId}
    // -----------------------------------------------------------------------
    public function byPatient(Request $request, string $patientId)
    {
        try {
            $patient = Patient::find($patientId);
            if (!$patient) return response()->json(['error' => 'Patient not found'], 404);

            $user = $request->user();
            if ($user && !in_array($user->role, ['ADMIN', 'VILLAGE_HEAD'])) {
                if ($patient->pedukuhan_id !== $user->pedukuhan_id) {
                    return response()->json(['error' => 'Forbidden'], 403);
                }
            }

            return response()->json(
                MedicalRecord::where('patient_id', $patientId)->orderByDesc('date')->get()
            );
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal mengambil rekam medis pasien', 'message' => $e->getMessage()], 500);
        }
    }

    // -----------------------------------------------------------------------
    // POST /api/records
    // -----------------------------------------------------------------------
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'patient_id'          => 'required|exists:patients,id',
                'date'                => 'required',
                'blood_pressure'      => 'nullable|string|max:20',
                'blood_sugar'         => 'nullable|numeric|min:0',
                'cholesterol'         => 'nullable|numeric|min:0',
                'uric_acid'           => 'nullable|numeric|min:0',
                'weight'              => 'nullable|numeric|min:0',
                'height'              => 'nullable|numeric|min:0',
                'waist_circumference' => 'nullable|numeric|min:0',
                'lila'                => 'nullable|numeric|min:0',
                'mental_health_score' => 'nullable|integer|min:0|max:20',
                'mental_health_q17'   => 'nullable|boolean',
                'puma_score'          => 'nullable|integer|min:0|max:10',
                'dependency_level'    => 'nullable|string|max:20',
                'smoking_status'      => 'nullable|boolean',
                'activity_level'      => 'nullable|in:rendah,sedang,tinggi',
                'notes'               => 'nullable|string',
            ]);

            if (!empty($validated['date'])) {
                $validated['date'] = date('Y-m-d', strtotime($validated['date']));
            }

            // Ensure boolean fields are never null to satisfy database constraints
            $validated['mental_health_q17'] = !empty($validated['mental_health_q17']);
            $validated['smoking_status']     = !empty($validated['smoking_status']);

            $patient = Patient::findOrFail($validated['patient_id']);
            $metrics = $this->computeMetrics($validated, $patient->gender);

            $record = MedicalRecord::create(array_merge(
                ['id' => Str::uuid()->toString()],
                $validated,
                $metrics
            ));

            return response()->json($record->load('patient'), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error'   => 'Validasi data medis tidak valid',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('MedicalRecord Store Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error'   => 'Gagal menyimpan rekam medis',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // -----------------------------------------------------------------------
    // PUT /api/records/{id}
    // -----------------------------------------------------------------------
    public function update(Request $request, string $id)
    {
        try {
            $record = MedicalRecord::with('patient')->find($id);
            if (!$record) return response()->json(['error' => 'Medical record not found'], 404);

            $validated = $request->validate([
                'date'                => 'sometimes|required',
                'blood_pressure'      => 'nullable|string|max:20',
                'blood_sugar'         => 'nullable|numeric|min:0',
                'cholesterol'         => 'nullable|numeric|min:0',
                'uric_acid'           => 'nullable|numeric|min:0',
                'weight'              => 'nullable|numeric|min:0',
                'height'              => 'nullable|numeric|min:0',
                'waist_circumference' => 'nullable|numeric|min:0',
                'lila'                => 'nullable|numeric|min:0',
                'mental_health_score' => 'nullable|integer|min:0|max:20',
                'mental_health_q17'   => 'nullable|boolean',
                'puma_score'          => 'nullable|integer|min:0|max:10',
                'dependency_level'    => 'nullable|string|max:20',
                'smoking_status'      => 'nullable|boolean',
                'activity_level'      => 'nullable|in:rendah,sedang,tinggi',
                'notes'               => 'nullable|string',
            ]);

            if (!empty($validated['date'])) {
                $validated['date'] = date('Y-m-d', strtotime($validated['date']));
            }

            if (array_key_exists('mental_health_q17', $validated)) {
                $validated['mental_health_q17'] = !empty($validated['mental_health_q17']);
            }
            if (array_key_exists('smoking_status', $validated)) {
                $validated['smoking_status'] = !empty($validated['smoking_status']);
            }

            $merged  = array_merge($record->toArray(), $validated);
            $metrics = $this->computeMetrics($merged, $record->patient->gender ?? null);
            $record->update(array_merge($validated, $metrics));

            return response()->json($record);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error'   => 'Validasi data medis tidak valid',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('MedicalRecord Update Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error'   => 'Gagal memperbarui rekam medis',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // -----------------------------------------------------------------------
    // DELETE /api/records/{id}
    // -----------------------------------------------------------------------
    public function destroy(string $id)
    {
        $record = MedicalRecord::find($id);
        if (!$record) return response()->json(['error' => 'Record not found'], 404);
        $record->delete();
        return response()->json(['message' => 'Record deleted successfully']);
    }

    // -----------------------------------------------------------------------
    // POST /api/medis/import  — Import dari Excel
    // -----------------------------------------------------------------------
    public function importRecords(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        if (!extension_loaded('zip')) {
            return response()->json([
                'error' => 'Ekstensi PHP "zip" (ZipArchive) belum diaktifkan di server PHP. Silakan aktifkan extension=zip pada file php.ini.'
            ], 400);
        }

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getPathname());
            $sheet       = $spreadsheet->getActiveSheet();
            $rows        = $sheet->toArray(null, true, true, false);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'File tidak dapat dibaca: ' . $e->getMessage()], 400);
        }

        if (count($rows) < 2) {
            return response()->json(['error' => 'File Excel kosong atau tidak memiliki data.'], 400);
        }

        // Row pertama adalah header
        $headers = array_map('trim', $rows[0]);
        $dataRows = array_slice($rows, 1);

        // Load semua pedukuhan untuk mapping
        $pedukuhanMap = Pedukuhan::all()->keyBy(fn($p) => strtolower(trim($p->name)));

        $rowErrors    = [];
        $validatedRows = [];

        foreach ($dataRows as $index => $row) {
            $rowNum = $index + 2; // Row excel (header = 1)
            $data   = array_combine($headers, array_pad($row, count($headers), null));

            $errors = [];

            // Validasi field wajib
            $required = ['nik', 'name', 'age', 'gender', 'address', 'pedukuhanName', 'date', 'bloodPressure'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    $errors[] = "Kolom '{$field}' wajib diisi.";
                }
            }

            // Validasi gender
            $gender = strtoupper(trim($data['gender'] ?? ''));
            if (!in_array($gender, ['MALE', 'FEMALE'])) {
                $errors[] = "Gender harus MALE atau FEMALE.";
            }

            // Validasi pedukuhan
            $pedKey = strtolower(trim($data['pedukuhanName'] ?? ''));
            if (!$pedukuhanMap->has($pedKey)) {
                $errors[] = "Pedukuhan '{$data['pedukuhanName']}' tidak terdaftar.";
            }

            // Validasi role tenant
            $user = $request->user();
            if ($user && !in_array($user->role, ['ADMIN', 'VILLAGE_HEAD'])) {
                $ped = $pedukuhanMap->get($pedKey);
                if ($ped && $ped->id !== $user->pedukuhan_id) {
                    $errors[] = "Anda tidak diizinkan memasukkan data untuk Pedukuhan '{$data['pedukuhanName']}'.";
                }
            }

            // Validasi activityLevel
            $activityMap = [
                'low' => 'rendah', 'rendah' => 'rendah',
                'moderate' => 'sedang', 'sedang' => 'sedang',
                'high' => 'tinggi', 'tinggi' => 'tinggi',
            ];
            $activityRaw = strtolower(trim($data['activityLevel'] ?? 'rendah'));
            $activityLevel = $activityMap[$activityRaw] ?? 'rendah';

            if (!empty($errors)) {
                $rowErrors[] = ['row' => $rowNum, 'errors' => $errors];
                continue;
            }

            $validatedRows[] = [
                'nik'          => trim($data['nik']),
                'name'         => trim($data['name']),
                'age'          => (int) $data['age'],
                'gender'       => $gender,
                'address'      => trim($data['address']),
                'phone'        => trim($data['phone'] ?? ''),
                'pedukuhan_id' => $pedukuhanMap->get($pedKey)->id,
                'date'         => $data['date'],
                'blood_pressure' => trim($data['bloodPressure'] ?? ''),
                'blood_sugar'    => !empty($data['bloodSugar']) ? (float) $data['bloodSugar'] : null,
                'cholesterol'    => !empty($data['cholesterol']) ? (float) $data['cholesterol'] : null,
                'uric_acid'      => !empty($data['uricAcid']) ? (float) $data['uricAcid'] : null,
                'weight'         => !empty($data['weight']) ? (float) $data['weight'] : null,
                'height'         => !empty($data['height']) ? (float) $data['height'] : null,
                'waist_circumference' => !empty($data['waistCircumference']) ? (float) $data['waistCircumference'] : (!empty($data['waist_circumference']) ? (float) $data['waist_circumference'] : null),
                'lila'                => !empty($data['lila']) ? (float) $data['lila'] : (!empty($data['armCircumference']) ? (float) $data['armCircumference'] : null),
                'mental_health_score' => isset($data['mentalHealthScore']) && $data['mentalHealthScore'] !== '' ? (int) $data['mentalHealthScore'] : (isset($data['mental_health_score']) && $data['mental_health_score'] !== '' ? (int) $data['mental_health_score'] : null),
                'mental_health_q17'   => (!empty($data['mentalHealthQ17']) && strtolower($data['mentalHealthQ17']) !== 'false' && $data['mentalHealthQ17'] !== '0') || (!empty($data['mental_health_q17']) && strtolower($data['mental_health_q17']) !== 'false' && $data['mental_health_q17'] !== '0'),
                'puma_score'          => isset($data['pumaScore']) && $data['pumaScore'] !== '' ? (int) $data['pumaScore'] : (isset($data['puma_score']) && $data['puma_score'] !== '' ? (int) $data['puma_score'] : null),
                'dependency_level'    => !empty($data['dependencyLevel']) ? trim($data['dependencyLevel']) : (!empty($data['dependency_level']) ? trim($data['dependency_level']) : null),
                'smoking_status' => !empty($data['smokingStatus']) && strtolower($data['smokingStatus']) !== 'false' && $data['smokingStatus'] !== '0',
                'activity_level' => $activityLevel,
                'notes'          => trim($data['notes'] ?? ''),
            ];
        }

        // Jika ada error, batalkan semua
        if (!empty($rowErrors)) {
            return response()->json([
                'error'   => 'Proses import dibatalkan karena kesalahan validasi data.',
                'details' => $rowErrors,
            ], 400);
        }

        // Atomic transaction
        DB::beginTransaction();
        try {
            $count = 0;
            foreach ($validatedRows as $row) {
                // Find or create patient by NIK
                $patient = Patient::where('nik', $row['nik'])->first();
                if ($patient) {
                    $patient->update([
                        'name'         => $row['name'],
                        'age'          => $row['age'],
                        'gender'       => $row['gender'],
                        'address'      => $row['address'],
                        'phone'        => $row['phone'] ?: null,
                        'pedukuhan_id' => $row['pedukuhan_id'],
                    ]);
                } else {
                    $patient = Patient::create([
                        'id'           => Str::uuid()->toString(),
                        'nik'          => $row['nik'],
                        'name'         => $row['name'],
                        'age'          => $row['age'],
                        'gender'       => $row['gender'],
                        'address'      => $row['address'],
                        'phone'        => $row['phone'] ?: null,
                        'pedukuhan_id' => $row['pedukuhan_id'],
                    ]);
                }

                $metrics = $this->computeMetrics($row, $patient->gender);

                MedicalRecord::create(array_merge([
                    'id'         => Str::uuid()->toString(),
                    'patient_id' => $patient->id,
                    'date'       => $row['date'],
                    'blood_pressure' => $row['blood_pressure'],
                    'blood_sugar'    => $row['blood_sugar'],
                    'cholesterol'    => $row['cholesterol'],
                    'uric_acid'      => $row['uric_acid'],
                    'weight'         => $row['weight'],
                    'height'         => $row['height'],
                    'waist_circumference' => $row['waist_circumference'],
                    'lila'                => $row['lila'],
                    'mental_health_score' => $row['mental_health_score'],
                    'mental_health_q17'   => $row['mental_health_q17'],
                    'puma_score'          => $row['puma_score'],
                    'dependency_level'    => $row['dependency_level'],
                    'smoking_status' => $row['smoking_status'],
                    'activity_level' => $row['activity_level'],
                    'notes'          => $row['notes'] ?: null,
                ], $metrics));

                $count++;
            }

            DB::commit();
            return response()->json([
                'message' => "Berhasil mengimpor {$count} data rekam medis secara sukses.",
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Kesalahan server saat memproses data: ' . $e->getMessage()], 500);
        }
    }

    // -----------------------------------------------------------------------
    // POST /api/medis/export  — Export dengan field & filter kustom
    // -----------------------------------------------------------------------
    public function exportRecords(Request $request)
    {
        $request->validate([
            'fields'   => 'required|array|min:1',
            'fields.*' => 'string',
        ]);

        $fields  = $request->input('fields', []);
        $filters = $request->input('filters', []);
        $user    = $request->user();

        $query = MedicalRecord::query()
            ->join('patients as p', 'medical_records.patient_id', '=', 'p.id')
            ->leftJoin('pedukuhans as ped', 'p.pedukuhan_id', '=', 'ped.id')
            ->select('medical_records.*',
                'p.name as patient_name', 'p.nik as patient_nik',
                'p.age as patient_age', 'p.gender as patient_gender',
                'p.address as patient_address', 'p.phone as patient_phone',
                'ped.name as pedukuhan_name'
            );

        // Multi-tenancy
        if ($user && !in_array($user->role, ['ADMIN', 'VILLAGE_HEAD'])) {
            $query->where('p.pedukuhan_id', $user->pedukuhan_id);
        }

        // Filters
        if (!empty($filters['startDate'])) {
            $query->whereDate('medical_records.date', '>=', $filters['startDate']);
        }
        if (!empty($filters['endDate'])) {
            $query->whereDate('medical_records.date', '<=', $filters['endDate']);
        }
        if (!empty($filters['pedukuhanId'])) {
            $query->where('p.pedukuhan_id', $filters['pedukuhanId']);
        }

        $records = $query->orderByDesc('medical_records.date')->get();

        if ($records->isEmpty()) {
            return response()->json([], 200);
        }

        // Shape response sesuai yang diharapkan frontend
        $result = $records->map(function ($r) use ($fields) {
            $row = [
                'id'   => $r->id,
                'date' => $r->date,
            ];

            // Patient fields
            $patient = [];
            if (in_array('nama', $fields))      $patient['name']    = $r->patient_name;
            if (in_array('nik', $fields))       $patient['nik']     = $r->patient_nik;
            if (in_array('umur', $fields))      $patient['age']     = $r->patient_age;
            if (in_array('gender', $fields))    $patient['gender']  = $r->patient_gender;
            if (in_array('alamat', $fields))    $patient['address'] = $r->patient_address;
            if (in_array('telepon', $fields))   $patient['phone']   = $r->patient_phone;
            if (in_array('pedukuhan', $fields)) $patient['pedukuhan'] = ['name' => $r->pedukuhan_name];
            if (!empty($patient)) $row['patient'] = $patient;

            // Medical fields
            if (in_array('bloodPressure', $fields)) {
                $row['bloodPressure']       = $r->blood_pressure;
                $row['bloodPressureStatus'] = $r->blood_pressure_status;
            }
            if (in_array('bloodSugar', $fields)) {
                $row['bloodSugar']       = $r->blood_sugar;
                $row['bloodSugarStatus'] = $r->blood_sugar_status;
            }
            if (in_array('cholesterol', $fields)) {
                $row['cholesterol']       = $r->cholesterol;
                $row['cholesterolStatus'] = $r->cholesterol_status;
            }
            if (in_array('uricAcid', $fields)) {
                $row['uricAcid']       = $r->uric_acid;
                $row['uricAcidStatus'] = $r->uric_acid_status;
            }
            if (in_array('weight', $fields))        $row['weight']        = $r->weight;
            if (in_array('height', $fields))        $row['height']        = $r->height;
            if (in_array('waistCircumference', $fields)) $row['waistCircumference'] = $r->waist_circumference;
            if (in_array('lila', $fields))          $row['lila']          = $r->lila;
            if (in_array('mentalHealthScore', $fields))   $row['mentalHealthScore']   = $r->mental_health_score;
            if (in_array('mentalHealthQ17', $fields))     $row['mentalHealthQ17']     = (bool) $r->mental_health_q17;
            if (in_array('pumaScore', $fields))           $row['pumaScore']           = $r->puma_score;
            if (in_array('dependencyLevel', $fields))     $row['dependencyLevel']     = $r->dependency_level;
            if (in_array('bmi', $fields))           $row['bmi']           = $r->bmi;
            if (in_array('smokingStatus', $fields)) $row['smokingStatus'] = (bool) $r->smoking_status;
            if (in_array('activityLevel', $fields)) $row['activityLevel'] = $r->activity_level;
            if (in_array('notes', $fields))         $row['notes']         = $r->notes;
            if (in_array('isRisk', $fields))        $row['isRisk']        = (bool) $r->is_risk;

            return $row;
        });

        return response()->json($result);
    }
}
