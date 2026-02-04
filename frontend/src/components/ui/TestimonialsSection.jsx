import React from "react";
import { motion } from "framer-motion";
import { TestimonialsColumn } from "./TestimonialsColumn";

const testimonials = [
    {
        text: "Incrível! Colei um erro de hydration do Next.js e em segundos tive a solução exata. Economizei horas de debug.",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        name: "Lucas Mendes",
        role: "Fullstack Developer",
    },
    {
        text: "Uso diariamente no deploy da Vercel. Erros de build que antes travavam meu dia agora resolvem em minutos.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        name: "Carla Santos",
        role: "Frontend Lead",
    },
    {
        text: "O melhor investimento que fiz. A IA realmente entende o contexto do erro e sugere correções certeiras.",
        image: "https://randomuser.me/api/portraits/men/67.jpg",
        name: "Rafael Costa",
        role: "Tech Lead",
    },
    {
        text: "Trabalho com Supabase e os erros de RLS eram um pesadelo. Agora é só colar e corrigir. Fantástico!",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        name: "Marina Oliveira",
        role: "Backend Developer",
    },
    {
        text: "Como dev júnior, essa ferramenta me ajuda a aprender muito. Cada correção vem com explicação clara.",
        image: "https://randomuser.me/api/portraits/men/22.jpg",
        name: "Pedro Almeida",
        role: "Jr. Developer",
    },
    {
        text: "Integrei no workflow do meu time. Reduzimos tempo de debug em 70%. ROI absurdo.",
        image: "https://randomuser.me/api/portraits/women/29.jpg",
        name: "Fernanda Lima",
        role: "Engineering Manager",
    },
    {
        text: "Erros de TypeScript complexos? Só colar aqui. A resposta é sempre precisa e bem formatada.",
        image: "https://randomuser.me/api/portraits/men/45.jpg",
        name: "Bruno Ferreira",
        role: "Senior Developer",
    },
    {
        text: "Uso para erros de API, banco de dados, frontend... Funciona com tudo. Virou ferramenta essencial.",
        image: "https://randomuser.me/api/portraits/women/52.jpg",
        name: "Amanda Rocha",
        role: "Software Engineer",
    },
    {
        text: "Recomendo para todos os devs. A qualidade das respostas é muito superior a simplesmente perguntar ao ChatGPT.",
        image: "https://randomuser.me/api/portraits/men/75.jpg",
        name: "Thiago Nascimento",
        role: "CTO",
    },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsSection = () => {
    return (
        <section className="py-24 relative z-10 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-xl mx-auto mb-12"
                >
                    <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 py-1.5 px-4 rounded-full mb-6">
                        <span className="text-emerald-400 text-sm font-medium">Depoimentos</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-center">
                        O que nossos devs dizem
                    </h2>
                    <p className="text-center mt-4 text-zinc-400 text-lg">
                        Junte-se a milhares de desenvolvedores que já otimizaram seu debug.
                    </p>
                </motion.div>

                <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[700px] overflow-hidden">
                    <TestimonialsColumn testimonials={firstColumn} duration={15} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
