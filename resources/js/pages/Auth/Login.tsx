import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Zap, Lock, Mail, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const { isDark, toggleTheme } = useTheme();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
            <Head title="Sign In" />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="theme-toggle fixed top-5 right-5 z-50"
                title="Toggle theme"
            >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Subtle background grid */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    opacity: 0.5,
                    maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 100%)',
                }}
            />

            {/* Pink glow accents */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full blur-[120px]" style={{ background: 'hsl(var(--primary)/0.06)' }} />
                <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px]" style={{ background: 'hsl(var(--primary)/0.04)' }} />
            </div>

            <div className="w-full max-w-sm relative animate-fade-in z-10">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-lg"
                        style={{ background: 'hsl(var(--primary))' }}
                    >
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
                        Welcome to <span className="text-primary">ArchiteX</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your architect workspace
                    </p>
                </div>

                {/* Card */}
                <div className="card p-6 space-y-5">

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email field */}
                        <div className="space-y-1.5">
                            <label className="label flex items-center gap-1.5" htmlFor="email">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                className="input h-10"
                                required
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="label flex items-center gap-1.5" htmlFor="password">
                                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                    Password
                                </label>
                                <a href="#" className="text-xs font-medium text-primary hover:underline underline-offset-2">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="input h-10"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div
                                    onClick={() => setData('remember', !data.remember)}
                                    className="w-4 h-4 border border-input rounded cursor-pointer flex items-center justify-center transition-all"
                                    style={{
                                        background: data.remember ? 'hsl(var(--primary))' : 'transparent',
                                        borderColor: data.remember ? 'hsl(var(--primary))' : undefined,
                                    }}
                                >
                                    {data.remember && (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <label
                                htmlFor="remember"
                                className="text-sm text-muted-foreground cursor-pointer select-none"
                                onClick={() => setData('remember', !data.remember)}
                            >
                                Remember me
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn btn-primary w-full h-10"
                        >
                            {processing ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="separator" />
                        <span
                            className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-muted-foreground bg-card px-2 w-fit mx-auto block"
                        >
                            Secure Authentication
                        </span>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        Authorized access only. All sessions are encrypted.
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    © 2025 ArchiteX — Intelligent Architectural Engine
                </p>
            </div>
        </div>
    );
}
