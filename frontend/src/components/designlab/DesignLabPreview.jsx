import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * DesignLabPreview - Sandboxed iframe rendering generated HTML/CSS
 */
const DesignLabPreview = ({ html, css, viewport = 'desktop', zoom = 100 }) => {
    const viewportWidths = {
        desktop: '100%',
        tablet: '768px',
        mobile: '375px'
    };

    const fullHtml = useMemo(() => {
        // Se o agente gerou um HTML completo (novo workflow React/Bolt), usamos diretamente.
        if (html && html.trim().toLowerCase().startsWith('<!doctype html>')) {
            return html;
        }

        // Fallback para workflow antigo ou fragmentos HTML simples
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0a0c;
            color: #fff;
            min-height: 100vh;
            margin: 0;
        }
        ${css || ''}
    </style>
</head>
<body>
    ${html || '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#666;">Nenhum conteúdo gerado</div>'}
</body>
</html>`;
    }, [html, css]);

    const srcDoc = fullHtml;

    return (
        <div className="flex items-center justify-center h-full">
            <div
                className={cn(
                    "bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300",
                    viewport !== 'desktop' && "border-8 border-[#1a1a1f] rounded-[24px]"
                )}
                style={{
                    width: viewportWidths[viewport],
                    maxWidth: '100%',
                    height: viewport === 'mobile' ? '667px' : viewport === 'tablet' ? '1024px' : '100%',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center'
                }}
            >
                <iframe
                    srcDoc={srcDoc}
                    title="Design Preview"
                    className="w-full h-full border-none"
                    sandbox="allow-scripts"
                    style={{
                        minHeight: viewport === 'desktop' ? '600px' : 'auto'
                    }}
                />
            </div>
        </div>
    );
};

export default DesignLabPreview;
