'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  className,
  onClick,
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        'relative px-4 py-2 text-[13px] font-semibold tracking-[0.02em] uppercase transition-all duration-300 rounded-lg flex items-center gap-2 group/navlink',
        isActive
          ? 'text-emerald-700 bg-white shadow-[0_1px_8px_-2px_rgba(16,185,129,0.15)]'
          : 'text-slate-500 hover:text-slate-900 hover:bg-white/60',
        className
      )}
    >
      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="absolute w-3 h-3 rounded-full bg-emerald-400/20 animate-ping" />
        </span>
      )}
      
      {children}
    </Link>
  );
};
