import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * AnimatedText - Componente de texto animado com efeito letra por letra
 * @param {string} text - Texto a ser animado
 * @param {number} duration - Duração do stagger entre letras (default: 0.05)
 * @param {number} delay - Delay inicial (default: 0.1)
 * @param {boolean} replay - Se deve animar (default: true)
 * @param {string} className - Classes do container
 * @param {string} textClassName - Classes do texto
 * @param {string} underlineClassName - Classes do underline
 * @param {string} as - Elemento HTML (h1, h2, h3, h4, h5, h6, p, span)
 * @param {string} underlineGradient - Gradiente do underline
 * @param {string} underlineHeight - Altura do underline
 * @param {string} underlineOffset - Offset do underline
 */
const AnimatedText = React.forwardRef(({
    text,
    duration = 0.05,
    delay = 0.1,
    replay = true,
    className,
    textClassName,
    underlineClassName,
    as: Component = "h1",
    underlineGradient = "from-cyan-400 via-emerald-400 to-teal-400",
    underlineHeight = "h-1",
    underlineOffset = "-bottom-2",
    showUnderline = true,
    ...props
}, ref) => {
    const letters = Array.from(text)

    const container = {
        hidden: {
            opacity: 0
        },
        visible: (i = 1) => ({
            opacity: 1,
            transition: {
                staggerChildren: duration,
                delayChildren: i * delay
            }
        })
    }

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200
            }
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 200
            }
        }
    }

    const lineVariants = {
        hidden: {
            width: "0%",
            left: "50%"
        },
        visible: {
            width: "100%",
            left: "0%",
            transition: {
                delay: letters.length * duration + delay,
                duration: 0.8,
                ease: "easeOut"
            }
        }
    }

    return (
        <div
            ref={ref}
            className={cn("flex flex-col items-center justify-center gap-2", className)}
            {...props}
        >
            <div className="relative">
                <motion.div
                    style={{ display: "flex", overflow: "hidden" }}
                    variants={container}
                    initial="hidden"
                    animate={replay ? "visible" : "hidden"}
                    className={cn("text-4xl font-bold text-center", textClassName)}
                >
                    {letters.map((letter, index) => (
                        <motion.span key={index} variants={child}>
                            {letter === " " ? "\u00A0" : letter}
                        </motion.span>
                    ))}
                </motion.div>

                {showUnderline && (
                    <motion.div
                        variants={lineVariants}
                        initial="hidden"
                        animate="visible"
                        className={cn(
                            "absolute",
                            underlineHeight,
                            underlineOffset,
                            "bg-gradient-to-r",
                            underlineGradient,
                            "rounded-full",
                            underlineClassName
                        )}
                    />
                )}
            </div>
        </div>
    )
})

AnimatedText.displayName = "AnimatedText"

export { AnimatedText }
