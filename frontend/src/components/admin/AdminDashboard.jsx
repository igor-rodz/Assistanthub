import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Users, Coins, TrendingUp, FileCode, Activity, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { StatsCard } from './shared';

// API Config is handled in lib/api.js

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    // Data for pie chart
    const planData = [
        { name: 'Starter', value: stats.users_by_plan.starter, color: '#3b82f6' },
        { name: 'Builder', value: stats.users_by_plan.builder, color: '#8b5cf6' },
        { name: 'Pro', value: stats.users_by_plan.pro, color: '#f59e0b' }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total de Usuários"
                    value={stats.total_users}
                    icon={Users}
                    color="orange"
                    trend="up"
                    trendValue="+12%"
                    subtitle={`${stats.active_users} ativos`}
                />
                <StatsCard
                    title="Créditos Distribuídos"
                    value={stats.total_credits_distributed.toLocaleString()}
                    icon={Coins}
                    color="green"
                    subtitle="Total no sistema"
                />
                <StatsCard
                    title="Créditos Consumidos"
                    value={stats.total_credits_consumed.toFixed(0)}
                    icon={TrendingUp}
                    color="blue"
                    trend="up"
                    trendValue="+8%"
                />
                <StatsCard
                    title="Scripts Disponíveis"
                    value={stats.total_scripts}
                    icon={FileCode}
                    color="purple"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users by Plan */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Usuários por Plano</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={planData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {planData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0d0d0f',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Activity Stats */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Atividade do Sistema</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Activity size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/50">OneShot Fixes</p>
                                    <p className="text-xl font-bold text-white">{stats.total_analyses}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <CheckCircle size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/50">Design Jobs</p>
                                    <p className="text-xl font-bold text-white">{stats.total_designs}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
