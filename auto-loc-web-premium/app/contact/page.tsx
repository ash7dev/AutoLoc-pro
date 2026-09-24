'use client';

import React, { useEffect } from 'react';
import { ContactHeroSection } from '@/src/features/contact/components/ContactHeroSection';
import { ContactChannelsGrid } from '@/src/features/contact/components/ContactChannelsGrid';
import { ContactForm } from '@/src/features/contact/components/ContactForm';
import { ContactFaqSection } from '@/src/features/contact/components/ContactFaqSection';
import { ContactLocationCard } from '@/src/features/contact/components/ContactLocationCard';

export default function ContactPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-[calc(1.5rem+env(safe-area-inset-top))] sm:pt-8 lg:pt-36 pb-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* 1. Hero */}
        <ContactHeroSection />

        {/* 2. Contact channels (Téléphone, WhatsApp, E-mail) */}
        <ContactChannelsGrid />

        {/* 3. Two-column: Form + Sidebar (FAQ + Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form takes up 7 columns */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Sidebar takes up 5 columns */}
          <div className="lg:col-span-5 space-y-8">
            <ContactFaqSection />
            <ContactLocationCard />
          </div>
        </div>
      </div>
    </div>
  );
}
