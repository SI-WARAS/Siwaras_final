<?php

namespace Database\Seeders;

use App\Models\Pedukuhan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Pedukuhan
        $pedukuhanNames = [
            'Gluntung Kidul', 'Gumulan', 'Tegalsempu', 'Tunjungan', 'Krapakan',
            'Samparan', 'Tegallayang 9', 'Tegallayang 10', 'Kuroboyo', 'Korowelang',
            'Glagahan', 'Bogem', 'Banyuurip', 'Gluntung Lor',
        ];

        $pedukuhans = [];
        foreach ($pedukuhanNames as $name) {
            $pedukuhans[$name] = Pedukuhan::firstOrCreate(
                ['name' => $name],
                ['id' => Str::uuid()->toString()]
            );
        }

        // Seed Admin user
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'id'       => Str::uuid()->toString(),
                'name'     => 'Administrator',
                'password' => Hash::make('admin123'),
                'role'     => 'ADMIN',
            ]
        );

        // Seed Village Head
        User::firstOrCreate(
            ['username' => 'kepala_desa'],
            [
                'id'       => Str::uuid()->toString(),
                'name'     => 'Kepala Desa',
                'password' => Hash::make('kepala123'),
                'role'     => 'VILLAGE_HEAD',
            ]
        );

        // Seed one Health Worker per pedukuhan
        foreach ($pedukuhans as $name => $pedukuhan) {
            $slug = strtolower(str_replace([' ', '/'], ['_', ''], $name));
            User::firstOrCreate(
                ['username' => "kader_{$slug}"],
                [
                    'id'           => Str::uuid()->toString(),
                    'name'         => "Kader {$name}",
                    'password'     => Hash::make('kader123'),
                    'role'         => 'HEALTH_WORKER',
                    'pedukuhan_id' => $pedukuhan->id,
                ]
            );
        }

        $this->command->info('✅ SI-WARAS seed selesai: ' . count($pedukuhanNames) . ' pedukuhan, admin, kepala desa, dan ' . count($pedukuhanNames) . ' kader dibuat.');
    }
}
