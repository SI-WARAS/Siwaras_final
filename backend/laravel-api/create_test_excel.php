<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$ss = new Spreadsheet();
$sh = $ss->getActiveSheet();

$headers = ['nik','name','age','gender','address','phone','pedukuhanName','date','bloodPressure','bloodSugar','cholesterol','uricAcid','weight','height','smokingStatus','activityLevel','notes'];
$sh->fromArray([$headers], null, 'A1');

$data = [['3402160101780001','Budi Santoso',45,'MALE','Dusun Gumulan RT 01','081234567890','Gumulan','2026-06-10','120/80',110,180,5.5,65,165,0,'rendah','Pasien kontrol rutin']];
$sh->fromArray($data, null, 'A2');

(new Xlsx($ss))->save('test_import.xlsx');
echo "File test_import.xlsx berhasil dibuat\n";
