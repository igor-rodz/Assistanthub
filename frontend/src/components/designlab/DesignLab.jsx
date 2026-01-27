import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DesignLabPromptInput from './DesignLabPromptInput';
// DesignLabGenerating removed as we skip this screen now
import DesignLabWorkspace from './DesignLabWorkspace';

// API Config is handled in lib/api.js

/**
 * DesignLab - Main container with state machine
 * States: idle -> preview (generating is now part of preview state)
 */
const DesignLab = () => {
    const navigate = useNavigate();
    const [state, setState] = useState('idle'); // idle, preview, error
    const [prompt, setPrompt] = useState('');
    const [designType, setDesignType] = useState('component');
    const [fidelity, setFidelity] = useState('high');
    const [currentJob, setCurrentJob] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (submittedPrompt, type, fid) => {
        setPrompt(submittedPrompt);
        setDesignType(type || designType);
        setFidelity(fid || fidelity);

        // 1. Immediate Navigation to Workspace (Dynamic Feel)
        // We create a temporary job object to show the UI immediately
        const tempJobId = 'temp-' + Date.now();
        setCurrentJob({
            job_id: tempJobId,
            status: 'generating', // Important: Workspace detects this to show loaders/logs
            html: '',
            css: '',
            explanation: 'Iniciando agente de design...',
            logs: ['Conectando ao cérebro de design...']
        });
        setState('preview');
        setError(null);

        // 2. Start Streaming Process in Background
        try {
            console.log('[DesignLab] Iniciando Agente:', submittedPrompt);

            // Auth Token Retrieval (Robust)
            let token = null;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    try {
                        const sessionData = JSON.parse(localStorage.getItem(key));
                        token = sessionData?.access_token;
                        if (token) break;
                    } catch (e) { }
                }
            }
            if (!token) {
                try {
                    const legacy = JSON.parse(localStorage.getItem('supabase.auth.token'));
                    token = legacy?.currentSession?.access_token;
                } catch (e) { }
            }

            if (!token) {
                // If local dev without auth, maybe mock? No, enforce auth.
                throw new Error("Você precisa estar logado.");
            }

            // Initiate Stream
            const response = await fetch('/api/design-lab/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            // 3. Process Stream & Update UI Live
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;

                // Update Logs artificially based on content length to give Feedback
                // Real parsing of partial JSON is hard, so we simulate progress
                const progressLogs = ['Analisando requisitos...'];
                if (accumulatedText.length > 50) progressLogs.push('Gerando estrutura HTML...');
                if (accumulatedText.length > 500) progressLogs.push('Escrevendo componentes Tailwind...');
                if (accumulatedText.length > 2000) progressLogs.push('Refinando detalhes...');

                setCurrentJob(prev => ({
                    ...prev,
                    logs: progressLogs,
                    rawStreamLength: accumulatedText.length
                }));
            }

            // 4. Final Parse
            const cleanJson = accumulatedText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonStart = cleanJson.indexOf('{');
            const jsonEnd = cleanJson.lastIndexOf('}');

            if (jsonStart === -1 || jsonEnd === -1) throw new Error("Resposta inválida do agente (JSON incompleto).");

            const designData = JSON.parse(cleanJson.substring(jsonStart, jsonEnd + 1));

            // Update with final result
            console.log('[DesignLab] Finalizado:', designData);
            setCurrentJob({
                ...designData,
                status: 'complete',
                logs: ['Design finalizado com sucesso!']
            });

        } catch (err) {
            console.error('Agent error:', err);
            setError(err.message);
            // Don't switch state to 'error', show error in Workspace via job status
            setCurrentJob(prev => ({
                ...prev,
                status: 'error',
                errorMessage: err.message
            }));
        }
    };

    const handleRefine = async (refinement) => {
        if (!currentJob?.job_id) return;

        // Similar logic for refinement - immediate feedback
        setCurrentJob(prev => ({
            ...prev,
            status: 'generating',
            logs: ['Processando refinamento...']
        }));

        try {
            // Note: Refine endpoint should also be streamed ideally, 
            // but for now keeping axios for simplicity unless requested.
            const response = await api.post(
                `/design-lab/refine?job_id=${currentJob.job_id}&refinement=${encodeURIComponent(refinement)}`
            );
            setCurrentJob({
                ...response.data,
                status: 'complete'
            });
        } catch (err) {
            console.error('Refine error:', err);
            setCurrentJob(prev => ({
                ...prev,
                status: 'error',
                errorMessage: err.response?.data?.detail || 'Erro ao refinar'
            }));
        }
    };

    const handleBack = () => {
        if (state === 'preview') {
            setState('idle');
            setCurrentJob(null);
            setError(null);
        } else {
            navigate('/dashboard');
        }
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

                {/* We removed 'generating' state screen. Now we go straight to preview/workspace */}

                {(state === 'preview' || state === 'error') && currentJob && (
                    <DesignLabWorkspace
                        job={currentJob}
                        prompt={prompt}
                        onRefine={handleRefine}
                        onNewDesign={() => setState('idle')}
                    />
                )}

                {state === 'error' && !currentJob && (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                        <div className="text-red-400 text-lg text-center max-w-md">{error}</div>
                        <button onClick={() => setState('idle')} className="px-6 py-3 bg-white/10 rounded-xl">Voltar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesignLab;
