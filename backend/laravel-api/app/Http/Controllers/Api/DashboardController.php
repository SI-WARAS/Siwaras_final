<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private const PADUKUHAN_LIST = [
        'Gluntung Kidul', 'Gumulan', 'Tegalsempu', 'Tunjungan', 'Krapakan',
        'Samparan', 'Tegallayang 9', 'Tegallayang 10', 'Kuroboyo', 'Korowelang',
        'Glagahan', 'Bogem', 'Banyuurip', 'Gluntung Lor',
    ];

    private function getBPStatus(?string $bp): string
    {
        if (!$bp) return 'normal';
        $parts = explode('/', $bp);
        if (count($parts) < 2) return 'normal';
        [$s, $d] = [(int) $parts[0], (int) $parts[1]];
        if ($s < 90 || $d < 60) return 'rendah';
        return ($s >= 140 || $d >= 90) ? 'bahaya' : (($s > 120 || $d > 80) ? 'waspada' : 'normal');
    }

    private function getBSStatus(?float $v): string
    {
        if ($v === null) return 'normal';
        if ($v < 70) return 'rendah';
        return $v >= 200 ? 'bahaya' : ($v >= 140 ? 'waspada' : 'normal');
    }

    private function getCholesterolStatus(?float $v): string
    {
        if ($v === null) return 'normal';
        return $v >= 240 ? 'bahaya' : ($v >= 200 ? 'waspada' : 'normal');
    }

    private function getUAStatus(?float $v, ?string $gender): string
    {
        if ($v === null) return 'normal';
        $limit = ($gender === 'FEMALE') ? 6.0 : 7.0;
        return $v > $limit ? 'bahaya' : ($v > ($limit - 1) ? 'waspada' : 'normal');
    }

    /**
     * GET /api/dashboard/stats
     */
    public function stats(Request $request)
    {
        $totalPatients = Patient::count();

        // Load all patients with latest medical record via subquery
        $patients = Patient::with([
            'pedukuhan',
            'medicalRecords' => fn($q) => $q->orderByDesc('date')->limit(1),
        ])->get();

        $hypertension = 0;
        $diabetes     = 0;
        $cholesterol  = 0;
        $uricAcid     = 0;
        $other        = 0;

        $dusunStats = array_fill_keys(self::PADUKUHAN_LIST, 0);
        $dusunStats['Lainnya'] = 0;

        foreach ($patients as $p) {
            // Area stats
            $matchedDusun = 'Lainnya';
            if ($p->pedukuhan) {
                $matchedDusun = $p->pedukuhan->name;
            } else {
                foreach (self::PADUKUHAN_LIST as $dusun) {
                    if ($p->address && stripos($p->address, $dusun) !== false) {
                        $matchedDusun = $dusun;
                        break;
                    }
                }
            }
            if (array_key_exists($matchedDusun, $dusunStats)) {
                $dusunStats[$matchedDusun]++;
            } else {
                $dusunStats['Lainnya']++;
            }

            // PTM disease stats from latest record
            $mr = $p->medicalRecords->first();
            if ($mr && $mr->blood_pressure !== null) {
                $hasPtm = false;
                if ($this->getBPStatus($mr->blood_pressure) === 'bahaya') { $hypertension++; $hasPtm = true; }
                if ($this->getBSStatus($mr->blood_sugar)    === 'bahaya') { $diabetes++;     $hasPtm = true; }
                if ($this->getCholesterolStatus($mr->cholesterol) === 'bahaya') { $cholesterol++; $hasPtm = true; }
                if ($this->getUAStatus($mr->uric_acid, $p->gender) === 'bahaya') { $uricAcid++;   $hasPtm = true; }
                if (!$hasPtm) $other++;
            } else {
                $other++;
            }
        }

        return response()->json([
            'totalPatients' => $totalPatients,
            'ptmCases'      => [
                'hypertension' => $hypertension,
                'diabetes'     => $diabetes,
                'cholesterol'  => $cholesterol,
                'uricAcid'     => $uricAcid,
                'other'        => $other,
            ],
            'areaStats' => $dusunStats,
        ]);
    }
}
