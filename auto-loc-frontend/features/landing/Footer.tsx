'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin, Mail, Phone, ArrowRight,
  Shield, Zap, Star, CheckCircle2,
  Instagram, Twitter, Facebook, Youtube,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  plateforme: [
    { label: 'Explorer les véhicules', href: '/explorer' },
    { label: 'Comment ça marche',      href: '/how-it-works' },
    { label: 'Devenir hôte',           href: '/become-host' },
    { label: 'Espace propriétaire',    href: '/dashboard/owner' },
  ],
  zones: [
    { label: 'Almadies – Ngor – Mamelles',              href: '/explorer?zone=almadies-ngor-mamelles'     },
    { label: 'Ouakam – Yoff',                           href: '/explorer?zone=ouakam-yoff'                },
    { label: 'Mermoz – Sacré-Cœur – Cité Keur Gorgui', href: '/explorer?zone=mermoz-sacrecoeur-ckg'      },
    { label: 'Plateau – Médina – Gueule Tapée',         href: '/explorer?zone=plateau-medina-gueuletapee' },
    { label: 'Liberté – Sicap – Grand Dakar',           href: '/explorer?zone=liberte-sicap-granddakar'   },
    { label: 'Parcelles Assainies – Grand Yoff',        href: '/explorer?zone=parcelles-grandyoff'        },
    { label: 'Pikine – Guédiawaye',                     href: '/explorer?zone=pikine-guediawaye'          },
    { label: 'Keur Massar – Rufisque',                  href: '/explorer?zone=keurmassar-rufisque'        },
  ],
  legal: [
    { label: "Conditions d'utilisation",     href: '/legal/terms' },
    { label: 'Politique de confidentialité', href: '/legal/privacy' },
    { label: 'Politique de cookies',         href: '/legal/cookies' },
    { label: 'Mentions légales',             href: '/legal/mentions' },
  ],
};

const TRUST_BADGES = [
  { icon: Shield,       label: 'Véhicules vérifiés'      },
  { icon: Zap,          label: 'Réservation instantanée' },
  { icon: Star,         label: 'Noté 4.9/5'              },
  { icon: CheckCircle2, label: 'Paiement sécurisé'       },
];

const SOCIALS = [
  { icon: Instagram, href: 'https://instagram.com/autoloc', label: 'Instagram' },
  { icon: Facebook,  href: 'https://facebook.com/autoloc',  label: 'Facebook'  },
  { icon: Twitter,   href: 'https://twitter.com/autoloc',   label: 'Twitter'   },
];

// ─── Newsletter ───────────────────────────────────────────────────────────────
function NewsletterForm(): React.ReactElement {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 mt-4">
      <input
        type="email"
        placeholder="votre@email.com"
        className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5
          px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-white/25
          focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-400/30
          transition-all duration-200"
      />
      <button
        type="submit"
        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl
          bg-emerald-400/10 border border-emerald-400/30
          px-4 py-2.5 text-[13px] font-semibold text-emerald-400
          hover:bg-emerald-400 hover:text-black hover:border-emerald-400
          hover:-translate-y-px active:translate-y-0
          shadow-md shadow-black/20 hover:shadow-emerald-400/20
          transition-all duration-200"
      >
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </form>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer(): React.ReactElement {
  return (
    <footer className="mt-8">
      <div className="bg-black rounded-t-[2rem] overflow-hidden">

        {/* ── Trust badges bar — desktop only ── */}
        <div className="hidden lg:block border-b border-white/5 px-5 py-4 lg:px-16">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-between">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg
                  bg-emerald-400/10 border border-emerald-400/20">
                  <Icon className="h-3 w-3 text-emerald-400" strokeWidth={2} />
                </span>
                <span className="text-[12px] font-semibold text-white/50 tracking-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contenu principal ── */}
        <div className="px-5 py-10 lg:px-16 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">

            {/* Col 1 — Brand + newsletter */}
            <div className="flex flex-col gap-6">
              <Link href="/" className="group inline-block w-fit">
                <Image
                  src="/logoAutoLoc.jpg"
                  alt="AutoLoc"
                  width={52}
                  height={52}
                  className="object-contain rounded-xl group-hover:opacity-80 transition-opacity duration-200"
                />
              </Link>

              <div>
                <p className="text-[22px] font-black tracking-tight text-white leading-snug">
                  La location de véhicules{' '}
                  <span className="text-emerald-400">simplifiée.</span>
                </p>
                <p className="mt-2 text-[13px] font-medium text-white/35 leading-relaxed max-w-xs">
                  Des milliers de véhicules vérifiés partout au Sénégal.
                  Réservez en quelques clics, conduisez sereinement.
                </p>
              </div>

              <div className="hidden lg:block">
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-white/30 mb-1">
                  Restez informé
                </p>
                <p className="text-[12.5px] text-white/40 font-medium">
                  Recevez les meilleures offres et nouveautés.
                </p>
                <NewsletterForm />
              </div>

              <div className="flex items-center gap-2">
                {SOCIALS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center w-9 h-9 rounded-xl
                      border border-white/10 text-white/30
                      hover:border-emerald-400/40 hover:text-emerald-400 hover:bg-emerald-400/5
                      transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 — Plateforme — desktop only */}
            <div className="hidden lg:block">
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-white/25 mb-5">
                Plateforme
              </p>
              <ul className="space-y-3">
                {FOOTER_LINKS.plateforme.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[13.5px] font-medium text-white/50
                        hover:text-emerald-400 transition-colors duration-150 tracking-tight"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Contact */}
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-white/25 mb-5">
                Contact
              </p>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:contact@autoloc.sn"
                    className="flex items-center gap-2 text-[13.5px] font-medium text-white/50
                      hover:text-emerald-400 transition-colors duration-150 group"
                  >
                    <Mail className="h-3.5 w-3.5 text-white/20 group-hover:text-emerald-400/60 transition-colors duration-150" strokeWidth={1.75} />
                    contact@autoloc.sn
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+221338001234"
                    className="flex items-center gap-2 text-[13.5px] font-medium text-white/50
                      hover:text-emerald-400 transition-colors duration-150 group"
                  >
                    <Phone className="h-3.5 w-3.5 text-white/20 group-hover:text-emerald-400/60 transition-colors duration-150" strokeWidth={1.75} />
                    +221 33 800 12 34
                  </a>
                </li>
                <li className="flex items-start gap-2 text-[13.5px] font-medium text-white/35">
                  <MapPin className="h-3.5 w-3.5 text-white/20 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                  Dakar, Sénégal
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/5 px-8 py-5 lg:px-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[12px] font-medium text-white/25 tracking-tight">
              © {new Date().getFullYear()} AutoLoc. Tous droits réservés.
            </p>

            <div className="grid grid-cols-2 gap-x-5 gap-y-2 lg:flex lg:flex-wrap lg:items-center">
              {FOOTER_LINKS.legal.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[11.5px] font-medium text-white/25
                    hover:text-white/60 transition-colors duration-150 tracking-tight"
                >
                  {label}
                </Link>
              ))}
            </div>

            <p className="hidden lg:block text-[11.5px] font-medium text-white/20 tracking-tight">
              Conçu avec <span className="text-emerald-400/60">♥</span> au Sénégal
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
