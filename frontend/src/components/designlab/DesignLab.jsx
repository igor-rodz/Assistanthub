import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DesignLabPromptInput from './DesignLabPromptInput';
import DesignLabGenerating from './DesignLabGenerating';
import DesignLabWorkspace from './DesignLabWorkspace';

// API Config is handled in lib/api.js

/**
 * DesignLab - Main container with state machine
 * States: idle -> generating -> preview
 */
const DesignLab = () => {
    const navigate = useNavigate();
    const [state, setState] = useState('idle'); // idle, generating, preview, error
    const [prompt, setPrompt] = useState('');
    const [designType, setDesignType] = useState('component');
    const [fidelity, setFidelity] = useState('high');
    const [currentJob, setCurrentJob] = useState(null);
    const [error, setError] = useState(null);
    const [generatingMessages, setGeneratingMessages] = useState([]);

    const handleSubmit = async (submittedPrompt, type, fid) => {
        setPrompt(submittedPrompt);
        setDesignType(type || designType);
        setFidelity(fid || fidelity);
        setState('generating');
        setError(null);

        const messages = [
            'Conectando ao cérebro de design...',
            'Analisando requisitos complexos...',
            'Desenhando estrutura visual...',
            'Escrevendo código HTML/CSS...',
            'Polindo detalhes finais...',
        ];

        let messageIndex = 0;
        setGeneratingMessages([messages[0]]);
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setGeneratingMessages(prev => {
                // Keep only last few distinct messages to avoid clutter
                const newMsgs = [...prev, messages[messageIndex]];
                if (newMsgs.length > 3) newMsgs.shift();
                return newMsgs;
            });
        }, 3000);

        try {
            console.log('[DesignLab] Iniciando Stream:', submittedPrompt);

            // Use native fetch for streaming explicitly
            const token = localStorage.getItem('supabase.auth.token')
                ? JSON.parse(localStorage.getItem('supabase.auth.token')).currentSession?.access_token
                : null;

            // Fallback for getting token if using cookie auth or other method in lib/api
            // Ideally we should export getToken from lib/api, but let's try direct access
            let authHeader = {};
            if (token) {
                authHeader = { 'Authorization': `Bearer ${token}` };
            } else {
                // Try to match how api interceptor works or just hope for cookie auth if standard
                // For now assuming token in localStorage as standard Supabase
            }

            const response = await fetch('/api/design-lab/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({
                    prompt: submittedPrompt,
                    design_type: type || designType,
                    fidelity: fid || fidelity
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || `Erro HTTP ${response.status}`);
            }

            // Stream Reader
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;

                // Optional: Update UI with code length or "thinking" effect
                // setGeneratingMessages(prev => [...prev.slice(0, -1), `Gerando código... (${accumulatedText.length} bytes)`]);
            }

            clearInterval(messageInterval);

            // Parse final JSON
            const cleanJson = accumulatedText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonStart = cleanJson.indexOf('{');
            const jsonEnd = cleanJson.lastIndexOf('}');

            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error("Formato de resposta inválido (JSON não encontrado)");
            }

            const designData = JSON.parse(cleanJson.substring(jsonStart, jsonEnd + 1));

            console.log('[DesignLab] Stream completo:', designData);
            setCurrentJob(designData);
            setState('preview');

        } catch (err) {
            clearInterval(messageInterval);
            console.error('Design creation error:', err);
            setError(err.message || 'Erro desconhecido na geração.');
            setState('error');
        }
    };

    const handleRefine = async (refinement) => {
        if (!currentJob?.job_id) return;

        setState('generating');
        setGeneratingMessages(['Aplicando refinamentos...']);

        try {
            const response = await api.post(
                `/design-lab/refine?job_id=${currentJob.job_id}&refinement=${encodeURIComponent(refinement)}`
            );
            setCurrentJob(response.data);
            setState('preview');
        } catch (err) {
            console.error('Refine error:', err);
            setError(err.response?.data?.detail || 'Erro ao refinar design');
            setState('error');
        }
    };

    const handleBack = () => {
        if (state === 'preview' || state === 'error') {
            setState('idle');
            setCurrentJob(null);
            setError(null);
        } else {
            navigate('/dashboard');
        }
    };

    const handleCancel = () => {
        setState('idle');
        setGeneratingMessages([]);
    };

    return (
        <div className="min-h-screen text-white relative">
            {/* Subtle Floating Back Button */}
            <button
                onClick={handleBack}
                className="absolute top-6 left-6 z-50 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all text-white/40 hover:text-white border border-white/5 shadow-lg group"
                title="Voltar"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Content based on state */}
            <div className="h-screen w-full">
                {state === 'idle' && (
                    <DesignLabPromptInput
                        onSubmit={handleSubmit}
                        initialPrompt={prompt}
                    />
                )}

                {state === 'generating' && (
                    <DesignLabGenerating
                        messages={generatingMessages}
                        onCancel={handleCancel}
                    />
                )}

                {state === 'preview' && currentJob && (
                    <DesignLabWorkspace
                        job={currentJob}
                        prompt={prompt}
                        onRefine={handleRefine}
                        onNewDesign={() => setState('idle')}
                    />
                )}

                {state === 'error' && (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                        <div className="text-red-400 text-lg">{error}</div>
                        <button
                            onClick={() => setState('idle')}
                            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignLab;
