<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MedicalRecord;
use App\Models\Patient;

class FixMedicalStatus extends Command
{
    protected $signature = 'medis:fix-status';
    protected $description = 'Memperbaiki status (normal, waspada, bahaya, rendah) pada data rekam medis lama tanpa menghapus database';

    public function handle()
    {
        $this->info("Memulai proses perbaikan data rekam medis...");
        
        $count = 0;
        MedicalRecord::with('patient')->chunk(100, function ($records) use (&$count) {
            foreach ($records as $r) {
                // 1. Recalculate Blood Pressure
                $bpStatus = null;
                if ($r->blood_pressure) {
                    $parts = explode('/', trim($r->blood_pressure));
                    if (count($parts) >= 2) {
                        $s = (int)$parts[0];
                        $d = (int)$parts[1];
                        if ($s === 0 && $d === 0) {
                            $bpStatus = null;
                        } elseif ($s < 90 || $d < 60) {
                            $bpStatus = 'rendah';
                        } elseif ($s >= 140 || $d >= 90) {
                            $bpStatus = 'bahaya';
                        } elseif ($s > 120 || $d > 80) {
                            $bpStatus = 'waspada';
                        } else {
                            $bpStatus = 'normal';
                        }
                    }
                }

                // 2. Recalculate Blood Sugar
                $bsStatus = null;
                if ($r->blood_sugar !== null) {
                    $v = (float)$r->blood_sugar;
                    if ($v < 70) {
                        $bsStatus = 'rendah';
                    } elseif ($v >= 200) {
                        $bsStatus = 'bahaya';
                    } elseif ($v >= 140) {
                        $bsStatus = 'waspada';
                    } else {
                        $bsStatus = 'normal';
                    }
                }

                // 3. Recalculate Cholesterol
                $cholStatus = null;
                if ($r->cholesterol !== null) {
                    $v = (float)$r->cholesterol;
                    $cholStatus = $v >= 240 ? 'bahaya' : ($v >= 200 ? 'waspada' : 'normal');
                }

                // 4. Recalculate Uric Acid
                $uaStatus = null;
                if ($r->uric_acid !== null) {
                    $v = (float)$r->uric_acid;
                    $gender = $r->patient ? $r->patient->gender : 'MALE';
                    $limit = ($gender === 'FEMALE') ? 6.0 : 7.0;
                    $uaStatus = $v > $limit ? 'bahaya' : ($v > ($limit - 1.0) ? 'waspada' : 'normal');
                }

                // 5. Calculate is_risk
                $statuses = array_filter([$bpStatus, $bsStatus, $cholStatus, $uaStatus]);
                $isRisk = in_array('bahaya', $statuses) ? 1 : 0;

                // Update if changed
                if (
                    $r->blood_pressure_status !== $bpStatus ||
                    $r->blood_sugar_status !== $bsStatus ||
                    $r->cholesterol_status !== $cholStatus ||
                    $r->uric_acid_status !== $uaStatus ||
                    (int)$r->is_risk !== $isRisk
                ) {
                    $r->update([
                        'blood_pressure_status' => $bpStatus,
                        'blood_sugar_status'    => $bsStatus,
                        'cholesterol_status'    => $cholStatus,
                        'uric_acid_status'      => $uaStatus,
                        'is_risk'               => $isRisk,
                    ]);
                    $count++;
                }
            }
        });

        $this->info("Selesai! Sebanyak {$count} data rekam medis berhasil diperbarui sesuai parameter baru.");
    }
}
