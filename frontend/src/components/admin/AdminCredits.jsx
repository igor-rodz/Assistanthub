import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import { AdminTable } from './shared';

const AdminCredits = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('skip', (currentPage - 1) * 20);
            params.append('limit', '20');

            const response = await api.get(`/admin/credits/transactions?${params}`);
            setTransactions(response.data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'timestamp', label: 'Data', render: (row) => (
                <span className="text-white/70 text-sm">{new Date(row.timestamp).toLocaleString()}</span>
            )
        },
        {
            key: 'user_name', label: 'Usuário', render: (row) => (
                <span className="font-medium text-white">{row.user_name}</span>
            )
        },
        {
            key: 'type', label: 'Tipo', render: (row) => (
                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${row.type === 'consumed' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                    {row.type === 'consumed' ? 'Consumo' : 'Adição'}
                </span>
            )
        },
        { key: 'tool_used', label: 'Ferramenta/Origem', sortable: true },
        {
            key: 'amount', label: 'Valor', render: (row) => (
                <span className={`font-bold ${row.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {row.amount > 0 ? '+' : ''}{Number(row.amount).toFixed(2)}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Histórico de Créditos</h2>
                    <p className="text-white/50 text-sm mt-1">Registro de todas as transações</p>
                </div>
            </div>

            <AdminTable
                columns={columns}
                data={transactions}
                currentPage={currentPage}
                totalPages={10} // Mocked for now
                onPageChange={setCurrentPage}
                loading={loading}
            />
        </div>
    );
};

export default AdminCredits;
