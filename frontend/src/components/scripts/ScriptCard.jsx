import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Code2, FileCode, Sparkles, AlertCircle } from 'lucide-react';

/**
 * ScriptCard com Live Preview via Iframe + Babel Standalone
 */
const ScriptCard = ({ script, onView }) => {
    const iframeRef = useRef(null);

    // Função para limpar e preparar o código para o navegador
    const prepareCode = (rawCode) => {
        if (!rawCode) return '';

        // 1. Remove imports (o navegador não suporta module imports sem config complexa)
        let code = rawCode.replace(/import .* from .*;/g, '')
            .replace(/import .* from .*/g, '');

        // 2. Transforma 'export default function' em 'function' para podermos chamar
        code = code.replace(/export default function/g, 'function');
        code = code.replace(/export default const/g, 'const');

        // 3. Remove export default no final se houver
        code = code.replace(/export default \w+;/g, '');

        return code;
    };

    useEffect(() => {
        if (iframeRef.current && script.script_content) {
            const cleanedCode = prepareCode(script.script_content);
            const isReactComponent = cleanedCode.includes('return') || cleanedCode.includes('=>');

            // Se não parecer React, mostramos fallback de texto no render principal (via condicional fora do effect)
            if (!isReactComponent) return;

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
                    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
                    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                    <script src="https://unpkg.com/lucide@latest"></script>
                    <style>
                        body { background-color: #0f0f13; display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; margin: 0; }
                        #root { width: 100%; display: flex; justify-content: center; }
                        /* Scrollbar hide */
                        ::-webkit-scrollbar { display: none; }
                    </style>
                </head>
                <body>
                    <div id="root"></div>
                    <script type="text/babel">
                        const { useState, useEffect, useRef } = React;
                        
                        // Icon wrapper dummy (Lucide React imports wont work, so we shim them or ignore)
                        const LucideIcon = ({ name, ...props }) => {
                             return <i data-lucide={name} {...props}></i>;
                        };
                        
                        // Tenta injetar o código do usuário
                        try {
                            ${cleanedCode}
                            
                            // Tenta encontrar o componente para renderizar
                            // A heuristic is: The code likely defines a function with a name like the script Title or generic 'App', 'Component'.
                            // Or we just try to find the last defined function.
                            
                            // Vamos tentar renderizar o primeiro componente funcional encontrado se não tiver nome claro
                            
                            const root = ReactDOM.createRoot(document.getElementById('root'));
                            
                            // Tentar nomes comuns ou o nome do script (camelCase)
                            if (typeof App !== 'undefined') root.render(<App />);
                            else if (typeof Component !== 'undefined') root.render(<Component />);
                            else if (typeof Example !== 'undefined') root.render(<Example />);
                            else {
                                // Fallback: Tenta pegar a última função definida no escopo global (difícil isolar aqui dentro do babel)
                                // Mostrar mensagem de sucesso parcial se não encontrar
                                root.render(
                                    <div className="text-white/50 text-sm font-sans flex flex-col items-center gap-2">
                                       <span>Preview carregado (Componente não detectado)</span>
                                       <span className="text-xs">Certifique-se que seu componente se chame "App" ou "Component"</span>
                                    </div>
                                );
                            }
                        } catch (err) {
                            const root = ReactDOM.createRoot(document.getElementById('root'));
                            root.render(<div className="text-red-400 text-xs p-4">Erro no Preview: {err.message}</div>);
                        }
                    </script>
                    <script>
                        // Inicializa icones lucide globais se usados via tags <i>
                        window.onload = () => {
                            if (window.lucide) window.lucide.createIcons();
                        };
                    </script>
                </body>
                </html>
            `;

            iframeRef.current.srcdoc = htmlContent;
        }
    }, [script.script_content]);

    return (
        <div
            className="group relative flex flex-col bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 cursor-pointer h-[340px]"
            onClick={onView}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 z-20 bg-[#0f0f13]">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider font-medium text-white/40">
                            {script.category || 'Geral'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-hidden relative bg-[#050505] flex items-center justify-center">
                {/* Overlay transparente para capturar clique */}
                <div className="absolute inset-0 z-10 bg-transparent" />

                {/* Iframe Live Preview */}
                <iframe
                    ref={iframeRef}
                    title="Live Preview"
                    className="w-[200%] h-[200%] origin-top-left scale-50 border-none"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0a0a0c] z-20 relative">
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
                    {script.title}
                </h3>
            </div>
        </div>
    );
};

export default ScriptCard;
