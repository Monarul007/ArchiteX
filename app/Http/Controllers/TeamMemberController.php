<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class TeamMemberController extends Controller
{
    public function index()
    {
        $teamMembers = TeamMember::orderBy('name')->get();

        return Inertia::render('Team/Index', [
            'teamMembers' => $teamMembers,
        ]);
    }

    public function show(TeamMember $teamMember)
    {
        // Load the member's activities
        $teamMember->load(['activities' => function ($query) {
            $query->orderBy('created_at', 'desc')->take(50);
        }]);

        return Inertia::render('Team/Show', [
            'teamMember' => $teamMember,
        ]);
    }

    public function update(Request $request, TeamMember $teamMember)
    {
        $validated = $request->validate([
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:50',
            'availability_hours' => 'nullable|integer|min:0|max:168',
        ]);

        $teamMember->update([
            'skills' => $validated['skills'] ?? [],
            'availability_hours' => $validated['availability_hours'] ?? $teamMember->availability_hours,
        ]);

        return back()->with('success', 'Team member updated successfully.');
    }

    public function sync()
    {
        try {
            Artisan::call('coder71:sync');

            return back()->with('success', 'Team members and activities synced successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Sync failed: '.$e->getMessage());
        }
    }

    public function destroy(TeamMember $teamMember)
    {
        // Unassign tasks manually since we don't have a DB-level FK constraint that does ON DELETE SET NULL
        Task::where('assigned_to', $teamMember->id)->update(['assigned_to' => null]);

        // Delete activities manually in case the char column constraint didn't apply properly
        $teamMember->activities()->delete();

        $teamMember->delete();

        return back()->with('success', 'Team member deleted successfully.');
    }
}
