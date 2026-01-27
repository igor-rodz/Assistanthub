import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils'; // Import do projeto real, mas vamos simular no iframe

/**
 * ScriptCard com Live Preview Inteligente (Auto-Mocking)
 */
const ScriptCard = ({ script, onView }) => {
    const iframeRef = useRef(null);

    // Função para limpar e preparar o código para o preview isolado
    const prepareCode = (rawCode) => {
        if (!rawCode) return '';

        // 1. Remove imports que quebrariam o navegador
        let code = rawCode
            .replace(/import .* from .*;/g, '')
            .replace(/import .* from .*/g, '')
            .replace(/"use client";/g, '')
            .replace(/"use client"/g, '');

        // 2. Transforma exports em declarações locais
        code = code
            .replace(/export default function/g, 'function')
            .replace(/export default const/g, 'const')
            .replace(/export function/g, 'function')
            .replace(/export const/g, 'const');

        // 3. Remove declaração de types (Typescript básico removal)
        // Isso é regex simples, não pega tudo, mas ajuda com interfaces básicas
        code = code.replace(/interface .* {[\s\S]*?}/g, '');
        code = code.replace(/type .* = .*;/g, '');
        code = code.replace(/: \w+/g, ''); // Tenta remover type annotations simples (risky but helps)

        return code;
    };

    useEffect(() => {
        if (iframeRef.current && script.script_content) {
            const cleanedCode = prepareCode(script.script_content);

            // Verifica se tem potencial para ser React
            const isReact = cleanedCode.includes('return') || cleanedCode.includes('=>');
            if (!isReact) return;

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <!-- Tailwind CSS (Full CDN) -->
                    <script src="https://cdn.tailwindcss.com"></script>
                    
                    <!-- React & DOM -->
                    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
                    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
                    
                    <!-- Babel para compilar JSX on-the-fly -->
                    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                    
                    <!-- Lucide Icons (Global) -->
                    <script src="https://unpkg.com/lucide@latest"></script>
                    
                    <script>
                        // CONFIGURAÇÃO DO TAILWIND
                        tailwind.config = {
                            theme: {
                                extend: {
                                    colors: {
                                        border: "hsl(var(--border))",
                                        input: "hsl(var(--input))",
                                        ring: "hsl(var(--ring))",
                                        background: "hsl(var(--background))",
                                        foreground: "hsl(var(--foreground))",
                                        primary: {
                                            DEFAULT: "hsl(var(--primary))",
                                            foreground: "hsl(var(--primary-foreground))",
                                        },
                                        secondary: {
                                            DEFAULT: "hsl(var(--secondary))",
                                            foreground: "hsl(var(--secondary-foreground))",
                                        },
                                        destructive: {
                                            DEFAULT: "hsl(var(--destructive))",
                                            foreground: "hsl(var(--destructive-foreground))",
                                        },
                                        muted: {
                                            DEFAULT: "hsl(var(--muted))",
                                            foreground: "hsl(var(--muted-foreground))",
                                        },
                                        accent: {
                                            DEFAULT: "hsl(var(--accent))",
                                            foreground: "hsl(var(--accent-foreground))",
                                        },
                                        popover: {
                                            DEFAULT: "hsl(var(--popover))",
                                            foreground: "hsl(var(--popover-foreground))",
                                        },
                                        card: {
                                            DEFAULT: "hsl(var(--card))",
                                            foreground: "hsl(var(--card-foreground))",
                                        },
                                    },
                                    borderRadius: {
                                        lg: "var(--radius)",
                                        md: "calc(var(--radius) - 2px)",
                                        sm: "calc(var(--radius) - 4px)",
                                    },
                                },
                            },
                        }
                    </script>

                    <style>
                        /* Variáveis CSS baseadas no ShadCN Dark Mode padrão */
                        :root {
                            --background: 222.2 84% 4.9%;
                            --foreground: 210 40% 98%;
                            --card: 222.2 84% 4.9%;
                            --card-foreground: 210 40% 98%;
                            --popover: 222.2 84% 4.9%;
                            --popover-foreground: 210 40% 98%;
                            --primary: 210 40% 98%;
                            --primary-foreground: 222.2 47.4% 11.2%;
                            --secondary: 217.2 32.6% 17.5%;
                            --secondary-foreground: 210 40% 98%;
                            --muted: 217.2 32.6% 17.5%;
                            --muted-foreground: 215 20.2% 65.1%;
                            --accent: 217.2 32.6% 17.5%;
                            --accent-foreground: 210 40% 98%;
                            --destructive: 0 62.8% 30.6%;
                            --destructive-foreground: 210 40% 98%;
                            --border: 217.2 32.6% 17.5%;
                            --input: 217.2 32.6% 17.5%;
                            --ring: 212.7 26.8% 83.9%;
                            --radius: 0.5rem;
                        }
                        body { background-color: transparent; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; color: white; font-family: sans-serif; overflow: hidden; }
                        #root { width: 100%; display: flex; justify-content: center; padding: 20px; }
                        /* Esconder barras de rolagem */
                        ::-webkit-scrollbar { width: 0; }
                    </style>
                </head>
                <body>
                    <div id="root"></div>
                    
                    <script type="text/babel">
                        const { useState, useEffect, useRef, useMemo, useCallback } = React;
                        
                        // --- MOCKS IMPORTANTES (Isso faz o código funcionar) ---
                        
                        // 1. cn() utility (Simples junção de classes para preview)
                        const cn = (...inputs) => inputs.filter(Boolean).join(' ');
                        
                        // 2. Componentes UI Comuns (Button, Input, Card...) - Mocks genéricos
                        // Se o código tentar usar <Button>, ele vai cair e quebrar se não definirmos.
                        // Mas como removemos os imports, o babel vai achar que Button é uma variável indefinida.
                        // Definimos no escopo global.
                        
                        const Button = ({className, children, ...props}) => <button className={cn("px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md", className)} {...props}>{children}</button>;
                        const Card = ({className, children, ...props}) => <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}>{children}</div>;
                        const Input = ({className, ...props}) => <input className={cn("flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm", className)} {...props} />;
                        const Badge = ({className, children, ...props}) => <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80", className)} {...props}>{children}</div>;
                        
                        // --- FIM DOS MOCKS ---

                        // INJEÇÃO DO CÓDIGO DO USUÁRIO
                        try {
                            ${cleanedCode}
                            
                            // TENTATIVA DE RENDERIZAÇÃO
                            const root = ReactDOM.createRoot(document.getElementById('root'));
                            
                            // Heurística: Tentar encontrar o componente principal
                            if (typeof App !== 'undefined') root.render(<App />);
                            else if (typeof Component !== 'undefined') root.render(<Component />);
                            else if (typeof Example !== 'undefined') root.render(<Example />);
                            else if (typeof Page !== 'undefined') root.render(<Page />);
                            else if (typeof Card !== 'undefined' && "${cleanedCode}".includes('function Card')) root.render(<Card />); // Só se o user redefiniu Card
                            else {
                                // Tentar pegar a última função definida (hacky)
                                root.render(
                                    <div className="text-center text-white/50 text-xs mt-10">
                                        <p>Preview aguardando...</p>
                                        <p>Certifique-se que o componente principal se chame <b>App</b> ou <b>Component</b></p>
                                    </div>
                                );
                            }
                        } catch (err) {
                            console.error(err);
                            const root = ReactDOM.createRoot(document.getElementById('root'));
                            root.render(<div className="text-red-400 text-[10px] p-2">Erro: {err.message}</div>);
                        }
                    </script>
                    
                    <script>
                        // Inicializa ícones Lucide após render
                        setTimeout(() => {
                            if (window.lucide) window.lucide.createIcons();
                        }, 500);
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
            <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-[#0f0f13] to-transparent pointer-events-none">
                <span className="text-xs uppercase tracking-wider font-medium text-white/40">
                    {script.category || 'Geral'}
                </span>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-hidden relative bg-[#050505] flex items-center justify-center">
                <div className="absolute inset-0 z-10 bg-transparent" />
                <iframe
                    ref={iframeRef}
                    title="Live Preview"
                    className="w-[200%] h-[200%] origin-top-left scale-50 border-none bg-transparent"
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
