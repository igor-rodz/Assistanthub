import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Filter, Download } from 'lucide-react';
import { AdminTable } from './shared';

// API Config is handled in lib/api.js

const AdminUsageLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toolFilter, setToolFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchLogs();
    }, [toolFilter, currentPage]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (toolFilter) params.append('tool_filter', toolFilter);
            params.append('skip', (currentPage - 1) * 50);
            params.append('limit', '50');

            const response = await api.get('/admin/usage-logs', { params });
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
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
        { key: 'user_name', label: 'Usuário' },
        {
            key: 'tool_used', label: 'Ferramenta', render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.tool_used === 'oneshot_fixes' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                    {row.tool_used === 'oneshot_fixes' ? 'OneShot' : 'Design Lab'}
                </span>
            )
        },
        {
            key: 'tokens_input', label: 'Tokens In', render: (row) => (
                <span className="text-xs text-white/60">{row.tokens_input.toLocaleString()}</span>
            )
        },
        {
            key: 'tokens_output', label: 'Tokens Out', render: (row) => (
                <span className="text-xs text-white/60">{row.tokens_output.toLocaleString()}</span>
            )
        },
        {
            key: 'total_tokens', label: 'Total', render: (row) => (
                <span className="font-medium">{row.total_tokens.toLocaleString()}</span>
            )
        },
        {
            key: 'credits_debited', label: 'Créditos', render: (row) => (
                <span className="text-orange-400 font-bold">{row.credits_debited.toFixed(2)}</span>
            )
        },
        {
            key: 'success', label: 'Status', render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {row.success ? '✓ OK' : '✗ Erro'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Logs de Uso</h2>
                    <p className="text-white/50 text-sm mt-1">{logs.length} registros</p>
                </div>

                <button
                    onClick={() => console.log('Export CSV')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl font-medium transition-all border border-orange-500/20"
                >
                    <Download size={18} />
                    Exportar CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <select
                    value={toolFilter}
                    onChange={(e) => setToolFilter(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all"
                >
                    <option value="">Todas as ferramentas</option>
                    <option value="oneshot_fixes">OneShot Fixes</option>
                    <option value="design_lab">Design Lab</option>
                </select>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={logs}
                currentPage={currentPage}
                totalPages={Math.ceil(logs.length / 50)}
                onPageChange={setCurrentPage}
                loading={loading}
            />
        </div>
    );
};

export default AdminUsageLogs;
