'use client';

import React from 'react';
import { motion } from 'framer-motion';

const BRANDS = [
    'TOYOTA', 'MERCEDES-BENZ', 'LAND ROVER', 'BMW', 'HYUNDAI', 'KIA', 'MITSUBISHI', 'FORD', 'NISSAN', 'VOLKSWAGEN'
];

export function BrandMarquee() {
    // Double the brands for seamless infinite scroll
    const brandsList = [...BRANDS, ...BRANDS, ...BRANDS];

    return (
        <div className="py-10 bg-slate-950 overflow-hidden border-y border-white/5">
            <div className="flex whitespace-nowrap">
                <motion.div 
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="flex items-center gap-16 lg:gap-32 pr-16 lg:pr-32"
                >
                    {brandsList.map((brand, i) => (
                        <span 
                            key={`${brand}-${i}`}
                            className="text-2xl lg:text-4xl font-black text-white/10 hover:text-white/30 transition-colors tracking-[0.2em] cursor-default"
                        >
                            {brand}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
