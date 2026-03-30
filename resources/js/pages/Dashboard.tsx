import React, { useState } from 'react';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import {
    Plus, Layout, Clock, User, ArrowRight, Zap,
    Target, Shield, LogOut, FileText, Sun, Moon,
    LayoutDashboard, Folder, Settings, TrendingUp
} from 'lucide-react';
import { PageProps } from '@inertiajs/core';
import { useTheme } from '../hooks/useTheme';

interface Project {
    id: string;
    title: string;
    brief: string;
    status: string;
    client_name: string;
    created_at: string;
    latest_blueprint?: {
        overview: string;
        reliability_score: number;
    };
    latest_estimate?: {
        total_hours: number;
        duration_weeks: number;
    };
}

interface Props extends PageProps {
    projects: Project[];
    auth: {
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        planning:  'badge badge-default',
        completed: 'badge badge-success',
        error:     'badge badge-destructive',
    };
    return (
        <span className={map[status] || 'badge badge-secondary'}>
            {status}
        </span>
    );
}

export default function Dashboard({ projects }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        brief: '',
        client_name: '',
    });
    const { isDark, toggleTheme } = useTheme();
    const { auth } = usePage<Props>().props;
    const firstName = auth.user.name.split(' ')[0];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('projects.store'), { onSuccess: () => reset() });
    };

    const stats = [
        { label: 'Total Projects', value: projects.length, icon: Folder },
        {
            label: 'Active',
            value: projects.filter(p => p.status === 'planning').length,
            icon: TrendingUp,
        },
        {
            label: 'Completed',
            value: projects.filter(p => p.status === 'completed').length,
            icon: Shield,
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Head title="Dashboard" />

            {/* ── Sidebar ─────────────────────────────── */}
            <aside className="fixed left-0 top-0 h-full w-[220px] sidebar z-50 flex flex-col py-4 px-3">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-3 py-2 mb-6">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'hsl(var(--primary))' }}
                    >
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-sm text-foreground tracking-tight">
                        Archite<span className="text-primary">X</span>
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-0.5">
                    <button className="sidebar-nav-item active">
                        <LayoutDashboard className="w-4 h-4 shrink-0" />
                        Dashboard
                    </button>
                    <button className="sidebar-nav-item">
                        <Folder className="w-4 h-4 shrink-0" />
                        Projects
                    </button>
                    <button className="sidebar-nav-item">
                        <User className="w-4 h-4 shrink-0" />
                        Profile
                    </button>
                    <button className="sidebar-nav-item">
                        <Settings className="w-4 h-4 shrink-0" />
                        Settings
                    </button>
                </nav>

                {/* Bottom: user + theme */}
                <div className="space-y-1 border-t border-border pt-3 mt-3">
                    <div className="flex items-center gap-2.5 px-3 py-2">
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'hsl(var(--primary))' }}
                        >
                            {firstName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{auth.user.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{auth.user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 px-1">
                        <button
                            onClick={toggleTheme}
                            className="sidebar-nav-item flex-1 text-xs"
                        >
                            {isDark
                                ? <><Sun className="w-4 h-4" /> Light mode</>
                                : <><Moon className="w-4 h-4" /> Dark mode</>
                            }
                        </button>
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main ────────────────────────────────── */}
            <main className="flex-1 ml-[220px] min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-8 h-14">
                        <div>
                            <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
                            <p className="text-xs text-muted-foreground">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                                <span className="font-medium text-foreground">{firstName}</span>
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4 animate-fade-in">
                        {stats.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-primary" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-foreground">{value}</div>
                            </div>
                        ))}
                    </div>

                    {/* New Project Form */}
                    <section className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                        <div className="card card-accent p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <Plus className="w-4 h-4 text-primary" />
                                <h2 className="text-sm font-semibold text-foreground">New Project</h2>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="label" htmlFor="client_name">Client Name</label>
                                        <input
                                            id="client_name"
                                            type="text"
                                            value={data.client_name}
                                            onChange={e => setData('client_name', e.target.value)}
                                            placeholder="e.g. Acme Corp"
                                            className="input h-10"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="btn btn-primary w-full h-10"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                    </svg>
                                                    Generating…
                                                </>
                                            ) : (
                                                <>
                                                    Generate Blueprint
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="label" htmlFor="brief">Project Brief & Requirements</label>
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            Markdown supported
                                        </span>
                                    </div>
                                    <textarea
                                        id="brief"
                                        required
                                        value={data.brief}
                                        onChange={e => setData('brief', e.target.value)}
                                        placeholder="Describe goals, tech stack, and features…"
                                        rows={5}
                                        className="input min-h-[120px] resize-y font-mono text-sm leading-relaxed"
                                    />
                                    {errors.brief && (
                                        <p className="text-xs text-destructive">{errors.brief}</p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-foreground">Recent Projects</h2>
                            <span className="text-xs text-muted-foreground">{projects.length} total</span>
                        </div>

                        {projects.length === 0 ? (
                            <div className="card p-12 text-center border-dashed">
                                <Layout className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground">No projects yet.</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Use the form above to generate your first blueprint.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map((project, idx) => (
                                    <Link
                                        key={project.id}
                                        href={route('projects.show', project.id)}
                                        className="card p-5 flex flex-col group cursor-pointer animate-fade-in-up"
                                        style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <Target className="w-4 h-4 text-primary" />
                                            </div>
                                            <StatusBadge status={project.status} />
                                        </div>

                                        {/* Title + brief */}
                                        <h3 className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                                            {project.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-grow leading-relaxed">
                                            {project.brief}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center gap-4 pt-3 border-t border-border mt-auto">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="w-3.5 h-3.5" />
                                                {project.latest_estimate?.duration_weeks ?? 0}w
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Shield className="w-3.5 h-3.5" />
                                                {project.latest_blueprint?.reliability_score ?? 0}%
                                            </div>
                                            <div className="ml-auto flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                Open <ArrowRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Tips */}
                    <aside className="card p-4 flex items-start gap-3 animate-fade-in-up bg-primary/5 border-primary/20" style={{ animationDelay: '0.15s' }}>
                        <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-foreground mb-0.5">Pro tip</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Detailed project briefs yield 40% more accurate blueprints. Include specific libraries or infrastructure requirements for best results.
                            </p>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}
