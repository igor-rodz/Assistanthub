import React, { useState, useEffect, useRef } from 'react';
import { Camera, Zap, Clock, Award, Save, Loader2, Check } from 'lucide-react';
import api from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

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

            // Upload the file to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar: publicUrl }));
            // Save automatically or Wait for user to save? 
            // Better to let user click "Save Changes" to confirm.
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-2 border-purple-500/30 p-1">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-900/40 to-blue-900/40 flex items-center justify-center overflow-hidden relative">
                                <img src={formData.avatar || user?.avatar || "https://picsum.photos/seed/rodzigor/200"} alt="Avatar" className="w-full h-full object-cover opacity-80" />
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Loader2 className="text-white animate-spin" size={24} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 p-2 bg-zinc-800 rounded-full border border-white/10 hover:bg-zinc-700 transition-colors shadow-lg"
                        >
                            <Camera size={16} className="text-white/70" />
                        </button>
                    </div>

                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-bold mb-1 text-white">{formData.name || 'Usuário'}</h2>
                        <p className="text-white/40 font-medium">Membro desde {user?.member_since || 'Outubro 2023'}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard
                        icon={<Zap className="text-purple-400" size={24} />}
                        value={user?.total_analyses?.toString() || "0"}
                        label="Análises"
                        color="purple"
                    />
                    <StatCard
                        icon={<Clock className="text-purple-400" size={24} />}
                        value={user?.saved_prompts?.toString() || "0"}
                        label="Prompts Salvos"
                        color="purple"
                    />
                    <StatCard
                        icon={<Award className="text-blue-400" size={24} />}
                        value="0"
                        label="Tokens Usados"
                        color="blue"
                    />
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-white/40 text-sm font-medium ml-1">Nome Completo</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Seu nome"
                                className="w-full px-5 py-4 rounded-2xl glass-panel focus:ring-1 focus:ring-purple-500/50 transition-all text-white bg-white/5 border border-white/5"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-white/40 text-sm font-medium ml-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                className="w-full px-5 py-4 rounded-2xl glass-panel focus:ring-1 focus:ring-purple-500/50 transition-all text-white bg-white/5 border border-white/5"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-white/40 text-sm font-medium ml-1">Avatar URL</label>
                        <input
                            type="text"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full px-5 py-4 rounded-2xl glass-panel focus:ring-1 focus:ring-purple-500/50 transition-all text-white bg-white/5 border border-white/5"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`
                                flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all
                                ${success
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-white text-black hover:bg-neutral-200'
                                }
                            `}
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Salvando...
                                </>
                            ) : success ? (
                                <>
                                    <Check size={18} />
                                    Salvo!
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, value, label, color }) => {
    const borderColor = color === 'purple' ? 'border-purple-500/30' : 'border-blue-500/30';
    const shadowColor = color === 'purple' ? 'shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'shadow-[0_0_20px_rgba(59,130,246,0.15)]';

    return (
        <div className={`p-6 rounded-3xl border ${borderColor} glass-panel flex items-center gap-5 ${shadowColor} hover:scale-[1.02] transition-transform cursor-default`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5`}>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
                <div className="text-white/40 text-sm font-medium">{label}</div>
            </div>
        </div>
    );
};

export default ProfileView;
