<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SI-WARAS API Routes
|--------------------------------------------------------------------------
*/

// ── Auth (Publik) ─────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login']);

// ── Public Dashboard Stats ────────────────────────────────────────────────
Route::get('/dashboard/public-stats', [DashboardController::class, 'stats']);

// ── Protected Routes ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/auth/me',      [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Pedukuhan — dipanggil frontend via /api/patients/pedukuhans DAN /api/pedukuhans
    Route::get('/pedukuhans',          [PatientController::class, 'pedukuhans']);
    Route::get('/patients/pedukuhans', [PatientController::class, 'pedukuhans']);

    // Patients (CRUD)
    Route::get('/patients',          [PatientController::class, 'index']);
    Route::post('/patients',         [PatientController::class, 'store']);
    Route::get('/patients/{id}',     [PatientController::class, 'show']);
    Route::put('/patients/{id}',     [PatientController::class, 'update']);
    Route::patch('/patients/{id}',   [PatientController::class, 'update']);
    Route::delete('/patients/{id}',  [PatientController::class, 'destroy']);

    // Medical Records (CRUD)
    Route::get('/records',                        [MedicalRecordController::class, 'index']);
    Route::post('/records',                       [MedicalRecordController::class, 'store']);
    Route::get('/records/patient/{patientId}',    [MedicalRecordController::class, 'byPatient']);
    Route::get('/records/{id}',                   [MedicalRecordController::class, 'show']);
    Route::put('/records/{id}',                   [MedicalRecordController::class, 'update']);
    Route::patch('/records/{id}',                 [MedicalRecordController::class, 'update']);
    Route::delete('/records/{id}',                [MedicalRecordController::class, 'destroy']);

    // Import & Export (dipanggil frontend via /api/medis/import & /api/medis/export)
    Route::post('/medis/import', [MedicalRecordController::class, 'importRecords']);
    Route::post('/medis/export', [MedicalRecordController::class, 'exportRecords']);

    // User Management (ADMIN only)
    Route::get('/users',         [UserController::class, 'index']);
    Route::post('/users',        [UserController::class, 'store']);
    Route::put('/users/{id}',    [UserController::class, 'update']);
    Route::patch('/users/{id}',  [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});
