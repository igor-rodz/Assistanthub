import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Search, Edit, Trash2, Plus, Eye, X, Check, DollarSign } from 'lucide-react';
import { AdminTable } from './shared';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'view', 'credits', 'delete'
    const [creditAmount, setCreditAmount] = useState(0);
    const [creditAction, setCreditAction] = useState('add'); // 'add' or 'remove'
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [planFilter, currentPage, searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (planFilter) params.append('plan_filter', planFilter);
            if (searchQuery) params.append('search', searchQuery);
            params.append('skip', (currentPage - 1) * 20);
            params.append('limit', '20');

            const response = await api.get(`/admin/users?${params}`);
            // Backend currently returns array. Ideally should return { data, count }.
            // Assuming array for now, pagination logic might be slightly off without total count.
            // We will assume "if length < 20, end of list".
            setUsers(response.data || []);
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
    };

    // Check if we need to sort client-side (since backend default sort is created_at)
    // For now we will rely on client sorting of the *current page* or implement backend sort.
    // Given the task scope, client sorting of the fetched page is acceptable for MVP, 
    // but implies "sort only visible". 
    // Ideally backend should handle it. 
    // I'll keep the client side sort of the current page for responsiveness.
    const sortedUsers = [...users].sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Actions
    const openCreditsModal = (user) => {
        setSelectedUser(user);
        setModalMode('credits');
        setCreditAmount(100);
        setCreditAction('add');
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setModalMode('delete');
    };

    const confirmCredits = async () => {
        if (!selectedUser) return;
        setProcessing(true);
        try {
            const action = creditAction === 'add' ? 'add_credits' : 'remove_credits';
            await api.post('/admin/users', {
                action,
                userId: selectedUser.id,
                amount: creditAmount
            });
            setModalMode(null);
            fetchUsers(); // Refresh
        } catch (err) {
            console.error(err);
            alert('Error updating credits');
        } finally {
            setProcessing(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        setProcessing(true);
        try {
            await api.delete(`/admin/users?id=${selectedUser.id}`);
            setModalMode(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Error deleting user');
        } finally {
            setProcessing(false);
        }
    }

    const columns = [
        { key: 'name', label: 'Nome', sortable: true, render: (row) => <span className="font-medium text-white">{row.name || 'Sem nome'}</span> },
        { key: 'email', label: 'Email', sortable: true },
        {
            key: 'plan', label: 'Plano', sortable: true, render: (row) => (
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${row.plan === 'pro' ? 'bg-orange-500/20 text-orange-400' :
                        row.plan === 'builder' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                    }`}>
                    {row.plan || 'Free'}
                </span>
            )
        },
        {
            key: 'credit_balance', label: 'Créditos', sortable: true, render: (row) => (
                <span className={`font-bold ${row.credit_balance < 10 ? 'text-red-400' : 'text-green-400'}`}>
                    {(row.credit_balance || 0).toFixed(1)}
                </span>
            )
        },
        {
            key: 'actions', label: 'Ações', render: (row) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => openCreditsModal(row)} className="p-2 hover:bg-green-500/10 hover:text-green-400 rounded-lg transition-colors" title="Gerenciar Créditos">
                        <DollarSign size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(row)} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors" title="Deletar">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h2>
                    <p className="text-white/50 text-sm mt-1">Gerencie acessos e créditos</p>
                </div>
            </div>

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

            <AdminTable
                columns={columns}
                data={sortedUsers}
                onSort={handleSort}
                sortKey={sortKey}
                sortOrder={sortOrder}
                currentPage={currentPage}
                totalPages={10} // Placeholder, ideally fetch count
                onPageChange={setCurrentPage}
                loading={loading}
            />

            {/* Modals */}
            {modalMode && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">
                                {modalMode === 'delete' ? 'Confirmar Exclusão' : 'Gerenciar Créditos'}
                            </h3>
                            <button onClick={() => setModalMode(null)} className="text-white/50 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-white/70 mb-2">Usuário: <span className="text-white font-medium">{selectedUser.name}</span></p>
                            <p className="text-white/50 text-sm">{selectedUser.email}</p>
                        </div>

                        {modalMode === 'credits' && (
                            <div className="space-y-4">
                                <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                                    <button
                                        onClick={() => setCreditAction('add')}
                                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${creditAction === 'add' ? 'bg-green-500/20 text-green-400' : 'text-white/50 hover:text-white'}`}
                                    >Adicionar</button>
                                    <button
                                        onClick={() => setCreditAction('remove')}
                                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${creditAction === 'remove' ? 'bg-red-500/20 text-red-400' : 'text-white/50 hover:text-white'}`}
                                    >Remover</button>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Quantidade</label>
                                    <input
                                        type="number"
                                        value={creditAmount}
                                        onChange={(e) => setCreditAmount(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                                    />
                                </div>
                            </div>
                        )}

                        {modalMode === 'delete' && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
                                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setModalMode(null)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                            >Usually Cancelar</button>
                            <button
                                onClick={modalMode === 'delete' ? confirmDelete : confirmCredits}
                                disabled={processing}
                                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${modalMode === 'delete'
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                                    }`}
                            >
                                {processing ? 'Processando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
