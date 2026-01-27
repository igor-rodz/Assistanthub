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

        // Progressive messages
        const messages = [
            'Analisando requisitos...',
            'Criando estrutura de layout...',
            'Gerando componentes...',
            'Aplicando estilos premium...',
            'Finalizando design...'
        ];

        let messageIndex = 0;
        setGeneratingMessages([messages[0]]);

        const messageInterval = setInterval(() => {
            messageIndex++;
            if (messageIndex < messages.length) {
                setGeneratingMessages(prev => [...prev, messages[messageIndex]]);
            }
        }, 1500);

        try {
            console.log('[DesignLab] Enviando requisição para criar design...');
            console.log('[DesignLab] Prompt:', submittedPrompt);
            console.log('[DesignLab] Type:', type || designType, 'Fidelity:', fid || fidelity);

            const response = await api.post('/design-lab/create', {
                prompt: submittedPrompt,
                design_type: type || designType,
                fidelity: fid || fidelity
            });

            clearInterval(messageInterval);
            console.log('[DesignLab] Design criado com sucesso:', response.data);
            setCurrentJob(response.data);
            setState('preview');

        } catch (err) {
            clearInterval(messageInterval);
            console.error('Design creation error:', err);

            // Detailed error logging
            if (err.code === 'ECONNABORTED') {
                console.error('[DesignLab] Timeout: A requisição demorou mais de 60 segundos');
                setError('A geração de design está demorando muito. Por favor, tente novamente com um prompt mais simples.');
            } else if (err.response) {
                console.error('[DesignLab] Erro do servidor:', err.response.status, err.response.data);
                setError(err.response?.data?.detail || `Erro do servidor: ${err.response.status}`);
            } else if (err.request) {
                console.error('[DesignLab] Nenhuma resposta do servidor');
                setError('Não foi possível conectar ao servidor backend. Por favor, certifique-se de que rodou "npm start" na pasta raiz.');
            } else {
                console.error('[DesignLab] Erro desconhecido:', err.message);
                setError(`Erro inesperado: ${err.message}`);
            }

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
