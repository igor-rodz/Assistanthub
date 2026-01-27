import React from 'react';
import './ai-loader.css';

export const AiLoader = ({ size = 180, text = "Generating" }) => {
    const letters = text.split("");

    return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-b from-[#1a3379] via-[#0f172a] to-black">
            <div
                className="relative flex items-center justify-center font-inter select-none"
                style={{ width: size, height: size }}
            >

                {letters.map((letter, index) => (
                    <span
                        key={index}
                        className="inline-block text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-loaderLetter"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {letter}
                    </span>
                ))}

                <div
                    className="absolute inset-0 rounded-full animate-loaderCircle"
                ></div>
            </div>
        </div>
    );
};
