import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Users, RefreshCw, UserCheck, UserX, Clock, Edit, Layout, LogOut, Zap, User, Trash2 } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    skills: string[];
    availability_hours: number;
    is_active: boolean;
}

interface Props {
    teamMembers: TeamMember[];
}

export default function Index({ teamMembers }: Props) {
    const { post, processing } = useForm();
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [editForm, setEditForm] = useState({ skills: '', availability_hours: 8 });

    const handleSync = () => {
        post(route('team-members.sync'), {
            preserveScroll: true,
        });
    };

    const openEditModal = (member: TeamMember) => {
        setEditingMember(member);
        setEditForm({
            skills: member.skills ? member.skills.join(', ') : '',
            availability_hours: member.availability_hours,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;

        const skillsArray = editForm.skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '');

        router.put(route('team-members.update', editingMember.id), {
            skills: skillsArray,
            availability_hours: editForm.availability_hours,
        }, {
            onSuccess: () => setEditingMember(null),
        });
    };

    return (
        <div className="min-h-screen bg-[#0f0c13] text-white selection:bg-[#F93A8B]/30">
            <Head title="Team Management" />
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                h1, h2, h3, h4, h5, h6, .font-outfit { font-family: 'Outfit', sans-serif !important; }
                body { font-family: 'Space Grotesk', sans-serif; }
                .glass { background: rgba(21, 18, 26, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
                .btn-accent { background: linear-gradient(135deg, #F93A8B 0%, #c033d6 100%); color: white; display: flex; align-items: center; border-radius: 0.75rem; font-weight: bold; transition: all 0.3s; }
                .btn-accent:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 10px 20px -10px rgba(249, 58, 139, 0.5); }
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
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                            <Users className="w-8 h-8 text-[#F93A8B]" />
                            Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F93A8B] to-[#c033d6]">Resources</span>
                        </h1>
                        <p className="text-zinc-400 text-lg">Manage skills, track workload, and optimize project assignments.</p>
                    </div>
                    
                    <button
                        onClick={handleSync}
                        disabled={processing}
                        className="btn-accent px-6 h-[44px] text-sm uppercase tracking-wider"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                        {processing ? 'Syncing...' : 'Sync Coder71 Staff'}
                    </button>
                </header>

                <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-[#261E2E]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#261E2E] bg-[#1a1523]/50">
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Name</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Role</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-500 w-1/3">Skills</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Availability</th>
                                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-zinc-500">Status</th>
                                    <th className="p-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#261E2E]">
                                {teamMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-zinc-500 italic">
                                            No team members found. Click 'Sync Coder71 Staff' to import your team.
                                        </td>
                                    </tr>
                                ) : (
                                    teamMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-[#1a1523]/50 transition-colors group">
                                            <td className="p-5">
                                                <Link href={route('team-members.show', member.id)} className="font-bold text-lg text-white hover:text-[#F93A8B] transition-colors flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#261E2E] flex items-center justify-center text-xs text-[#F93A8B]">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    {member.name}
                                                </Link>
                                            </td>
                                            <td className="p-5 text-sm text-zinc-400">{member.role}</td>
                                            <td className="p-5">
                                                <div className="flex flex-wrap gap-2">
                                                    {member.skills && member.skills.length > 0 ? (
                                                        member.skills.map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-1 rounded bg-[#261E2E] border border-white/5 text-xs font-mono text-zinc-300">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-zinc-600 italic">No skills defined</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                    <Clock className="w-4 h-4 text-zinc-500" />
                                                    {member.availability_hours} <span className="text-xs">h/wk</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {member.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                                        Offline
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right space-x-2">
                                                <button 
                                                    onClick={() => openEditModal(member)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-[#F93A8B] hover:bg-[#F93A8B]/10 rounded-lg"
                                                    title="Edit Member"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this team member? This will also unassign them from any active tasks.')) {
                                                            router.delete(route('team-members.destroy', member.id), {
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                                    title="Delete Member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {editingMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass border border-[#261E2E] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-[#261E2E]">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Edit className="w-5 h-5 text-[#F93A8B]" />
                                Edit {editingMember.name}
                            </h3>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Skills (comma separated)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-[#1a1523] border-[#261E2E] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#F93A8B]/40 focus:border-[#F93A8B]/50 outline-none transition-all text-white placeholder:text-zinc-600 font-mono text-sm" 
                                    value={editForm.skills}
                                    onChange={e => setEditForm({...editForm, skills: e.target.value})}
                                    placeholder="React, Laravel, API..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Weekly Availability (hrs)</label>
                                <input 
                                    type="number" 
                                    min="0" max="168"
                                    className="w-full bg-[#1a1523] border-[#261E2E] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#F93A8B]/40 focus:border-[#F93A8B]/50 outline-none transition-all text-white font-mono text-sm" 
                                    value={editForm.availability_hours}
                                    onChange={e => setEditForm({...editForm, availability_hours: parseInt(e.target.value) || 0})}
                                />
                            </div>
                            
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setEditingMember(null)} className="px-5 py-2.5 rounded-xl border border-[#261E2E] text-zinc-400 hover:text-white hover:bg-[#261E2E] transition-all font-semibold text-sm">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-accent px-6 py-2.5 text-sm">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
