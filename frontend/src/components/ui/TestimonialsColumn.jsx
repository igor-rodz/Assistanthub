import React from "react";
import { motion } from "framer-motion";

export const TestimonialsColumn = ({ className, testimonials, duration = 10 }) => {
    return (
        <div className={className}>
            <motion.div
                animate={{
                    translateY: "-50%",
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-6 pb-6"
            >
                {[...new Array(2).fill(0).map((_, index) => (
                    <React.Fragment key={index}>
                        {testimonials.map(({ text, image, name, role }, i) => (
                            <div
                                className="p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm shadow-lg shadow-emerald-500/5 max-w-xs w-full mx-auto"
                                key={i}
                            >
                                <div className="text-white/80 text-sm leading-relaxed">{text}</div>
                                <div className="flex items-center gap-3 mt-5">
                                    <img
                                        width={40}
                                        height={40}
                                        src={image}
                                        alt={name}
                                        className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500/30"
                                    />
                                    <div className="flex flex-col">
                                        <div className="font-medium tracking-tight leading-5 text-white">{name}</div>
                                        <div className="leading-5 text-emerald-400/60 text-sm tracking-tight">{role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))]}
            </motion.div>
        </div>
    );
};

export default TestimonialsColumn;
