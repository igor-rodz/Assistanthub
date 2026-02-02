import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
    const faqs = [
        {
            question: 'Como funciona o sistema de créditos?',
            answer: 'Cada correção de erro consome 1 crédito. Com 1.000 créditos por mês, você pode resolver cerca de 30 erros por dia. Se precisar de mais, entre em contato para pacotes personalizados.',
        },
        {
            question: 'Quais linguagens são suportadas?',
            answer: 'Suportamos JavaScript, TypeScript, Python, PHP, Java, C#, Go, Rust, Ruby, Swift, Kotlin, e mais de 50 outras linguagens. Frameworks como React, Next.js, Laravel, Django também são totalmente suportados.',
        },
        {
            question: 'Como faço pra criar minha conta?',
            answer: 'Após o pagamento, você receberá um email com instruções. Basta criar uma conta usando o mesmo email do pagamento e seu acesso será liberado automaticamente.',
        },
        {
            question: 'Posso cancelar a qualquer momento?',
            answer: 'Sim! Não há fidelidade. Você pode cancelar direto na Perfect Pay e seu acesso continua até o fim do período pago.',
        },
        {
            question: 'E se eu não gostar?',
            answer: 'Oferecemos garantia de 7 dias. Se não ficar satisfeito, devolvemos 100% do valor, sem perguntas.',
        },
        {
            question: 'Meu código fica salvo em algum lugar?',
            answer: 'Não. O código é processado em tempo real e imediatamente descartado. Nunca armazenamos seu código em nossos servidores.',
        },
    ];

    return (
        <section className="relative py-24 px-6 bg-black overflow-hidden">
            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-6">
                        FAQ
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Perguntas Frequentes
                    </h2>
                    <p className="text-lg text-zinc-400">
                        Ainda tem dúvidas? A gente responde.
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`rounded-2xl border transition-all duration-300 ${isOpen
                    ? 'bg-zinc-900/80 border-white/10'
                    : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                }`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <span className="text-lg font-medium text-white pr-4">{question}</span>
                <ChevronDown
                    className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'
                    }`}
            >
                <p className="px-6 text-zinc-400 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

export default FAQSection;
