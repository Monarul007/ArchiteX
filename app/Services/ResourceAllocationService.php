<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TeamMember;

class ResourceAllocationService
{
    /**
     * Auto-assign tasks for a given project based on skills and availability.
     */
    public function autoAssignTasks(string $projectId)
    {
        $tasks = Task::where('project_id', $projectId)
            ->whereNull('assigned_to')
            ->get();

        if ($tasks->isEmpty()) {
            return ['assigned' => 0, 'unassigned' => 0];
        }

        $teamMembers = TeamMember::where('is_active', true)->get();
        $assignedCount = 0;

        // Track members already assigned to this project
        $projectMembers = Task::where('project_id', $projectId)
            ->whereNotNull('assigned_to')
            ->pluck('assigned_to')
            ->toArray();

        foreach ($tasks as $task) {
            $bestMember = $this->findBestMemberForTask($task, $teamMembers, $projectMembers);

            if ($bestMember) {
                $task->update(['assigned_to' => $bestMember->id]);
                $projectMembers[] = $bestMember->id;
                $projectMembers = array_unique($projectMembers);
                $assignedCount++;
            }
        }

        return [
            'assigned' => $assignedCount,
            'unassigned' => $tasks->count() - $assignedCount,
        ];
    }

    /**
     * Find the best team member based on matching skills and available workload.
     */
    private function findBestMemberForTask(Task $task, $teamMembers, array $projectMembers)
    {
        $taskText = strtolower($task->title.' '.$task->description);

        $bestMember = null;
        $highestScore = -1;

        foreach ($teamMembers as $member) {
            $score = 0;
            $hasSkillMatch = false;

            // 1. Skill Matching Score
            $skills = $member->skills ?? [];
            foreach ($skills as $skill) {
                if (str_contains($taskText, strtolower($skill))) {
                    $score += 10; // High weight for matching skill
                    $hasSkillMatch = true;
                }
            }

            // Prefer members already assigned to this project if they have the required skill.
            // This ensures we don't bring in multiple people for the same stack.
            if ($hasSkillMatch && in_array($member->id, $projectMembers)) {
                $score += 1000;
            }

            // 2. Workload Availability Score
            // Calculate current workload for active tasks
            $currentWorkload = Task::where('assigned_to', $member->id)
                ->whereIn('status', ['todo', 'in_progress'])
                ->sum('estimated_hours');

            $availableHours = max(0, $member->availability_hours - $currentWorkload);

            // If they don't have enough hours for this task, penalize heavily
            $taskHours = $task->estimated_hours ?? 1;
            if ($availableHours < $taskHours) {
                $score -= 50;
            } else {
                // Add points for having availability
                $score += ($availableHours / 10);
            }

            if ($score > $highestScore) {
                $highestScore = $score;
                $bestMember = $member;
            }
        }

        // Only return a member if they have a non-negative score (meaning they have capacity or skill)
        return $highestScore >= 0 ? $bestMember : null;
    }
}
