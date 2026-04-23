'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
    {
        question: 'Comment réserver un véhicule sur AutoLoc ?',
        answer:
            'C\'est très simple ! Parcourez les véhicules disponibles, choisissez vos dates de location, puis cliquez sur "Réserver". Vous recevrez une confirmation instantanée par email et SMS.',
    },
    {
        question: 'Quels documents sont nécessaires pour louer ?',
        answer:
            'Vous aurez besoin d\'une pièce d\'identité valide (CNI ou passeport), d\'un permis de conduire en cours de validité, et d\'un justificatif de domicile.',
    },
    {
        question: 'Puis-je annuler ma réservation ?',
        answer:
            'Oui, vous pouvez annuler jusqu\'à 24h avant la prise en charge pour un remboursement complet. Consultez nos conditions pour plus de détails.',
    },
    {
        question: 'Comment sont vérifiés les locataires ?',
        answer:
            'Chaque locataire doit soumettre une pièce d\'identité valide et un permis de conduire avant de pouvoir effectuer une réservation.',
    },
    {
        question: 'Comment devenir propriétaire sur AutoLoc ?',
        answer:
            'Inscrivez-vous, ajoutez votre véhicule avec photos et documents, et notre équipe le vérifiera sous 24h. C\'est simple et gratuit !',
    },
];

// ─── Accordion item ───────────────────────────────────────────────────────────
function FAQItem({
    item,
    isOpen,
    onToggle,
    index,
}: {
    item: (typeof FAQ_ITEMS)[0];
    isOpen: boolean;
    onToggle: () => void;
    index: number;
}) {
    return (
        <div className="group relative">
            {/* Number Watermark (Emerald Clear) */}
            <span className={cn(
                "absolute -top-4 -left-4 text-[60px] font-black leading-none select-none pointer-events-none transition-all duration-500",
                isOpen ? "text-emerald-400/20 translate-x-2" : "text-slate-100 opacity-0 group-hover:opacity-100"
            )}>
                0{index + 1}
            </span>

            <div
                className={cn(
                    'relative overflow-hidden transition-all duration-500 border',
                    isOpen
                        ? 'bg-black border-emerald-400/20 shadow-2xl z-10'
                        : 'bg-white border-slate-200 hover:border-emerald-400/30 shadow-sm',
                    isOpen 
                        ? 'rounded-tl-none rounded-br-none rounded-tr-[3rem] rounded-bl-[3rem]' 
                        : 'rounded-2xl'
                )}
                style={isOpen ? { clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' } : {}}
            >
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex items-center justify-between gap-4 w-full px-8 py-6 text-left"
                >
                    <span
                        className={cn(
                            'text-[16px] font-black tracking-tight transition-colors duration-300',
                            isOpen ? 'text-emerald-400' : 'text-slate-900',
                        )}
                    >
                        {item.question}
                    </span>
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                        isOpen ? "bg-emerald-400 text-black rotate-180" : "bg-slate-100 text-slate-400"
                    )}>
                        <ChevronDown className="h-4 w-4" strokeWidth={3} />
                    </div>
                </button>

                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                            <div className="px-8 pb-8">
                                <div className="h-[1px] w-12 bg-emerald-400/30 mb-6" />
                                <p className="text-[15px] font-medium leading-relaxed text-white/40">
                                    {item.answer}
                                </p>
                                <div className="mt-8 flex items-center gap-2 text-emerald-400 font-bold text-[13px] cursor-pointer hover:gap-3 transition-all">
                                    En savoir plus <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function FAQSection(): React.ReactElement {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="px-4 py-24 lg:px-8 lg:py-32 bg-[#F8FAFC]" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                
                {/* Left Header - Fixed-like on desktop */}
                <div className="lg:col-span-5 lg:sticky lg:top-32">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-4 py-1.5 mb-6">
                            <HelpCircle className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                                Questions fréquentes
                            </span>
                        </div>
                        <h2
                            id="faq-heading"
                            className="text-4xl font-black tracking-tight text-slate-900 leading-[1.1] lg:text-6xl"
                        >
                            Tout savoir sur <span className="text-emerald-500 italic">AutoLoc</span>
                        </h2>
                        <p className="mt-6 text-[17px] font-medium leading-relaxed text-slate-500 max-w-md">
                            Vous avez des questions ? Nous avons les réponses. Si vous ne trouvez pas ce que vous cherchez, contactez notre support.
                        </p>
                        
                        <div className="mt-10 p-8 rounded-[2.5rem] bg-black text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-3xl" />
                            <h4 className="text-[18px] font-black mb-2">Besoin d&apos;aide directe ?</h4>
                            <p className="text-white/40 text-[14px] mb-6">Notre équipe support est disponible 7j/7 pour vous accompagner.</p>
                            <button className="flex items-center gap-3 bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold text-[14px] hover:bg-emerald-400 transition-all">
                                Nous contacter <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Accordion */}
                <div className="lg:col-span-7 flex flex-col gap-5">
                    {FAQ_ITEMS.map((item, i) => (
                        <FAQItem
                            key={i}
                            item={item}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                            index={i}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
