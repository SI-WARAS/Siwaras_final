<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Pastikan hanya ADMIN yang bisa akses semua method.
     */
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'ADMIN') {
            abort(403, 'Hanya Admin yang dapat mengelola pengguna.');
        }
    }

    /**
     * GET /api/users
     * Daftar semua user (kecuali diri sendiri).
     */
    public function index(Request $request)
    {
        $this->checkAdmin($request);

        $users = User::with('pedukuhan')
            ->orderBy('role')
            ->orderBy('name')
            ->get()
            ->map(fn($u) => $this->format($u));

        return response()->json($users);
    }

    /**
     * POST /api/users
     * Buat user baru.
     */
    public function store(Request $request)
    {
        $this->checkAdmin($request);

        $validated = $request->validate([
            'username'     => 'required|string|unique:users,username|max:100',
            'password'     => 'required|string|min:6',
            'role'         => 'required|in:HEALTH_WORKER,VILLAGE_HEAD',
            'pedukuhan_id' => 'nullable|uuid|exists:pedukuhans,id',
        ]);

        $user = User::create([
            'id'           => Str::uuid()->toString(),
            'username'     => $validated['username'],
            'name'         => $validated['username'], // fallback: name sama dengan username
            'password'     => Hash::make($validated['password']),
            'role'         => $validated['role'],
            'pedukuhan_id' => $validated['pedukuhan_id'] ?? null,
        ]);

        return response()->json($this->format($user->load('pedukuhan')), 201);
    }

    /**
     * PUT /api/users/{id}
     * Update user.
     */
    public function update(Request $request, string $id)
    {
        $this->checkAdmin($request);

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'username'     => "sometimes|string|unique:users,username,{$id}|max:100",
            'password'     => 'nullable|string|min:6',
            'role'         => 'sometimes|in:HEALTH_WORKER,VILLAGE_HEAD',
            'pedukuhan_id' => 'nullable|uuid|exists:pedukuhans,id',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($this->format($user->load('pedukuhan')));
    }

    /**
     * DELETE /api/users/{id}
     * Hapus user (tidak bisa hapus diri sendiri).
     */
    public function destroy(Request $request, string $id)
    {
        $this->checkAdmin($request);

        if ($request->user()->id === $id) {
            return response()->json(['error' => 'Tidak dapat menghapus akun Anda sendiri.'], 422);
        }

        $user = User::findOrFail($id);
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Pengguna berhasil dihapus.']);
    }

    private function format(User $u): array
    {
        return [
            'id'           => $u->id,
            'username'     => $u->username,
            'name'         => $u->name,
            'role'         => $u->role,
            'pedukuhan_id' => $u->pedukuhan_id,
            'pedukuhanName'=> $u->pedukuhan?->name,
        ];
    }
}
