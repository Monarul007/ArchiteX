<?php

namespace App\Ai\Agents;

use App\Ai\Middleware\LogPrompts;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasMiddleware;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider([Lab::Gemini, Lab::xAI])]
#[Model('gemini-1.5-flash')]
#[Timeout(300)]
class MasterPlanAgent implements Agent, Conversational, HasMiddleware, HasStructuredOutput, HasTools
{
    use Promptable, RemembersConversations;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'PROMPT'
Consolidate project data into a final high-fidelity Master Plan document JSON.
PROMPT;
    }

    /**
     * Get the JSON schema for the agent's output.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'overview' => $schema->object([
                'leadArchitect' => $schema->string()->required(),
                'status' => $schema->string()->required(),
                'vision' => $schema->string()->required(),
                'missionBrief' => $schema->string()->required(),
            ])->required(),
            'bestPractices' => $schema->array($schema->string())->required(),
            'modules' => $schema->array($schema->object([
                'title' => $schema->string()->required(),
                'rationale' => $schema->string()->required(),
                'role' => $schema->string()->required(),
                'mermaidDiagram' => $schema->string()->required(),
            ]))->required(),
            'milestones' => $schema->array($schema->object([
                'title' => $schema->string()->required(),
                'focus' => $schema->string()->required(),
                'duration' => $schema->string()->required(),
                'tasks' => $schema->array($schema->object([
                    'module' => $schema->string()->required(),
                    'description' => $schema->string()->required(),
                    'time' => $schema->string()->required(),
                    'role' => $schema->string()->required(),
                ]))->required(),
            ]))->required(),
            'roleSummaries' => $schema->array($schema->object([
                'role' => $schema->string()->required(),
                'totalTasks' => $schema->integer()->required(),
                'totalHours' => $schema->string()->required(),
            ]))->required(),
            'dependencies' => $schema->array($schema->string())->required(),
            'strategicVision' => $schema->string()->required(),
            'considerations' => $schema->array($schema->string())->required(),
        ];
    }

    /**
     * Get the agent's middleware.
     */
    public function middleware(): array
    {
        return [
            new LogPrompts,
        ];
    }

    /**
     * Get the tools available to the agent.
     */
    public function tools(): iterable
    {
        return [];
    }
}
