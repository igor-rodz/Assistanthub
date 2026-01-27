import React from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import { SANDPACK_FILES, COMMON_DEPENDENCIES } from '@/lib/sandpack-files';

const ScriptCard = ({ script, onView }) => {
    return (
        <div
            className="group relative flex flex-col bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 cursor-pointer h-[400px]"
            onClick={onView}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-[#0f0f13] z-20 border-b border-white/5">
                <span className="text-xs uppercase tracking-wider font-medium text-white/40">
                    {script.category || 'Geral'}
                </span>
            </div>

            {/* Sandpack Preview Area */}
            <div className="flex-1 w-full bg-[#050505] relative overflow-hidden pointer-events-none">
                {/* O pointer-events-none impede interação com o preview na lista, apenas clique no card funciona */}
                <div className="absolute inset-0 z-10 bg-transparent" />

                <Sandpack
                    template="react-ts"
                    theme="dark"
                    files={{
                        ...SANDPACK_FILES,
                        "/App.tsx": script.script_content,
                    }}
                    customSetup={{
                        dependencies: COMMON_DEPENDENCIES
                    }}
                    options={{
                        showNavigator: false,
                        showTabs: false,
                        showEditor: false, // Esconde editor, mostra só preview
                        showConsole: false,
                        classes: {
                            "sp-layout": "!h-full !block",
                            "sp-preview": "!h-full",
                            "sp-preview-iframe": "!h-full !bg-transparent",
                        }
                    }}
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
