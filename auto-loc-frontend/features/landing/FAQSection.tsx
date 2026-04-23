'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
    {
        question: 'Comment réserver un véhicule sur AutoLoc ?',
        answer:
            'C\'est très simple ! Parcourez les véhicules disponibles, choisissez vos dates de location, puis cliquez sur "Réserver". Vous recevrez une confirmation instantanée par email et SMS. Le propriétaire vous contactera pour organiser la remise des clés.',
    },
    {
        question: 'Quels documents sont nécessaires pour louer ?',
        answer:
            'Vous aurez besoin d\'une pièce d\'identité valide (CNI ou passeport), d\'un permis de conduire en cours de validité, et d\'un justificatif de domicile. Tous les documents peuvent être vérifiés directement depuis l\'application.',
    },
    {
        question: 'Puis-je annuler ma réservation ?',
        answer:
            'Oui, vous pouvez annuler jusqu\'à 24h avant la prise en charge pour un remboursement complet. Entre 24h et 6h avant, un remboursement partiel de 70% est appliqué. En dessous de 6h, des frais d\'annulation s\'appliquent. Consultez nos conditions pour plus de détails.',
    },
    {
        question: 'Comment sont vérifiés les locataires ?',
        answer:
            'Chaque locataire doit soumettre une pièce d\'identité valide et un permis de conduire avant de pouvoir effectuer une réservation. Notre équipe valide les documents et attribue un profil de confiance basé sur les avis laissés après chaque location.',
    },
    {
        question: 'Quels modes de paiement sont acceptés ?',
        answer:
            'Nous acceptons les paiements par carte bancaire (Visa, Mastercard), Orange Money, Wave, et les virements bancaires. Le paiement est sécurisé et l\'argent est conservé en séquestre jusqu\'à la fin de la location.',
    },
    {
        question: 'Comment devenir propriétaire sur AutoLoc ?',
        answer:
            'Inscrivez-vous, ajoutez votre véhicule avec photos et documents, et notre équipe le vérifiera sous 24h. Une fois approuvé, votre annonce sera visible. Vous fixez vos prix, vos disponibilités, et nous gérons le reste. C\'est gratuit !',
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={cn(
                'rounded-2xl border overflow-hidden transition-all duration-300',
                isOpen
                    ? 'bg-black border-emerald-400/20 shadow-lg shadow-emerald-400/5'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md',
            )}
        >
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center justify-between gap-4 w-full px-6 py-5 text-left"
                aria-expanded={isOpen}
            >
                <span
                    className={cn(
                        'text-[15px] font-bold tracking-tight transition-colors duration-200',
                        isOpen ? 'text-emerald-400' : 'text-black',
                    )}
                >
                    {item.question}
                </span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 flex-shrink-0 transition-all duration-300',
                        isOpen ? 'rotate-180 text-emerald-400' : 'text-black/30',
                    )}
                    strokeWidth={2.5}
                />
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <p
                            className={cn(
                                'px-6 pb-5 text-[14px] font-medium leading-relaxed',
                                isOpen ? 'text-white/55' : 'text-black/50',
                            )}
                        >
                            {item.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function FAQSection(): React.ReactElement {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="px-4 py-20 lg:px-8 lg:py-28" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-5">
                        <HelpCircle className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                            FAQ
                        </span>
                    </div>
                    <h2
                        id="faq-heading"
                        className="text-4xl font-black tracking-tight text-black leading-tight lg:text-5xl"
                    >
                        Questions <span className="text-emerald-400">fréquentes</span>
                    </h2>
                    <p className="mt-4 mx-auto max-w-md text-[15px] font-medium leading-relaxed text-black/40">
                        Tout ce que vous devez savoir avant de réserver. Pas de surprises.
                    </p>
                </motion.div>

                {/* Accordion */}
                <div className="flex flex-col gap-3">
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
