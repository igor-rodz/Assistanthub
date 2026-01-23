import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ConfirmModal - Reusable confirmation dialog
 */
const ConfirmModal = ({
    open,
    onClose,
    onConfirm,
    title = "Confirmar Ação",
    message = "Tem certeza que deseja continuar?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger" // danger, warning, info
}) => {
    if (!open) return null;

    const variantStyles = {
        danger: {
            icon: <AlertTriangle className="text-red-400" size={48} />,
            button: "bg-red-600 hover:bg-red-700 text-white"
        },
        warning: {
            icon: <AlertTriangle className="text-yellow-400" size={48} />,
            button: "bg-yellow-600 hover:bg-yellow-700 text-white"
        },
        info: {
            icon: <AlertTriangle className="text-blue-400" size={48} />,
            button: "bg-blue-600 hover:bg-blue-700 text-white"
        }
    };

    const style = variantStyles[variant] || variantStyles.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {style.icon}
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {title}
                                </h3>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-white/70 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-white/5 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={cn(
                            "px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg",
                            style.button
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
