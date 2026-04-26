<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Project Plan - {{ $project->title }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; color: #333; }
        h1 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        h2 { color: #2d3748; margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #cbd5e0; padding: 8px; text-align: left; }
        th { background-color: #f7fafc; color: #4a5568; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; background-color: #e2e8f0; color: #4a5568; }
        .critical { background-color: #fed7d7; color: #c53030; }
        .high { background-color: #feebc8; color: #c05621; }
        .todo { background-color: #e2e8f0; color: #4a5568; }
        .in_progress { background-color: #bee3f8; color: #2b6cb0; }
        .done { background-color: #c6f6d5; color: #2f855a; }
    </style>
</head>
<body>
    <h1>Project: {{ $project->title }}</h1>
    
    <div style="margin-bottom: 24px;">
        <p><strong>Client:</strong> {{ $project->client_name ?? 'N/A' }}</p>
        <p><strong>Status:</strong> {{ ucfirst($project->status) }} - {{ ucfirst($project->current_phase) }}</p>
        <p><strong>Timeline:</strong> {{ $project->timeline ?? 'N/A' }}</p>
        <p><strong>Budget:</strong> {{ $project->budget ?? 'N/A' }}</p>
    </div>

    @if($project->latestBlueprint)
    <div>
        <h2>Executive Summary</h2>
        <p>{{ $project->latestBlueprint->executive_summary ?? 'No summary available.' }}</p>
    </div>
    @endif

    <h2>Tasks & Milestones</h2>
    <table>
        <thead>
            <tr>
                <th>Phase</th>
                <th>Task</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Est. Hours</th>
            </tr>
        </thead>
        <tbody>
            @foreach($project->tasks->sortBy('sort_order') as $task)
            <tr>
                <td>{{ $task->phase ?? 'M' . $task->milestone_index }}</td>
                <td>
                    <strong>{{ $task->title }}</strong>
                    <div style="font-size: 12px; color: #718096; margin-top: 4px;">{{ Str::limit($task->description, 100) }}</div>
                </td>
                <td>{{ $task->assignee ? $task->assignee->name : 'Unassigned' }}</td>
                <td><span class="badge {{ $task->priority }}">{{ ucfirst($task->priority) }}</span></td>
                <td><span class="badge {{ $task->status }}">{{ str_replace('_', ' ', ucfirst($task->status)) }}</span></td>
                <td>{{ $task->estimated_hours }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
