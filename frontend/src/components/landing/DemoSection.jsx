import React from 'react';
import { Play, Terminal, X, Minus, Square } from 'lucide-react';

const DemoSection = () => {
    return (
        <section className="relative py-24 px-6 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                        Veja em Ação
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        De erro para solução em{' '}
                        <span className="text-emerald-400">segundos</span>
                    </h2>
                </div>

                {/* Mock terminal */}
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950">
                        {/* Terminal header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                <Terminal className="w-4 h-4" />
                                <span>one-shot-fixes</span>
                            </div>
                            <div className="w-20" />
                        </div>

                        {/* Terminal content */}
                        <div className="p-6 font-mono text-sm">
                            {/* Error input */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                    <span className="text-red-400">▶</span>
                                    <span>Seu erro:</span>
                                </div>
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                                    <code>TypeError: Cannot read properties of undefined (reading 'map')</code>
                                    <br />
                                    <code className="text-red-400/60">at UserList.jsx:15:24</code>
                                </div>
                            </div>

                            {/* AI thinking */}
                            <div className="flex items-center gap-2 text-zinc-400 mb-6">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Analisando...</span>
                            </div>

                            {/* Solution output */}
                            <div>
                                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                    <span className="text-emerald-400">✓</span>
                                    <span>Solução:</span>
                                </div>
                                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-emerald-300 mb-3">
                                        O array <code className="px-1 py-0.5 rounded bg-emerald-500/20">users</code> está undefined. Adicione uma verificação:
                                    </p>
                                    <div className="p-3 rounded bg-black/40 text-zinc-300">
                                        <code className="text-emerald-400">{'{'}</code>
                                        <code className="text-cyan-400">users</code>
                                        <code className="text-zinc-500">?.</code>
                                        <code className="text-yellow-400">map</code>
                                        <code className="text-zinc-300">{'((user) => <UserCard key={user.id} {...user} />)'}</code>
                                        <code className="text-emerald-400">{'}'}</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats below demo */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                    <StatItem value="< 5s" label="Tempo médio de resposta" />
                    <StatItem value="95%" label="Taxa de acerto" />
                    <StatItem value="50+" label="Linguagens suportadas" />
                </div>
            </div>
        </section>
    );
};

const StatItem = ({ value, label }) => (
    <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-zinc-500">{label}</div>
    </div>
);

export default DemoSection;
