import React from 'react';
import { Loader2, X } from 'lucide-react';

/**
 * DesignLabGenerating - Loading state with progressive messages
 */
const DesignLabGenerating = ({ messages = [], onCancel }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 relative">
            {/* Background effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" />
            </div>

            {/* Spinner */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                </div>
            </div>

            {/* Title */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Criando seu design...</h2>
                <p className="text-white/50">Isso pode levar alguns segundos</p>
            </div>

            {/* Progressive messages */}
            <div className="flex flex-col items-center gap-2 min-h-[120px]">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 text-white/70 animate-in fade-in slide-in-from-bottom-2 duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className={`w-2 h-2 rounded-full ${index === messages.length - 1 ? 'bg-purple-400 animate-pulse' : 'bg-green-400'}`} />
                        <span className={index === messages.length - 1 ? 'text-white' : 'text-white/50'}>
                            {msg}
                        </span>
                    </div>
                ))}
            </div>

            {/* Cancel button */}
            <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
                <X size={16} />
                Cancelar
            </button>
        </div>
    );
};

export default DesignLabGenerating;
