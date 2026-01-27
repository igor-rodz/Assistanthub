import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DesignLabPromptInput from './DesignLabPromptInput';
import DesignLabWorkspace from './DesignLabWorkspace';

/**
 * DesignLab - Agent-Powered Design System
 * Features real-time thought streaming and autonomous execution.
 */
const DesignLab = () => {
    const navigate = useNavigate();
    const [state, setState] = useState('idle');
    const [prompt, setPrompt] = useState('');
    const [designType, setDesignType] = useState('component');
    const [fidelity, setFidelity] = useState('high');
    const [currentJob, setCurrentJob] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (submittedPrompt, type, fid) => {
        setPrompt(submittedPrompt);
        setDesignType(type || designType);
        setFidelity(fid || fidelity);

        // 1. Initialize Agent State
        const tempJobId = 'job-' + Date.now();
        setCurrentJob({
            job_id: tempJobId,
            status: 'generating',
            html: '',
            css: '',
            explanation: '',
            logs: ['Conectando ao agente de design...']
        });
        setState('preview');
        setError(null);

        // 2. Start Agent Stream
        try {
            console.log('[DesignLab] Ativando Agente:', submittedPrompt);

            // Auth Token
            let token = null;
            // Robust token finding logic
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    try {
                        token = JSON.parse(localStorage.getItem(key))?.access_token;
                        if (token) break;
                    } catch (e) { }
                }
            }
            if (!token) try { token = JSON.parse(localStorage.getItem('supabase.auth.token'))?.currentSession?.access_token; } catch (e) { }

            if (!token) throw new Error("Autenticação necessária.");

            // Request
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

            if (!response.ok) throw new Error(`Erro na conexão com agente (${response.status})`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';
            let codeBuffer = '';
            let isInsideCode = false;
            let capturedLogs = [];

            // 3. Process the "Agent Stream Protocol"
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // --- PARSER LOGIC ---
                // We parse line by line to extract events
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep partial line

                let stateHasChanged = false;

                for (const line of lines) {
                    // Ignora linhas vazias
                    if (!line.trim()) continue;

                    if (line.includes(':::PLAN:::')) {
                        capturedLogs.push('🧠 Analisando requisitos e planejando arquitetura...');
                        stateHasChanged = true;
                    }
                    else if (line.includes(':::DESIGN:::')) {
                        capturedLogs.push('🎨 Definindo sistema de design (Cores, Tipografia, Tokens)...');
                        stateHasChanged = true;
                    }
                    else if (line.includes(':::CODE_START:::')) {
                        isInsideCode = true;
                        capturedLogs.push('👨‍💻 Escrevendo código e aplicando estilos...');
                        stateHasChanged = true;
                    }
                    else if (line.includes(':::CODE_END:::')) {
                        isInsideCode = false;
                        capturedLogs.push('✨ Código gerado. Finalizando...');
                        stateHasChanged = true;
                    }
                    else if (line.includes(':::REVIEW:::')) {
                        capturedLogs.push('🕵️ Auto-revisão: Verificando acessibilidade e responsividade...');
                        stateHasChanged = true;
                    }
                    else if (line.includes(':::DONE:::')) {
                        capturedLogs.push('✅ Finalizado!');
                        stateHasChanged = true;
                    }
                    else if (line.includes(':::ERROR:::')) {
                        const errMsg = line.split(':::ERROR:::')[1].trim();
                        throw new Error(errMsg);
                    }
                    else if (isInsideCode) {
                        // É código real
                        codeBuffer += line + '\n';
                        stateHasChanged = true;
                    }
                    // Se a linha não for um comando, pode ser "Reasoning Text" do modelo.
                    // Opcional: mostrar o pensamento cru no console ou numa aba de debug.
                    // else if (!isInsideCode && line.length > 5) {
                    //    console.log('[Agent Thought]', line); 
                    // }
                }

                if (stateHasChanged) {
                    setCurrentJob(prev => ({
                        ...prev,
                        logs: [...capturedLogs], // Substitui todos para manter sincronia simples ou append se preferir
                        html: codeBuffer
                    }));
                }
            }

            // Finalize
            console.log('[DesignLab] Agente finalizou.');
            setCurrentJob(prev => ({
                ...prev,
                status: 'complete',
                logs: [...capturedLogs, '🚀 Pronto para visualização!']
            }));

        } catch (err) {
            console.error('Agent Failure:', err);
            setError(err.message);
            // Show error in logs too
            setCurrentJob(prev => ({
                ...prev,
                logs: [...(prev?.logs || []), `❌ Erro: ${err.message}`],
                status: 'error',
                errorMessage: err.message
            }));
        }
    };

    const handleRefine = async (refinement) => {
        if (!currentJob?.job_id) return;
        // Refinement would need similar stream logic updates
        // For now, we will handle it simply or TODO: Implement stream for refine too
        alert("Refinamento via agente completo será implementado no próximo passo. Use 'Novo Design' por enquanto.");
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

                {(state === 'preview' || state === 'error') && currentJob && (
                    <DesignLabWorkspace
                        job={currentJob}
                        prompt={prompt}
                        onRefine={handleRefine}
                        onNewDesign={() => setState('idle')}
                    />
                )}

                {/* Only show full error screen if we have no job context */}
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
