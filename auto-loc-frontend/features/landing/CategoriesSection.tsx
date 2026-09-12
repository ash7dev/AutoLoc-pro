'use client';

/* ════════════════════════════════════════════════════════════════
   CategoriesSection — Desktop Horizontal Category Pill Bar
════════════════════════════════════════════════════════════════ */

import React from 'react';
import { CategoryPillBar } from '@/components/ui/CategoryPillBar';

export function CategoriesSection(): React.ReactElement {
  return (
    <section className="w-full bg-white border-b border-slate-100 py-4" aria-label="Catégories de véhicules">
      <div className="max-w-7xl mx-auto">
        <CategoryPillBar />
      </div>
    </section>
  );
}
