<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::with('pedukuhan')->where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Batasi maksimal 5 perangkat/sesi aktif (multi-login)
        $maxTokens = 5;
        if ($user->tokens()->count() >= $maxTokens) {
            // Sisakan 4 token yang paling baru/terakhir digunakan, hapus sisanya
            // Sehingga setelah token baru dibuat, total maksimal menjadi 5.
            $tokensToKeep = $user->tokens()
                ->orderByDesc('last_used_at')
                ->take($maxTokens - 1)
                ->pluck('id');

            $user->tokens()->whereNotIn('id', $tokensToKeep)->delete();
        }

        $token = $user->createToken('siwaras-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => [
                'id'            => $user->id,
                'username'      => $user->username,
                'name'          => $user->name,
                'role'          => $user->role,
                'pedukuhanId'   => $user->pedukuhan_id,
                'pedukuhanName' => $user->pedukuhan ? $user->pedukuhan->name : null,
            ],
        ]);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('pedukuhan');
        return response()->json([
            'user' => [
                'id'            => $user->id,
                'username'      => $user->username,
                'name'          => $user->name,
                'role'          => $user->role,
                'pedukuhanId'   => $user->pedukuhan_id,
                'pedukuhanName' => $user->pedukuhan ? $user->pedukuhan->name : null,
            ],
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
