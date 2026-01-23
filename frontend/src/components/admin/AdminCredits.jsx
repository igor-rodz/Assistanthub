import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { AdminTable, StatsCard } from './shared';

// API Config is handled in lib/api.js

const AdminCredits = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transactionsRes, statsRes] = await Promise.all([
                api.get(`/admin/credits/transactions?skip=${(currentPage - 1) * 50}&limit=50`),
                api.get('/admin/dashboard/stats')
            ]);
            setTransactions(transactionsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'timestamp', label: 'Data/Hora', render: (row) => (
                <span className="text-xs">{new Date(row.timestamp).toLocaleString('pt-BR')}</span>
            )
        },
        { key: 'user_name', label: 'Usuário', sortable: true },
        {
            key: 'type', label: 'Tipo', render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.type === 'consumed' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                    {row.type === 'consumed' ? 'Consumido' : 'Adicionado'}
                </span>
            )
        },
        {
            key: 'tool_used', label: 'Ferramenta', render: (row) => (
                <span className="text-xs">{row.tool_used || '-'}</span>
            )
        },
        {
            key: 'amount', label: 'Valor', render: (row) => (
                <span className={`font-bold ${row.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {row.amount > 0 ? '+' : ''}{row.amount.toFixed(2)}
                </span>
            )
        },
        {
            key: 'balance_after', label: 'Saldo Final', render: (row) => (
                <span className="text-white/70">{row.balance_after.toFixed(2)}</span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Gerenciamento de Créditos</h2>
                <p className="text-white/50 text-sm mt-1">Visão geral e transações</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total Distribuído"
                        value={stats.total_credits_distributed.toLocaleString()}
                        icon={Coins}
                        color="green"
                        subtitle="Créditos totais no sistema"
                    />
                    <StatsCard
                        title="Total Consumido"
                        value={stats.total_credits_consumed.toFixed(0)}
                        icon={TrendingDown}
                        color="orange"
                        subtitle="Utilizados pelos usuários"
                    />
                    <StatsCard
                        title="Taxa de Uso"
                        value={`${((stats.total_credits_consumed / stats.total_credits_distributed) * 100).toFixed(1)}%`}
                        icon={TrendingUp}
                        color="blue"
                        subtitle="Consumo total"
                    />
                </div>
            )}

            {/* Transactions Table */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Histórico de Transações</h3>
                <AdminTable
                    columns={columns}
                    data={transactions}
                    currentPage={currentPage}
                    totalPages={Math.ceil(transactions.length / 50)}
                    onPageChange={setCurrentPage}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default AdminCredits;
