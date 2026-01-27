import React, { useState, useEffect } from 'react';
import { Users, Coins, Activity, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { StatsCard } from './shared';
// import { AdminChart } from './AdminChart'; // If exists, or we use simple stats for now.
import api from '../../lib/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_credits_distributed: 0,
        total_credits_consumed: 0,
        total_scripts: 0,
        active_users: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Calculate trends or percentages if historical data available (mocked for now in UI presentation)
    const usageRate = stats.total_credits_distributed > 0
        ? ((stats.total_credits_consumed / stats.total_credits_distributed) * 100).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                    <p className="text-white/50 text-sm mt-1">Visão geral do sistema em tempo real</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Online
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total de Usuários"
                    value={stats.total_users || 0}
                    icon={Users}
                    color="blue"
                    trend="up"
                    trendValue={`+${stats.active_users} ativos`}
                    subtitle="Base de usuários"
                />

                <StatsCard
                    title="Créditos Distribuídos"
                    value={(stats.total_credits_distributed || 0).toFixed(0)}
                    icon={Coins}
                    color="orange"
                    trend="up"
                    trendValue="Total lifetime"
                    subtitle="Emitidos"
                />

                <StatsCard
                    title="Créditos Consumidos"
                    value={(stats.total_credits_consumed || 0).toFixed(0)}
                    icon={Zap}
                    color="purple"
                    trend="neutral"
                    trendValue={`${usageRate}% taxa`}
                    subtitle="Utilizados"
                />

                <StatsCard
                    title="Scripts Gerados"
                    value={stats.total_analyses || 0} // Using "analyses" as "scripts/usage" proxy
                    icon={Activity}
                    color="green"
                    trend="up"
                    trendValue="Total logs"
                    subtitle="Atividade"
                />
            </div>

            {/* Placeholder for future charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px] flex items-center justify-center text-white/30">
                    <p>Gráfico de Atividade de Usuários (Em breve)</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px] flex items-center justify-center text-white/30">
                    <p>Distribuição de Planos (Em breve)</p>
                    {/* We could use stats.users_by_plan here simply */}
                    {stats.users_by_plan && (
                        <div className="w-full pl-8">
                            <ul className="space-y-2">
                                {Object.entries(stats.users_by_plan).map(([plan, count]) => (
                                    <li key={plan} className="flex justify-between max-w-[200px]">
                                        <span className="capitalize">{plan || 'Free'}:</span>
                                        <span className="font-bold text-white">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
