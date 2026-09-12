'use client';

/* ════════════════════════════════════════════════════════════════
   MobileCategoriesCarousel — Mobile Horizontal Category Pill Bar
════════════════════════════════════════════════════════════════ */

import React from 'react';
import { CategoryPillBar } from '@/components/ui/CategoryPillBar';

export function MobileCategoriesCarousel(): React.ReactElement {
  return (
    <div className="w-full bg-white py-1">
      <CategoryPillBar className="py-2" />
    </div>
  );
}
