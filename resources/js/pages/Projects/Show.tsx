import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    ChevronRight, MessageSquare, Send, Zap, Clock,
    Layers, FileText, CheckSquare, Users,
    Maximize2, Download, RefreshCcw, Sparkles,
    ZoomIn, X, AlertCircle, Lightbulb, Shield,
    Calendar, Flag, Briefcase, ChevronDown, ChevronUp,
    Sun, Moon, ArrowLeft, MoreHorizontal, Circle, CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';
import { useTheme } from '../../hooks/useTheme';

// ── Mermaid init ──────────────────────────────────────────────────────────────
mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
        primaryColor: '#fdf2f8',
        primaryTextColor: '#1a1a1a',
        primaryBorderColor: '#F93A8B',
        lineColor: '#e879a8',
        background: '#ffffff',
        mainBkg: '#fdf2f8',
        nodeBorder: '#F93A8B',
        fontFamily: 'Inter',
        fontSize: '12px',
    },
});

// ── Mermaid component ─────────────────────────────────────────────────────────
const Mermaid = ({ chart, title = 'Diagram' }: { chart: string; title?: string }) => {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showRaw, setShowRaw] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [id] = useState(() => `mermaid-${Math.random().toString(36).slice(2, 11)}`);
    const { isDark } = useTheme();

    useEffect(() => {
        if (!chart) return;
        const render = async () => {
            try {
                setError(null);
                let processed = chart.trim();
                ['graph TD','graph LR','erDiagram','sequenceDiagram','gantt','pie','classDiagram','stateDiagram'].forEach(t => {
                    processed = processed.replace(new RegExp(`^(${t})(?!\\s|\\n)`, 'i'), `$1\n`);
                });
                const { svg } = await mermaid.render(id, processed);
                setSvg(svg);
            } catch {
                setError('Could not render diagram.');
            }
        };
        render();
    }, [chart, isDark]);

    if (error) {
        return (
            <div className="card p-8 text-center space-y-3 border-destructive/20">
                <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-primary underline underline-offset-2">
                    {showRaw ? 'Hide source' : 'View source'}
                </button>
                {showRaw && (
                    <pre className="text-left text-xs p-4 bg-muted rounded-md overflow-x-auto font-mono text-muted-foreground mt-2">
                        {chart}
                    </pre>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="card p-6 overflow-hidden relative group">
                <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-4 right-4 btn btn-ghost btn-icon opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Fullscreen"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
                <div
                    className="overflow-x-auto flex justify-center w-full min-h-[180px]"
                    dangerouslySetInnerHTML={{ __html: isFullscreen ? '' : svg }}
                />
            </div>

            {isFullscreen && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/95 backdrop-blur-xl animate-fade-in">
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-primary mb-0.5">ArchiteX Diagram</p>
                            <h3 className="text-lg font-bold text-foreground">{title}</h3>
                        </div>
                        <button onClick={() => setIsFullscreen(false)} className="btn btn-outline btn-icon">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="pt-24 pb-8 px-6 w-full h-full overflow-auto flex items-start justify-center">
                        <div className="card p-8 w-fit max-w-full">
                            <div
                                dangerouslySetInnerHTML={{ __html: svg.split(id).join(`${id}-fs`) }}
                                style={{ minWidth: '600px' }}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message { id: string; role: string; content: string; created_at: string; }
interface TeamMember { id: string; name: string; role: string; skills: string[]; }
interface ProjectProps { project: any; team: TeamMember[]; messages: Message[]; }

// ── Priority badge helper ─────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
    const map: Record<string, string> = {
        critical: 'badge badge-destructive',
        high:     'badge bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
        medium:   'badge badge-default',
        low:      'badge badge-secondary',
    };
    return <span className={map[priority] || 'badge badge-outline'}>{priority}</span>;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Show({ project, team, messages }: ProjectProps) {
    const [activeTab, setActiveTab] = useState('blueprint');
    const [isThinking, setIsThinking] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<number>(
        project.blueprints.length > 0 ? project.blueprints[0].version : 1
    );
    const [expandedMilestones, setExpandedMilestones] = useState<number[]>(
        project.blueprints.length > 0 ? project.blueprints[0].milestones.map((_: any, i: number) => i) : []
    );
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { isDark, toggleTheme } = useTheme();

    const { data: chatData, setData: setChatData, post: postChat, processing: chatProcessing, reset: resetChat } = useForm({ message: '' });

    const handleChat = (e: React.FormEvent) => {
        e.preventDefault();
        postChat(route('projects.chat', project.id), {
            onStart: () => setIsThinking(true),
            onFinish: () => { setIsThinking(false); resetChat(); },
        });
    };

    const blueprint = project.blueprints.find((b: any) => b.version === selectedVersion) || project.blueprints[0] || {};
    const estimate  = project.estimates[0] || {};
    const proposal  = project.proposals[0] || {};
    const tasks     = project.tasks || [];

    useEffect(() => {
        if (project.blueprints.length > 0) setSelectedVersion(project.blueprints[0].version);
    }, [project.blueprints.length]);

    useEffect(() => {
        if (project.status === 'planning') {
            const interval = setInterval(() => router.reload({ only: ['project', 'messages'] }), 7000);
            return () => clearInterval(interval);
        }
    }, [project.status]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const tabs = [
        { id: 'blueprint', label: 'Architecture', icon: Layers },
        { id: 'estimate',  label: 'Estimates',   icon: Clock },
        { id: 'proposal',  label: 'Proposal',    icon: FileText },
        { id: 'roadmap',   label: 'Roadmap',     icon: Calendar },
        { id: 'tasks',     label: 'Tasks',       icon: CheckSquare },
        { id: 'team',      label: 'Team',        icon: Users },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title={`${project.title} — ArchiteX`} />

            {/* ── Top header ─────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="px-6 h-14 flex items-center justify-between gap-4">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 min-w-0">
                        <Link href={route('dashboard')} className="btn btn-ghost btn-icon text-muted-foreground shrink-0">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <span className="text-muted-foreground text-sm hidden sm:inline-block">Dashboard</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 hidden sm:inline-block" />
                        <span className="text-sm font-semibold text-foreground truncate">{project.title}</span>

                        {/* Version picker */}
                        <div className="relative group ml-2">
                            <button className="badge badge-secondary border hover:border-primary/30 transition-colors cursor-pointer select-none">
                                <Clock className="w-3 h-3 mr-1 text-primary" />
                                v{blueprint.version || 1}.0
                            </button>
                            {project.blueprints.length > 1 && (
                                <div className="absolute top-full left-0 mt-1.5 w-64 card p-1.5 shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto transition-all origin-top-left z-50">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 py-1.5 font-medium">Version History</p>
                                    <div className="max-h-60 overflow-y-auto space-y-0.5">
                                        {project.blueprints.map((b: any) => (
                                            <button
                                                key={b.id}
                                                onClick={() => setSelectedVersion(b.version)}
                                                className={`w-full text-left px-3 py-2 rounded-sm text-sm flex items-center justify-between transition-colors ${
                                                    selectedVersion === b.version
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'hover:bg-accent text-foreground'
                                                }`}
                                            >
                                                <span className="font-medium">v{b.version}.0</span>
                                                <span className="text-xs opacity-60">{new Date(b.created_at).toLocaleDateString()}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="hidden lg:flex items-center gap-5 text-xs text-muted-foreground">
                        {project.client_name && (
                            <span><span className="font-medium text-foreground">{project.client_name}</span></span>
                        )}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button className="btn btn-outline btn-sm hidden sm:flex">
                            <Download className="w-3.5 h-3.5" />
                            Export PDF
                        </button>
                        <button onClick={toggleTheme} className="theme-toggle">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* Main content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-6">

                        {/* Tabs */}
                        <div className="tabs-list mb-6 flex-wrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`tab-trigger ${activeTab === tab.id ? 'active' : ''}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Planning state ── */}
                        {project.status === 'planning' && (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 py-20">
                                <div className="relative">
                                    <div
                                        className="w-20 h-20 rounded-full border-2 border-t-primary animate-spin"
                                        style={{ borderColor: 'hsl(var(--border))', borderTopColor: 'hsl(var(--primary))' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles className="w-7 h-7 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        Architecting <span className="text-primary">{project.current_phase || 'Project'}</span>
                                    </h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        The AI is orchestrating multi-agent simulations to generate your technical blueprint, resource estimates, and task breakdown.
                                    </p>
                                    {project.latest_status_message && (
                                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                                            <Zap className="w-3.5 h-3.5" />
                                            {project.latest_status_message}
                                        </div>
                                    )}
                                </div>
                                {/* Phase progress */}
                                <div className="flex items-center gap-3">
                                    {['blueprint', 'estimation', 'proposal'].map((phase, i) => (
                                        <React.Fragment key={phase}>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                project.current_phase === phase
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-background text-muted-foreground border-border'
                                            }`}>
                                                {phase.charAt(0).toUpperCase() + phase.slice(1)}
                                            </div>
                                            {i < 2 && <div className="w-6 h-px bg-border" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Error state ── */}
                        {project.error_message && project.status !== 'planning' && (
                            <div className="card p-8 text-center space-y-4 max-w-lg mx-auto border-destructive/30">
                                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                                    <Zap className="w-6 h-6 text-destructive" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">Generation Failed</h3>
                                <p className="text-sm text-muted-foreground">{project.error_message}</p>
                                <button
                                    onClick={() => router.post(route('projects.chat', project.id), { message: 'Retry: Recovering from interrupted architectural phase.', retry: true })}
                                    className="btn btn-primary"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Retry Generation
                                </button>
                            </div>
                        )}

                        {/* ── Tabs content ── */}
                        {project.status !== 'planning' && !project.error_message && (
                            <div className="animate-fade-in">

                                {/* ── Blueprint ── */}
                                {activeTab === 'blueprint' && (
                                    <div className="space-y-8">
                                        {/* PRD brief */}
                                        <div className="card p-5 border-primary/20 bg-primary/5">
                                            <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Original Brief
                                            </p>
                                            <div className="max-h-48 overflow-y-auto prose-architex text-sm leading-relaxed">
                                                <ReactMarkdown>{project.brief}</ReactMarkdown>
                                            </div>
                                        </div>

                                        {/* Overview */}
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground mb-2">Strategic Framework</h2>
                                            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{blueprint.overview}</p>
                                        </div>

                                        {/* Business context */}
                                        {blueprint.businessContext && (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                <div className="card p-5 border-l-2 border-l-destructive/60">
                                                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4 text-destructive" />
                                                        Business Challenges
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {blueprint.businessContext.challenges?.map((c: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                <div className="w-1 h-1 rounded-full bg-destructive/60 mt-2 shrink-0" />
                                                                {c}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="card p-5 border-l-2 border-l-amber-400/60">
                                                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                                        Strategic Suggestions
                                                    </h3>
                                                    <ul className="space-y-2">
                                                        {blueprint.businessContext.suggestions?.map((s: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                <div className="w-1 h-1 rounded-full bg-amber-400/60 mt-2 shrink-0" />
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Strategy + Scope */}
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                            <div className="card p-5">
                                                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-primary" />
                                                    Architectural Strategy
                                                </h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">Primary Decision</p>
                                                        <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm text-primary">
                                                            {blueprint.strategy?.decision}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">Tradeoffs</p>
                                                        <ul className="space-y-1.5">
                                                            {blueprint.strategy?.tradeoffs?.map((t: string, i: number) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                    <div className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                                                                    {t}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card p-5">
                                                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                    Phased Feature Scope
                                                </h3>
                                                <div className="space-y-3">
                                                    {['mvp', 'v1', 'future'].map(stage => (
                                                        <div key={stage} className="flex gap-3 items-start">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider pt-0.5 w-10 shrink-0 ${
                                                                stage === 'mvp' ? 'text-destructive' : stage === 'v1' ? 'text-primary' : 'text-muted-foreground'
                                                            }`}>{stage}</span>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {blueprint.scope?.[stage]?.map((item: string, i: number) => (
                                                                    <span key={i} className="badge badge-secondary text-xs">
                                                                        {item}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Diagrams */}
                                        <div className="space-y-6">
                                            <div className="separator" />
                                            <h3 className="text-base font-semibold text-foreground">Architectural Diagrams</h3>

                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
                                                    <Zap className="w-3.5 h-3.5 text-primary" />
                                                    System Context &amp; Integration Flow
                                                </p>
                                                <Mermaid chart={blueprint.architecture?.hldMermaid} title={`${project.title} - High Level Design`} />
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                                        Data Model
                                                    </p>
                                                    <Mermaid chart={blueprint.architecture?.dbMermaid} title={`${project.title} - Database Schema`} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                                                        Frontend Flow
                                                    </p>
                                                    <Mermaid chart={blueprint.architecture?.frontendMermaid} title={`${project.title} - Frontend Logic`} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tech Stack */}
                                        {blueprint.techStack && (
                                            <div className="space-y-4 pt-4">
                                                <div className="separator" />
                                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-primary" />
                                                    Tech Stack
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {blueprint.techStack.map((stack: any, i: number) => (
                                                        <div key={i} className="card p-5 hover:border-primary/30 transition-colors">
                                                            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                                                <div className="lg:w-1/3">
                                                                    <p className="text-xs text-primary font-medium mb-2">{stack.category}</p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {stack.items.map((item: string, j: number) => (
                                                                            <span key={j} className="badge badge-default text-xs">{item}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 space-y-3">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground font-medium mb-1">Rationale</p>
                                                                        <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3 italic">
                                                                            {stack.rationale}
                                                                        </p>
                                                                    </div>
                                                                    {stack.alternatives?.length > 0 && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground font-medium mb-1">Considered Alternatives</p>
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {stack.alternatives.map((alt: string, j: number) => (
                                                                                    <span key={j} className="badge badge-outline text-xs opacity-50 line-through">{alt}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Considerations */}
                                        {blueprint.architecture?.considerations && (
                                            <div className="space-y-4 pt-4">
                                                <div className="separator" />
                                                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-destructive" />
                                                    Architectural Considerations
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {blueprint.architecture.considerations.map((c: string, i: number) => (
                                                        <div key={i} className="card p-4 flex items-start gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                            <p className="text-sm text-muted-foreground leading-relaxed">{c}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Estimates ── */}
                                {activeTab === 'estimate' && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="card p-5">
                                                <p className="text-xs text-muted-foreground font-medium mb-2">Total Hours</p>
                                                <div className="text-3xl font-bold text-foreground">{estimate.total_hours}</div>
                                                <p className="text-xs text-muted-foreground mt-1">Engineering hours</p>
                                            </div>
                                            <div className="card p-5">
                                                <p className="text-xs text-muted-foreground font-medium mb-2">Duration</p>
                                                <div className="text-3xl font-bold text-foreground">{estimate.duration_weeks}</div>
                                                <p className="text-xs text-muted-foreground mt-1">Weeks</p>
                                            </div>
                                            <div className="card p-5">
                                                <p className="text-xs text-muted-foreground font-medium mb-2">Risk Buffer</p>
                                                <div className="text-3xl font-bold text-foreground">+{estimate.risk_buffer_percent}%</div>
                                                <p className="text-xs text-muted-foreground mt-1">Contingency</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            <div className="card p-5">
                                                <h3 className="text-sm font-semibold text-foreground mb-4">Team Composition</h3>
                                                <div className="space-y-2">
                                                    {estimate.team_composition?.map((t: any, i: number) => (
                                                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                    {t.count}
                                                                </div>
                                                                <span className="text-sm font-medium text-foreground">{t.role}</span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{t.hours_per_day}h/day</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="card p-5">
                                                <h3 className="text-sm font-semibold text-foreground mb-4">Phase Breakdown</h3>
                                                <div className="space-y-3">
                                                    {estimate.phase_breakdown?.map((p: any, i: number) => (
                                                        <div key={i} className="space-y-1.5">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-muted-foreground font-medium">{p.phase}</span>
                                                                <span className="text-foreground font-semibold">{p.hours}h</span>
                                                            </div>
                                                            <div className="progress">
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{ width: `${(p.hours / estimate.total_hours) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Proposal ── */}
                                {activeTab === 'proposal' && (
                                    <div className="max-w-3xl mx-auto card p-8 lg:p-12">
                                        <div className="prose-architex">
                                            <ReactMarkdown>{proposal.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                {/* ── Roadmap ── */}
                                {activeTab === 'roadmap' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-foreground mb-1">Execution Roadmap</h2>
                                                <p className="text-sm text-muted-foreground">v{blueprint.version}.0 milestones</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="card px-4 py-2">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Milestones</p>
                                                    <p className="text-xl font-bold text-foreground">{blueprint.milestones?.length || 0}</p>
                                                </div>
                                                <div className="card px-4 py-2">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</p>
                                                    <p className="text-xl font-bold text-primary">{tasks.length}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gantt */}
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                Timeline
                                            </p>
                                            <Mermaid
                                                title={`${project.title} - Roadmap`}
                                                chart={`gantt
    title ${project.title} Timeline
    dateFormat  YYYY-MM-DD
    axisFormat %W
    section Milestones
    ${blueprint.milestones?.map((m: any, i: number) => {
        const name = (m.name || `Phase ${i+1}`).replace(/"/g, "'");
        return `"${name}" :milestone, m${i}, 2024-01-01, 1d`;
    }).join('\n    ')}
    section Phases
    ${blueprint.milestones?.map((m: any, i: number) => {
        const name = (m.name || `Phase ${i+1}`).replace(/"/g, "'");
        let dur = m.duration || '1w';
        if (dur.toLowerCase().includes('week')) dur = parseInt(dur) + 'w';
        else if (dur.toLowerCase().includes('day')) dur = parseInt(dur) + 'd';
        return `"${name}" :active, p${i}, 2024-01-01, ${dur}`;
    }).join('\n    ')}`}
                                            />
                                        </div>

                                        {/* Milestone accordion */}
                                        <div className="space-y-3">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-2">
                                                <Flag className="w-3.5 h-3.5 text-primary" />
                                                Phase Breakdown
                                            </p>
                                            {blueprint.milestones?.map((milestone: any, mIndex: number) => {
                                                const milestoneTasks = tasks.filter((t: any) => t.milestone_index === mIndex);
                                                const isExpanded = expandedMilestones.includes(mIndex);
                                                return (
                                                    <div key={mIndex} className="card overflow-hidden">
                                                        <button
                                                            onClick={() => {
                                                                if (isExpanded) setExpandedMilestones(expandedMilestones.filter(i => i !== mIndex));
                                                                else setExpandedMilestones([...expandedMilestones, mIndex]);
                                                            }}
                                                            className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary"
                                                                >
                                                                    {String(mIndex + 1).padStart(2, '0')}
                                                                </div>
                                                                <div className="text-left">
                                                                    <h4 className="text-sm font-semibold text-foreground">{milestone.name}</h4>
                                                                    <p className="text-xs text-muted-foreground">{milestone.duration}</p>
                                                                </div>
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="px-5 pb-5 border-t border-border">
                                                                <p className="text-sm text-muted-foreground leading-relaxed py-4 border-b border-border mb-4">
                                                                    {milestone.description}
                                                                </p>

                                                                {/* Deliverables */}
                                                                {milestone.deliverables?.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                                        {milestone.deliverables.map((d: string, di: number) => (
                                                                            <span key={di} className="badge badge-outline text-xs">{d}</span>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Tasks table */}
                                                                {milestoneTasks.length > 0 && (
                                                                    <div className="overflow-hidden rounded-md border border-border">
                                                                        <table className="w-full text-sm">
                                                                            <thead>
                                                                                <tr className="bg-muted/50 border-b border-border">
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Priority</th>
                                                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Task</th>
                                                                                    <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Hours</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-border">
                                                                                {milestoneTasks.map((task: any, tIndex: number) => (
                                                                                    <tr key={tIndex} className="hover:bg-muted/30 transition-colors">
                                                                                        <td className="px-4 py-3">
                                                                                            <PriorityBadge priority={task.priority} />
                                                                                        </td>
                                                                                        <td className="px-4 py-3">
                                                                                            <div className="font-medium text-foreground text-sm">{task.title}</div>
                                                                                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</div>
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-right font-semibold text-foreground">{task.estimated_hours}h</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── Tasks ── */}
                                {activeTab === 'tasks' && (
                                    <div className="space-y-6">
                                        {/* Status summary */}
                                        <div className="flex flex-wrap gap-3">
                                            {['todo','in_progress','review','done'].map(s => (
                                                <div key={s} className="card px-4 py-2.5 flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        s === 'done' ? 'bg-emerald-500' :
                                                        s === 'in_progress' ? 'bg-primary animate-pulse' :
                                                        'bg-muted-foreground/30'
                                                    }`} />
                                                    <span className="text-xs text-muted-foreground capitalize">{s.replace('_', ' ')}</span>
                                                    <span className="text-xs font-semibold text-foreground">{tasks.filter((t: any) => t.status === s).length}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Task list */}
                                        <div className="space-y-2">
                                            {tasks.map((task: any, i: number) => (
                                                <div key={task.id} className="card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group">
                                                    <div className={`w-3 h-3 rounded-full shrink-0 border-2 ${
                                                        task.priority === 'critical' ? 'bg-destructive border-destructive' :
                                                        task.priority === 'high' ? 'bg-amber-500 border-amber-500' :
                                                        'bg-primary border-primary'
                                                    }`} />

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{task.title}</h4>
                                                            <span className="badge badge-secondary text-[10px] shrink-0">{task.phase}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                                                    </div>

                                                    <div className="flex items-center gap-4 shrink-0">
                                                        <div className="text-right">
                                                            <div className="text-sm font-semibold text-foreground">{task.estimated_hours}h</div>
                                                        </div>
                                                        <div
                                                            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary"
                                                            title={task.assignee?.name}
                                                        >
                                                            {task.assignee
                                                                ? task.assignee.name.split(' ').map((n: any) => n[0]).join('')
                                                                : <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Team ── */}
                                {activeTab === 'team' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {team.map(member => (
                                            <div key={member.id} className="card p-5 hover:border-primary/30 transition-colors group">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 group-hover:scale-105 transition-transform"
                                                        style={{ background: 'hsl(var(--primary))' }}
                                                    >
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-foreground">{member.name}</h4>
                                                        <p className="text-xs text-primary">{member.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {member.skills.map(s => (
                                                        <span key={s} className="badge badge-secondary text-[11px]">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Chat Sidebar ──────────────────────────────────────── */}
                <aside
                    className="w-[340px] xl:w-[380px] shrink-0 border-l border-border flex flex-col bg-background"
                    style={{ height: 'calc(100vh - 3.5rem)', position: 'sticky', top: '3.5rem' }}
                >
                    {/* Chat header */}
                    <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" />
                                AI Assistant
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-muted-foreground">Live</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">v{blueprint.version}.0 session</p>
                    </div>

                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Welcome */}
                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-primary shrink-0 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            <div className="card p-3 text-sm text-muted-foreground leading-relaxed max-w-[90%]">
                                <p className="text-xs font-semibold text-primary mb-1">ArchiteX AI</p>
                                Architecture v{blueprint.version}.0 is ready. How would you like to refine the scope?
                            </div>
                        </div>

                        {/* Original brief */}
                        <div className="flex flex-col items-end">
                            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none px-4 py-3 text-sm max-w-[90%]">
                                <p className="text-[10px] font-semibold mb-1 opacity-70">Initial Brief</p>
                                <div className="prose-invert prose-sm text-primary-foreground/90 line-clamp-4 leading-relaxed">
                                    <ReactMarkdown>{project.brief}</ReactMarkdown>
                                </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 mr-1">
                                {new Date(project.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* Messages */}
                        {messages.map((msg: any, index: number) => {
                            const isSystemAction = msg.role === 'user' && (
                                msg.content.includes('Based on the updated blueprint') ||
                                msg.content.includes('Generate a technical proposal') ||
                                msg.content.includes('Generate granular, assignable developer tasks') ||
                                msg.content.includes('Neural Sync Retry')
                            );

                            if (isSystemAction) {
                                return (
                                    <div key={msg.id || index} className="flex items-center gap-2 opacity-40">
                                        <div className="flex-1 h-px bg-border" />
                                        <Zap className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground">System action</span>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>
                                );
                            }

                            let content = msg.content;
                            let parsedContent: any = null;
                            try {
                                if (content.trim().startsWith('{')) parsedContent = JSON.parse(content);
                            } catch {}

                            const isUser = msg.role === 'user';
                            return (
                                <div key={msg.id || index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                    {!isUser && (
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <Sparkles className="w-2.5 h-2.5 text-white" />
                                            </div>
                                            <span className="text-[10px] font-medium text-primary">ArchiteX AI</span>
                                        </div>
                                    )}
                                    <div className={`rounded-2xl px-4 py-3 text-sm max-w-[92%] ${
                                        isUser
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'card text-muted-foreground rounded-tl-none'
                                    }`}>
                                        {parsedContent ? (
                                            <p className="text-sm">{parsedContent.overview || 'Blueprint synchronized.'}</p>
                                        ) : (
                                            <div className="prose-sm">
                                                <ReactMarkdown>{content}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}

                        {/* Thinking indicator */}
                        {isThinking && (
                            <div className="flex items-start gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-primary shrink-0 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                                <div className="card px-4 py-3">
                                    <div className="flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    <div className="p-4 border-t border-border">
                        <form onSubmit={handleChat} className="space-y-2">
                            <div className="relative">
                                <textarea
                                    value={chatData.message}
                                    onChange={e => setChatData('message', e.target.value)}
                                    placeholder="Ask to refine the architecture…"
                                    rows={3}
                                    className="input text-sm resize-none pr-12 min-h-[80px] leading-relaxed"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleChat(e);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={chatProcessing || !chatData.message.trim()}
                                    className="absolute right-2.5 bottom-2.5 btn btn-primary btn-icon"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between px-0.5">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <RefreshCcw className="w-3 h-3" />
                                    Context-aware
                                </span>
                                <span className="text-[10px] text-muted-foreground">Enter to send · Shift+Enter for newline</span>
                            </div>
                        </form>
                    </div>
                </aside>
            </div>
        </div>
    );
}
