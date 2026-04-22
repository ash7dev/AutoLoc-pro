'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Heart, Headphones, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
    {
        icon: ShieldCheck,
        title: 'Sécurité Maximale',
        description: 'Chaque véhicule sur notre plateforme passe par un processus de vérification rigoureux avant d’être listé.',
        color: 'emerald',
    },
    {
        icon: Zap,
        title: 'Réservation Instantanée',
        description: 'Fini les attentes interminables. Réservez votre voiture idéale en quelques secondes, directement depuis votre mobile.',
        color: 'blue',
    },
    {
        icon: Heart,
        title: 'Expérience Humaine',
        description: 'Nous mettons la confiance au cœur de chaque location, avec une communauté de propriétaires passionnés.',
        color: 'rose',
    },
    {
        icon: Headphones,
        title: 'Assistance 24/7',
        description: 'Notre équipe locale est à votre disposition jour et nuit pour vous accompagner durant toute votre location.',
        color: 'amber',
    },
];

export function FeaturesSection() {
    return (
        <section className="px-4 py-20 lg:px-8 lg:py-32 bg-white overflow-hidden">
            <div className="mx-auto max-w-7xl">
                
                {/* Header */}
                <div className="text-center mb-16 lg:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6">
                            Pourquoi choisir <span className="text-emerald-500">AutoLoc ?</span>
                        </h2>
                        <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Nous redéfinissons la mobilité au Sénégal avec une approche centrée sur la qualité, la sécurité et la simplicité.
                        </p>
                    </motion.div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEATURES.map((feature, i) => {
                        const Icon = feature.icon;
                        const colors = {
                            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                            blue: 'bg-blue-50 text-blue-600 border-blue-100',
                            rose: 'bg-rose-50 text-rose-600 border-rose-100',
                            amber: 'bg-amber-50 text-amber-600 border-amber-100',
                        }[feature.color as 'emerald' | 'blue' | 'rose' | 'amber'];

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group relative p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                    colors
                                )}>
                                    <Icon className="w-7 h-7" strokeWidth={2} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    {feature.description}
                                </p>
                                
                                <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider">Inclus par défaut</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
