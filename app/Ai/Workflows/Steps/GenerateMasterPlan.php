<?php

namespace App\Ai\Workflows\Steps;

use App\Ai\Agents\MasterPlanAgent;
use App\Models\Project;
use Closure;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Responses\StructuredAgentResponse;

class GenerateMasterPlan
{
    /**
     * Handle the pipeline step.
     */
    public function __invoke(array $payload, Closure $next)
    {
        /** @var Project $project */
        $project = $payload['project'];
        $user = $project->user;
        $targetVersion = $payload['targetVersion'];

        // Get the newly created blueprint, estimate, and tasks
        $blueprint = $project->blueprints()->where('version', $targetVersion)->first();
        $estimate = $project->estimates()->where('version', $targetVersion)->first();
        $tasks = $project->tasks()->where('milestone_index', '!=', null)->get(); // Tasks associated with milestones

        if (! $blueprint) {
            Log::warning("GenerateMasterPlan: No blueprint found for version {$targetVersion}. Skipping.");

            return $next($payload);
        }

        $project->update(['current_phase' => 'master_plan']);

        $masterPlanAgent = new MasterPlanAgent;
        if ($project->conversation_id) {
            $masterPlanAgent->continue($project->conversation_id, $user);
        } else {
            $masterPlanAgent->forUser($user);
        }

        $masterPlanContext = [
            'brief' => $project->brief,
            'blueprint' => [
                'overview' => $blueprint->overview,
                'strategy' => $blueprint->strategy,
                'scope' => $blueprint->scope,
                'architecture' => $blueprint->architecture,
                'componentDetails' => $blueprint->component_details,
                'milestones' => $blueprint->milestones,
                'techStack' => $blueprint->tech_stack,
            ],
            'estimate' => $estimate ? [
                'total_hours' => $estimate->total_hours,
                'duration_weeks' => $estimate->duration_weeks,
                'team' => $estimate->team_composition,
                'phases' => $estimate->phase_breakdown,
            ] : 'No estimate available.',
            'tasks' => $tasks->map(fn ($t) => [
                'title' => $t->title,
                'milestone_index' => $t->milestone_index,
                'hours' => $t->estimated_hours,
                'assignee' => $t->assignee?->name ?? 'Unassigned',
                'description' => $t->description,
            ])->toArray(),
        ];

        $prompt = "DATA SYNTHESIS FOR MASTER PLAN:\n".json_encode($masterPlanContext, JSON_PRETTY_PRINT)."\n\nProvide the final high-fidelity Master Plan document.";

        /** @var StructuredAgentResponse $response */
        $response = $masterPlanAgent->prompt($prompt);

        $blueprint->update([
            'master_plan' => $response->structured,
        ]);

        Log::info("Master Plan synthesized for project {$project->id} (v{$targetVersion}).");

        return $next($payload);
    }
}
