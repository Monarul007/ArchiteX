<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Barryvdh\DomPDF\Facade\Pdf;
use Rap2hpoutre\FastExcel\FastExcel;

class ProjectExportController extends Controller
{
    public function exportPdf(Project $project)
    {
        $project->load(['latestBlueprint', 'tasks.assignee']);

        $pdf = Pdf::loadView('exports.project-plan', compact('project'));

        return $pdf->download("project-plan-{$project->id}.pdf");
    }

    public function exportExcel(Project $project)
    {
        $project->load(['tasks.assignee']);

        $tasks = $project->tasks->map(function ($task) {
            return [
                'Milestone' => $task->milestone_index,
                'Task Title' => $task->title,
                'Description' => $task->description,
                'Priority' => $task->priority,
                'Status' => $task->status,
                'Phase' => $task->phase,
                'Assigned To' => $task->assignee ? $task->assignee->name : 'Unassigned',
                'Estimated Hours' => $task->estimated_hours,
            ];
        });

        return (new FastExcel($tasks))->download("project-tasks-{$project->id}.xlsx");
    }
}
