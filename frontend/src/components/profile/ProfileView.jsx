import React, { useState, useEffect, useRef } from 'react';
import { Camera, Zap, Clock, Award, Save, Loader2, Check, User, Mail, Link as LinkIcon } from 'lucide-react';
import api from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

const ProfileView = ({ user }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        avatar: ''
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (success) setSuccess(false);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id || 'guest'}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar: publicUrl }));
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Erro ao subir imagem. Verifique se o bucket "avatars" existe e é público.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch('/dashboard/user', formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Configurações de Perfil</h1>
                <p className="text-zinc-400">Gerencie suas informações pessoais e aparência pública.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Avatar & Quick Stats (30%) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Unique Profile Card */}
                    <div className="relative group">
                        <div className="relative w-40 h-40 mx-auto lg:mx-0 rounded-full border border-zinc-700/50 p-1 overflow-hidden">
                            <img
                                src={formData.avatar || user?.avatar || "https://picsum.photos/seed/rodzigor/200"}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full pointer-events-none">
                                <span className="text-xs font-medium text-white tracking-widest uppercase">Editar</span>
                            </div>
                        </div>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 lg:right-auto lg:left-28 lg:translate-x-0 p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl shadow-purple-500/20"
                            disabled={uploading}
                        >
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    {/* Stats Strip - Vertical minimalist */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Métricas</p>
                        <MinimalStat icon={<Zap size={14} />} label="Análises Totais" value={user?.total_analyses || "0"} />
                        <MinimalStat icon={<Clock size={14} />} label="Prompts Salvos" value={user?.saved_prompts || "0"} />
                        <MinimalStat icon={<Award size={14} />} label="Tokens Usados" value="0" />
                    </div>
                </div>

                {/* Right Column: Edit Form (70%) */}
                <div className="lg:col-span-8">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Nome de Exibição</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-purple-400 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                                            placeholder="Seu nome"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Email Principal</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-purple-400 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Avatar URL (Opcional)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-purple-400 transition-colors">
                                        <LinkIcon size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="avatar"
                                        value={formData.avatar}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium font-mono text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex items-center justify-between border-t border-white/5">
                                <p className="text-sm text-zinc-500">Membro desde {user?.member_since || 'Outubro 2023'}</p>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`
                                        relative overflow-hidden group px-8 py-3 rounded-xl font-semibold transition-all duration-300
                                        ${success
                                            ? 'bg-green-500 text-black'
                                            : 'bg-white text-black hover:bg-zinc-200'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2 relative z-10">
                                        {saving ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : success ? (
                                            <Check size={18} />
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        <span>{saving ? 'Salvando...' : success ? 'Salvo!' : 'Salvar Alterações'}</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MinimalStat = ({ icon, label, value }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
        <div className="flex items-center gap-3 text-zinc-400 group-hover:text-white transition-colors">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-white font-bold font-mono">{value}</span>
    </div>
);

export default ProfileView;
