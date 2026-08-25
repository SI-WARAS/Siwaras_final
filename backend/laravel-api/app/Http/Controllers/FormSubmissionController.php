<?php

namespace App\Http\Controllers;

use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FormSubmissionController extends Controller
{
    public function index(Request $request)
    {
        $submissions = FormSubmission::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($submissions);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'form_name' => 'required|string',
            'form_data' => 'required|array',
            'status' => 'required|string',
            'icon_type' => 'required|string',
            'color' => 'required|string',
            'bg_color' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $submission = new FormSubmission();
        $submission->user_id = $request->user() ? $request->user()->id : null;
        $submission->form_name = $request->form_name;
        $submission->form_data = $request->form_data;
        $submission->status = $request->status;
        $submission->icon_type = $request->icon_type;
        $submission->color = $request->color;
        $submission->bg_color = $request->bg_color;
        $submission->save();

        return response()->json($submission, 201);
    }
}
