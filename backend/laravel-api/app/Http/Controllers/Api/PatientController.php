<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Pedukuhan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PatientController extends Controller
{
    /**
     * Tenant filter: HEALTH_WORKER hanya bisa lihat pedukuhan sendiri.
     */
    private function tenantScope($query, $user)
    {
        if ($user && !in_array($user->role, ['ADMIN', 'VILLAGE_HEAD'])) {
            $query->where('pedukuhan_id', $user->pedukuhan_id);
        }
        return $query;
    }

    /**
     * GET /api/patients
     */
    public function index(Request $request)
    {
        $user     = $request->user();
        $search   = $request->query('search');
        $page     = max(1, (int) $request->query('page', 1));
        $limit    = max(1, (int) $request->query('limit', 10));
        $sortBy   = in_array($request->query('sortBy'), ['created_at', 'updated_at', 'name', 'age', 'nik'])
                    ? $request->query('sortBy') : 'created_at';
        $sortOrder = strtolower($request->query('sortOrder', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query = Patient::with('pedukuhan');
        $this->tenantScope($query, $user);

        if ($search) {
            $search = trim($search);
            $like   = "%{$search}%";
            $query->where(function ($q) use ($search, $like) {
                $q->where('name', 'like', $like)
                  ->orWhere('nik', 'like', "{$search}%")
                  ->orWhere('address', 'like', $like);
                if (is_numeric($search)) {
                    $q->orWhere('age', (int) $search);
                }
            });
        }

        $total    = $query->count();
        $patients = $query->orderBy($sortBy, $sortOrder)
                          ->offset(($page - 1) * $limit)
                          ->limit($limit)
                          ->get();

        return response()->json([
            'patients'   => $patients,
            'pagination' => [
                'total'      => $total,
                'page'       => $page,
                'limit'      => $limit,
                'totalPages' => (int) ceil($total / $limit),
            ],
        ]);
    }

    /**
     * GET /api/patients/{id}
     */
    public function show(Request $request, string $id)
    {
        $user  = $request->user();
        $query = Patient::with(['pedukuhan', 'medicalRecords']);
        $this->tenantScope($query, $user);

        $patient = $query->find($id);
        if (!$patient) {
            return response()->json(['error' => 'Patient not found'], 404);
        }

        return response()->json($patient);
    }

    /**
     * POST /api/patients
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nik'          => 'nullable|string|max:20|unique:patients,nik',
                'name'         => 'required|string|max:255',
                'age'          => 'required|integer|min:0',
                'gender'       => 'required|in:MALE,FEMALE',
                'address'      => 'required|string',
                'phone'        => 'nullable|string|max:20',
                'pedukuhan_id' => 'nullable|uuid|exists:pedukuhans,id',
            ]);

            if (array_key_exists('nik', $validated) && trim((string) $validated['nik']) === '') {
                $validated['nik'] = null;
            }

            $user = $request->user();
            // Non-admin: force own pedukuhan
            if ($user && !in_array($user->role, ['ADMIN', 'VILLAGE_HEAD'])) {
                $validated['pedukuhan_id'] = $user->pedukuhan_id;
            } elseif (empty($validated['pedukuhan_id']) && $request->filled('padukuhan')) {
                $ped = Pedukuhan::where('name', trim($request->input('padukuhan')))->first();
                if ($ped) {
                    $validated['pedukuhan_id'] = $ped->id;
                }
            }

            $patient = Patient::create(array_merge(['id' => Str::uuid()->toString()], $validated));
            return response()->json($patient->load('pedukuhan'), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error'  => 'Validasi data pasien tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal menyimpan data pasien: ' . $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/patients/{id}
     */
    public function update(Request $request, string $id)
    {
        $patient = Patient::find($id);
        if (!$patient) {
            return response()->json(['error' => 'Patient not found'], 404);
        }

        $validated = $request->validate([
            'nik'          => 'nullable|string|max:20|unique:patients,nik,' . $id,
            'name'         => 'sometimes|required|string|max:255',
            'age'          => 'sometimes|required|integer|min:0',
            'gender'       => 'sometimes|required|in:MALE,FEMALE',
            'address'      => 'sometimes|required|string',
            'phone'        => 'nullable|string|max:20',
            'pedukuhan_id' => 'nullable|uuid|exists:pedukuhans,id',
        ]);

        if (array_key_exists('nik', $validated) && trim((string) $validated['nik']) === '') {
            $validated['nik'] = null;
        }

        if (empty($validated['pedukuhan_id']) && $request->filled('padukuhan')) {
            $ped = Pedukuhan::where('name', trim($request->input('padukuhan')))->first();
            if ($ped) {
                $validated['pedukuhan_id'] = $ped->id;
            }
        }

        try {
            $patient->update($validated);
            return response()->json($patient->load('pedukuhan'));
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Gagal memperbarui data pasien: ' . $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/patients/{id}
     */
    public function destroy(string $id)
    {
        $patient = Patient::find($id);
        if (!$patient) {
            return response()->json(['error' => 'Patient not found'], 404);
        }

        $patient->delete();
        return response()->json(['message' => 'Patient deleted successfully']);
    }

    /**
     * GET /api/pedukuhans
     */
    public function pedukuhans()
    {
        $pedukuhans = Pedukuhan::orderBy('name')->get();
        return response()->json($pedukuhans);
    }
}
