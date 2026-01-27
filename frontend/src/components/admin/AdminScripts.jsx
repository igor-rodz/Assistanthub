import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, Edit, Trash, Copy, Check, X } from 'lucide-react';
import { AdminTable } from './shared';

const AdminScripts = () => {
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScript, setEditingScript] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Geral',
        script_content: '',
        is_active: true
    });

    useEffect(() => {
        fetchScripts();
    }, []);

    const fetchScripts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/scripts');
            setScripts(response.data || []);
        } catch (error) {
            console.error('Error fetching scripts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique categories
    const existingCategories = [...new Set(scripts.map(s => s.category).filter(Boolean))];

    const handleSave = async () => {
        try {
            if (editingScript) {
                await api.put('/admin/scripts', { ...formData, id: editingScript.id });
            } else {
                await api.post('/admin/scripts', formData);
            }
            fetchScripts();
            setIsModalOpen(false);
            setEditingScript(null);
            setFormData({ title: '', description: '', category: 'Geral', script_content: '', is_active: true });
        } catch (error) {
            console.error('Error saving script:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Erro desconhecido';
            alert(`Erro ao salvar: ${msg}\n\nVerifique se você rodou o script SQL no Supabase.`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este script?')) return;
        try {
            await api.delete(`/admin/scripts?id=${id}`);
            fetchScripts();
        } catch (error) {
            console.error('Error deleting script:', error);
        }
    };

    const columns = [
        { key: 'title', label: 'Título', sortable: true },
        { key: 'category', label: 'Categoria', sortable: true },
        {
            key: 'is_active',
            label: 'Status',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {row.is_active ? 'Ativo' : 'Inativo'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setEditingScript(row);
                            setFormData({
                                title: row.title,
                                description: row.description || '',
                                category: row.category || 'Geral',
                                script_content: row.script_content,
                                is_active: row.is_active
                            });
                            setIsModalOpen(true);
                        }}
                        className="p-1 hover:bg-white/10 rounded text-blue-400"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1 hover:bg-white/10 rounded text-red-400"
                    >
                        <Trash size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Scripts Premium</h2>
                    <p className="text-white/50 text-sm mt-1">Gerencie os scripts disponíveis para os usuários</p>
                </div>
                <button
                    onClick={() => {
                        setEditingScript(null);
                        setFormData({ title: '', description: '', category: 'Geral', script_content: '', is_active: true });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all"
                >
                    <Plus size={18} />
                    Novo Script
                </button>
            </div>

            <AdminTable
                columns={columns}
                data={scripts}
                loading={loading}
                // Pagination mocked for now as we might not have many scripts yet
                currentPage={1}
                totalPages={1}
                onPageChange={() => { }}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1a1c] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {editingScript ? 'Editar Script' : 'Novo Script Premium'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/70 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500/50 outline-none"
                                        placeholder="Ex: Script de Vendas Imobiliárias"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/70 mb-1">Categoria</label>
                                    <input
                                        type="text"
                                        list="category-options"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500/50 outline-none"
                                        placeholder="Selecione ou digite uma nova..."
                                    />
                                    <datalist id="category-options">
                                        {existingCategories.map((cat, idx) => (
                                            <option key={idx} value={cat} />
                                        ))}
                                        {existingCategories.length === 0 && <option value="Geral" />}
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-white/70 mb-1">Descrição Curta</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500/50 outline-none"
                                    placeholder="Breve descrição do que o script faz"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white/70 mb-1">Conteúdo do Script (Markdown/Texto)</label>
                                <textarea
                                    value={formData.script_content}
                                    onChange={e => setFormData({ ...formData, script_content: e.target.value })}
                                    className="w-full h-64 bg-black/20 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:border-orange-500/50 outline-none resize-none"
                                    placeholder="Cole o script aqui..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="is_active" className="text-white/70">Ativo (visível para usuários)</label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justifying-end gap-3 bg-[#151517]">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-white/70 hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.title || !formData.script_content}
                                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingScript ? 'Salvar Alterações' : 'Criar Script'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScripts;
