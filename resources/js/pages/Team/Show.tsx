import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { User, Clock, ArrowLeft, Activity, Briefcase, Zap, Layout, LogOut } from 'lucide-react';

interface ActivityLog {
    id: string;
    action: string;
    log_type: string;
    log_type_title: string;
    project_title: string;
    created_at: string;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    skills: string[];
    availability_hours: number;
    is_active: boolean;
    activities: ActivityLog[];
}

interface Props {
    teamMember: TeamMember;
}

export default function Show({ teamMember }: Props) {
    return (
        <div className="min-h-screen bg-[#0f0c13] text-white selection:bg-[#F93A8B]/30">
            <Head title={`${teamMember.name} - Profile`} />
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                h1, h2, h3, h4, h5, h6, .font-outfit { font-family: 'Outfit', sans-serif !important; }
                body { font-family: 'Space Grotesk', sans-serif; }
                .glass { background: rgba(21, 18, 26, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
            ` }} />

            {/* Sidebar / Navigation */}
            <div className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 border-r border-[#261E2E] bg-[#15121a]/50 backdrop-blur-xl z-50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F93A8B] to-[#F3B323] flex items-center justify-center mb-12 shadow-lg shadow-[#F93A8B]/20">
                    <Zap className="text-white w-6 h-6" />
                </div>
                <div className="space-y-8 flex-1">
                    <Link href={route('dashboard')} className="p-3 rounded-xl text-zinc-500 hover:text-zinc-200 transition-colors block">
                        <Layout className="w-6 h-6" />
                    </Link>
                    <Link href={route('team-members.index')} className="p-3 rounded-xl bg-[#F93A8B]/10 text-[#F93A8B] border border-[#F93A8B]/20 shadow-inner shadow-[#F93A8B]/10 block">
                        <User className="w-6 h-6" />
                    </Link>
                </div>
                
                <button 
                    onClick={() => router.post(route('logout'))}
                    className="p-3 rounded-xl text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all mb-4"
                >
                    <LogOut className="w-6 h-6" />
                </button>
            </div>

            <main className="pl-20 min-h-screen flex flex-col p-12 max-w-7xl mx-auto">
                <header className="mb-12 flex items-center gap-6">
                    <Link href={route('team-members.index')} className="p-3 rounded-xl border border-[#261E2E] text-zinc-400 hover:text-white hover:bg-[#261E2E] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                            {teamMember.name}'s <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F93A8B] to-[#c033d6]">Profile</span>
                        </h1>
                        <p className="text-zinc-400 text-lg">Workload, skills, and recent Coder71 activity feed.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="col-span-1">
                        <div className="glass rounded-2xl p-8 border border-[#261E2E] sticky top-8">
                            <div className="flex flex-col items-center">
                                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#261E2E] to-[#15121a] border-4 border-[#1a1523] flex items-center justify-center text-[#F93A8B] font-bold text-4xl mb-6 shadow-2xl">
                                    {teamMember.name.charAt(0)}
                                </div>
                                <h3 className="text-2xl font-bold text-white text-center leading-tight">{teamMember.name}</h3>
                                <p className="text-sm text-zinc-500 mt-2">{teamMember.role}</p>
                                
                                <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400 bg-[#1a1523] px-4 py-2 rounded-lg w-full justify-center">
                                    <Clock className="w-4 h-4 text-[#F3B323]" />
                                    <span className="font-mono text-zinc-300">{teamMember.availability_hours}</span> hours / week
                                </div>
                                
                                <div className="mt-4 w-full flex justify-center">
                                    {teamMember.is_active ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-full justify-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Active & Available
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs uppercase font-bold tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 w-full justify-center">
                                            Currently Inactive
                                        </span>
                                    )}
                                </div>
                            </div>

                            <hr className="my-8 border-[#261E2E]" />

                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#c033d6]" />
                                    Technical Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {teamMember.skills && teamMember.skills.length > 0 ? (
                                        teamMember.skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1.5 rounded-lg bg-[#261E2E] border border-white/5 text-xs font-mono text-zinc-300 hover:border-[#F93A8B]/50 transition-colors">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-zinc-600 italic border border-dashed border-[#261E2E] rounded-lg p-4 w-full text-center">No skills defined yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity Feed */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="glass rounded-2xl border border-[#261E2E] overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-[#261E2E] bg-[#1a1523]/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-[#F93A8B]" />
                                        Activity Timeline
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1">Live updates from Coder71</p>
                                </div>
                            </div>
                            
                            <div className="p-8 flex-1">
                                {teamMember.activities && teamMember.activities.length > 0 ? (
                                    <div className="relative">
                                        {/* Vertical line connecting timeline dots */}
                                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#261E2E]"></div>
                                        
                                        <ul className="space-y-8 relative">
                                            {teamMember.activities.map((activity, idx) => (
                                                <li key={activity.id} className="relative pl-12 animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                                    {/* Timeline Dot */}
                                                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[#15121a] border-2 border-[#F93A8B] flex items-center justify-center z-10">
                                                        <Briefcase className="h-3 w-3 text-[#F93A8B]" />
                                                    </div>
                                                    
                                                    <div className="bg-[#1a1523]/50 rounded-xl p-5 border border-[#261E2E] hover:border-[#F93A8B]/30 transition-colors group">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <p className="text-sm text-zinc-400">
                                                                <span className="font-bold text-white uppercase tracking-wider text-xs">{activity.action}</span>{' '}
                                                                a <span className="text-zinc-300">{activity.log_type?.replace('_', ' ')}</span> in{' '}
                                                                <span className="text-[#c033d6] font-bold">{activity.project_title}</span>
                                                            </p>
                                                            <time className="text-xs font-mono text-zinc-600 bg-[#15121a] px-2 py-1 rounded">
                                                                {new Date(activity.created_at).toLocaleDateString()}
                                                            </time>
                                                        </div>
                                                        
                                                        {activity.log_type_title && (
                                                            <div className="mt-3 text-sm text-zinc-300 bg-[#15121a] p-4 rounded-lg whitespace-pre-wrap border border-white/5 font-mono leading-relaxed max-h-64 overflow-y-auto">
                                                                {activity.log_type_title}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-50">
                                        <Activity className="h-16 w-16 text-zinc-700 mb-4" />
                                        <p className="text-zinc-500 font-medium">No recent activity detected.</p>
                                        <p className="text-xs text-zinc-600 mt-2 max-w-xs">Sync with Coder71 to fetch the latest engagement logs for this member.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
