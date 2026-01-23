import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Search, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { AdminTable } from './shared';

// API Config is handled in lib/api.js

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchUsers();
    }, [planFilter, currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (planFilter) params.append('plan_filter', planFilter);
            params.append('skip', (currentPage - 1) * 20);
            params.append('limit', '20');

            const response = await api.get(`/admin/users?${params}`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }

        const sorted = [...users].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
        setUsers(sorted);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            key: 'id', label: 'ID', sortable: true, render: (row) => (
                <span className="font-mono text-xs">{row.id.slice(0, 8)}</span>
            )
        },
        {
            key: 'name', label: 'Nome', sortable: true, render: (row) => (
                <span className="font-medium text-white">{row.name}</span>
            )
        },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'plan', label: 'Plano', sortable: true, render: (row) => (
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${row.plan === 'pro' ? 'bg-orange-500/20 text-orange-400' :
                    row.plan === 'builder' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                    }`}>
                    {row.plan}
                </span>
            )
        },
        {
            key: 'credit_balance', label: 'Créditos', sortable: true, render: (row) => (
                <span className={`font-bold ${row.credit_balance < 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {row.credit_balance.toFixed(1)}
                </span>
            )
        },
        { key: 'total_analyses', label: 'Análises', sortable: true },
        { key: 'total_designs', label: 'Designs', sortable: true },
        {
            key: 'actions', label: 'Ações', render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => console.log('View', row.id)}
                        className="p-2 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg transition-colors"
                        title="Ver detalhes"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => console.log('Edit', row.id)}
                        className="p-2 hover:bg-orange-500/10 hover:text-orange-400 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => console.log('Delete', row.id)}
                        className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                        title="Deletar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h2>
                    <p className="text-white/50 text-sm mt-1">{filteredUsers.length} usuários encontrados</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nome ou email..."
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 transition-all"
                        />
                    </div>
                </div>

                <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all"
                >
                    <option value="">Todos os planos</option>
                    <option value="starter">Starter</option>
                    <option value="builder">Builder</option>
                    <option value="pro">Pro</option>
                </select>
            </div>

            {/* Table */}
            <AdminTable
                columns={columns}
                data={filteredUsers}
                onSort={handleSort}
                sortKey={sortKey}
                sortOrder={sortOrder}
                currentPage={currentPage}
                totalPages={Math.ceil(filteredUsers.length / 20)}
                onPageChange={setCurrentPage}
                loading={loading}
            />
        </div>
    );
};

export default AdminUsers;
