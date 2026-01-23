import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    Code2,
    Palette,
    Layers,
    Rocket,
} from "lucide-react";

function useAutoResizeTextarea({ minHeight, maxHeight }) {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(
        (reset) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`; // reset first
            const newHeight = Math.max(
                minHeight,
                Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
            );
            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
    }, [minHeight]);

    return { textareaRef, adjustHeight };
}

function QuickAction({ icon, label }) {
    return (
        <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-700"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </Button>
    );
}

export default function RuixenMoonChat() {
    const [message, setMessage] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 48,
        maxHeight: 150,
    });

    return (
        <div
            className="relative w-full h-screen bg-cover bg-center flex flex-col items-center"
            style={{
                backgroundImage:
                    "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
                backgroundAttachment: "fixed",
            }}
        >
            {/* Centered AI Title */}
            <div className="flex-1 w-full flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-semibold text-white drop-shadow-sm">
                        Design Lab AI
                    </h1>
                    <p className="mt-2 text-neutral-200">
                        Crie interfaces incríveis — comece digitando abaixo.
                    </p>
                </div>
            </div>

            {/* Input Box Section */}
            <div className="w-full max-w-3xl mb-[20vh]">
                <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            adjustHeight();
                        }}
                        placeholder="Descreva o que você quer criar..."
                        className={cn(
                            "w-full px-4 py-3 resize-none border-none",
                            "bg-transparent text-white text-sm",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-neutral-400 min-h-[48px]"
                        )}
                        style={{ overflow: "hidden" }}
                    />

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-between p-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-neutral-700"
                        >
                            <Paperclip className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button
                                disabled
                                className={cn(
                                    "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                                    "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                )}
                            >
                                <ArrowUpIcon className="w-4 h-4" />
                                <span className="sr-only">Enviar</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-center flex-wrap gap-3 mt-6">
                    <QuickAction icon={<Code2 className="w-4 h-4" />} label="Gerar Código" />
                    <QuickAction icon={<Rocket className="w-4 h-4" />} label="Lançar App" />
                    <QuickAction icon={<Layers className="w-4 h-4" />} label="Componentes" />
                    <QuickAction icon={<Palette className="w-4 h-4" />} label="Temas" />
                    <QuickAction icon={<CircleUserRound className="w-4 h-4" />} label="Dashboard" />
                    <QuickAction icon={<MonitorIcon className="w-4 h-4" />} label="Landing Page" />
                    <QuickAction icon={<FileUp className="w-4 h-4" />} label="Upload" />
                    <QuickAction icon={<ImageIcon className="w-4 h-4" />} label="Imagens" />
                </div>
            </div>
        </div>
    );
}
